// Онлайн-оплата заказов KACH: Stripe (карта) и PayPal.
// Секреты (Supabase → Edge Functions → Secrets):
//   STRIPE_SECRET_KEY      — sk_test_... (тест) или sk_live_... (боевой)
//   STRIPE_WEBHOOK_SECRET  — whsec_... (необязательно, для надёжной отметки «оплачен»)
//   PAYPAL_CLIENT_ID, PAYPAL_SECRET — из PayPal Developer → Apps & Credentials
//   PAYPAL_ENV             — "sandbox" (тест, по умолчанию) или "live"
//   SITE_URL               — адрес сайта (по умолчанию https://kachhair.com)
// Суммы считаются только здесь, по таблице product_prices, — цене из браузера мы не верим.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const env = (k: string, d = "") => (Deno.env.get(k) ?? d).trim();
const CURRENCY = "eur";
const SITE = env("SITE_URL", "https://kachhair.com").replace(/\/$/, "");
const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
class Fail extends Error {
  constructor(msg: string, public status = 400) {
    super(msg);
  }
}

type Item = { id: string; name: string; size: string; qty: number };
type Order = { id: number; number: string; items: Item[]; customer: Record<string, string>; payment_status: string };

async function loadOrder(token: string): Promise<Order> {
  if (!/^[0-9a-f-]{36}$/i.test(token || "")) throw new Fail("bad token");
  const { data, error } = await db.from("orders").select("id, number, items, customer, payment_status").eq("pay_token", token).maybeSingle();
  if (error) throw error;
  if (!data) throw new Fail("order not found", 404);
  return data as Order;
}

// Объём хранится как "250 мл" / "Набор" (так в product_prices); покупателю показываем "250 ml" / "Kit"
const showSize = (s: string) => (s === "Набор" ? "Kit" : String(s).replace(/\s*мл$/, " ml"));
// Языки сайта → язык страницы оплаты Stripe
const LOCALES = ["en", "de", "it", "ro", "fr"];

// Доставка, евро: цена по стране и способу, и сумма товаров, от которой доставка бесплатна.
// Та же таблица в js/shipping.js (сайт и фиды Google) — меняйте вместе.
const SHIPPING: Record<string, { courier: number; post: number; freeFrom: number }> = {
  RO: { courier: 4.84, post: 3.63, freeFrom: 40 },
  IT: { courier: 12, post: 12, freeFrom: 80 },
  DE: { courier: 12, post: 12, freeFrom: 80 },
  FR: { courier: 12, post: 12, freeFrom: 80 }
};
const DELIVERY_NAME: Record<string, string> = { en: "Delivery", de: "Versand", it: "Spedizione", ro: "Livrare", fr: "Livraison" };

function shippingCents(order: Order, itemsCents: number) {
  const r = SHIPPING[order.customer?.country || ""];
  if (!r) throw new Fail("no delivery to " + (order.customer?.country || "?"));
  if (itemsCents >= r.freeFrom * 100) return 0;
  return Math.round((order.customer?.delivery === "post" ? r.post : r.courier) * 100);
}

// Позиции заказа с ценами из базы; сумма в центах (товары + доставка)
async function priceOrder(order: Order) {
  const { data, error } = await db.from("product_prices").select("product_id, size, price");
  if (error) throw error;
  const map = new Map((data || []).map((r) => [r.product_id + "|" + r.size, Math.round(Number(r.price) * 100)]));
  const lines = (order.items || []).map((i) => {
    const cents = map.get(i.id + "|" + i.size);
    const qty = Math.max(1, Math.min(99, Math.floor(Number(i.qty) || 1)));
    if (!cents) throw new Fail("no price for " + i.id + " " + i.size);
    return { name: `${i.name}, ${showSize(i.size)}`, cents, qty };
  });
  if (!lines.length) throw new Fail("empty order");
  const items = lines.reduce((s, l) => s + l.cents * l.qty, 0);
  const shipping = shippingCents(order, items);
  return { lines, items, shipping, total: items + shipping };
}

async function markPaid(token: string, provider: string, ref: string, cents: number, currency: string) {
  const { error } = await db
    .from("orders")
    .update({
      payment_status: "paid",
      payment_provider: provider,
      payment_ref: ref,
      paid_amount: cents / 100,
      currency: currency.toUpperCase(),
      paid_at: new Date().toISOString()
    })
    .eq("pay_token", token);
  if (error) throw error;
}

// ---------- Stripe ----------
async function stripe(path: string, params?: Record<string, string>) {
  const key = env("STRIPE_SECRET_KEY");
  if (!key) throw new Fail("stripe not configured", 503);
  const res = await fetch("https://api.stripe.com/v1/" + path, {
    method: params ? "POST" : "GET",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/x-www-form-urlencoded" },
    body: params ? new URLSearchParams(params) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Fail("stripe: " + (data.error?.message || res.status), 502);
  return data;
}

async function stripeSession(token: string, lang?: string) {
  const order = await loadOrder(token);
  if (order.payment_status === "paid") throw new Fail("already paid", 409);
  const { lines, shipping } = await priceOrder(order);
  const p: Record<string, string> = {
    mode: "payment",
    client_reference_id: token,
    "metadata[pay_token]": token,
    "metadata[order_number]": order.number,
    "payment_intent_data[metadata][pay_token]": token,
    "payment_intent_data[description]": "KACH " + order.number,
    success_url: `${SITE}/checkout.html?paid=${token}&session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE}/checkout.html?pay=${token}`
  };
  if (order.customer?.email) p.customer_email = order.customer.email;
  if (lang && LOCALES.includes(lang)) p.locale = lang;
  lines.forEach((l, i) => {
    p[`line_items[${i}][quantity]`] = String(l.qty);
    p[`line_items[${i}][price_data][currency]`] = CURRENCY;
    p[`line_items[${i}][price_data][unit_amount]`] = String(l.cents);
    p[`line_items[${i}][price_data][product_data][name]`] = l.name;
  });
  if (shipping > 0) {
    const i = lines.length;
    p[`line_items[${i}][quantity]`] = "1";
    p[`line_items[${i}][price_data][currency]`] = CURRENCY;
    p[`line_items[${i}][price_data][unit_amount]`] = String(shipping);
    p[`line_items[${i}][price_data][product_data][name]`] = DELIVERY_NAME[lang && LOCALES.includes(lang) ? lang : "en"];
  }
  const s = await stripe("checkout/sessions", p);
  return { url: s.url };
}

// Проверка после возврата со страницы Stripe
async function stripeVerify(token: string, session: string) {
  if (!/^cs_[A-Za-z0-9_]+$/.test(session || "")) throw new Fail("bad session");
  const s = await stripe("checkout/sessions/" + session);
  if (s.client_reference_id !== token) throw new Fail("session mismatch", 403);
  if (s.payment_status === "paid") {
    await markPaid(token, "stripe", s.payment_intent || s.id, s.amount_total, s.currency);
    return { paid: true };
  }
  return { paid: false };
}

async function hmacHex(secret: string, msg: string) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function stripeWebhook(req: Request) {
  const secret = env("STRIPE_WEBHOOK_SECRET");
  if (!secret) throw new Fail("webhook not configured", 503);
  const body = await req.text();
  const header = req.headers.get("stripe-signature") || "";
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=", 2)));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > 600) throw new Fail("stale signature", 400);
  const expected = await hmacHex(secret, `${parts.t}.${body}`);
  const ok = header.split(",").some((kv) => kv.startsWith("v1=") && kv.slice(3) === expected);
  if (!ok) throw new Fail("bad signature", 400);
  const ev = JSON.parse(body);
  if (ev.type === "checkout.session.completed" || ev.type === "checkout.session.async_payment_succeeded") {
    const s = ev.data.object;
    if (s.payment_status === "paid" && s.client_reference_id) {
      await markPaid(s.client_reference_id, "stripe", s.payment_intent || s.id, s.amount_total, s.currency);
    }
  }
  return { received: true };
}

// ---------- PayPal ----------
const PP = () => (env("PAYPAL_ENV", "sandbox") === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com");

async function paypal(path: string, body?: unknown) {
  const id = env("PAYPAL_CLIENT_ID");
  const secret = env("PAYPAL_SECRET");
  if (!id || !secret) throw new Fail("paypal not configured", 503);
  const tok = await fetch(PP() + "/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: "Basic " + btoa(id + ":" + secret), "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials"
  }).then((r) => r.json());
  if (!tok.access_token) throw new Fail("paypal auth failed", 502);
  const res = await fetch(PP() + path, {
    method: "POST",
    headers: { Authorization: "Bearer " + tok.access_token, "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {})
  });
  const data = await res.json();
  if (!res.ok) throw new Fail("paypal: " + (data.message || data.name || res.status), 502);
  return data;
}

const eur = (cents: number) => (cents / 100).toFixed(2);

async function paypalCreate(token: string) {
  const order = await loadOrder(token);
  if (order.payment_status === "paid") throw new Fail("already paid", 409);
  const { lines, items, shipping, total } = await priceOrder(order);
  const cur = CURRENCY.toUpperCase();
  const pp = await paypal("/v2/checkout/orders", {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: token,
        custom_id: order.number,
        description: "KACH " + order.number,
        amount: { currency_code: cur, value: eur(total), breakdown: { item_total: { currency_code: cur, value: eur(items) }, shipping: { currency_code: cur, value: eur(shipping) } } },
        items: lines.map((l) => ({ name: l.name.slice(0, 127), quantity: String(l.qty), unit_amount: { currency_code: cur, value: eur(l.cents) } }))
      }
    ],
    application_context: { brand_name: "KACH Hair", shipping_preference: "NO_SHIPPING", user_action: "PAY_NOW" }
  });
  return { id: pp.id };
}

async function paypalCapture(token: string, ppId: string) {
  if (!/^[A-Z0-9]{5,40}$/.test(ppId || "")) throw new Fail("bad paypal id");
  const order = await loadOrder(token);
  const { total } = await priceOrder(order);
  const pp = await paypal(`/v2/checkout/orders/${ppId}/capture`);
  const unit = pp.purchase_units?.[0];
  const cap = unit?.payments?.captures?.[0];
  if (pp.status !== "COMPLETED" || !cap || cap.status !== "COMPLETED") throw new Fail("payment not completed", 402);
  if (unit.reference_id !== token) throw new Fail("order mismatch", 403);
  const cents = Math.round(Number(cap.amount.value) * 100);
  if (cents < total || cap.amount.currency_code !== CURRENCY.toUpperCase()) throw new Fail("amount mismatch", 402);
  await markPaid(token, "paypal", cap.id, cents, cap.amount.currency_code);
  return { paid: true };
}

// ---------- Маршруты ----------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    if (new URL(req.url).searchParams.get("stripe-webhook") !== null) return json(await stripeWebhook(req));
    const b = await req.json().catch(() => ({}));
    switch (b.action) {
      case "config":
        return json({
          currency: CURRENCY.toUpperCase(),
          stripe: !!env("STRIPE_SECRET_KEY"),
          stripeMode: (() => {
            const k = env("STRIPE_SECRET_KEY");
            if (!k) return null;
            if (/^(sk|rk)_live_/.test(k)) return "live";
            if (/^(sk|rk)_test_/.test(k)) return "test";
            if (/^pk_/.test(k)) return "publishable-key";
            // безопасная подсказка: длина и признаки формата, без самого ключа
            return { kind: "unknown", len: k.length, start: k.slice(0, 2), live: k.includes("_live_"), dots: /\.\.\.|…/.test(k), space: /\s/.test(k), quote: /["'«»]/.test(k), eq: k.includes("=") };
          })(),
          paypal: env("PAYPAL_CLIENT_ID") && env("PAYPAL_SECRET") ? env("PAYPAL_CLIENT_ID") : null,
          // тестовый режим: Stripe-ключ sk_test_ (PayPal учитываем, только если он подключён)
          test:
            /^(sk|rk)_test_/.test(env("STRIPE_SECRET_KEY")) ||
            (!!env("PAYPAL_CLIENT_ID") && env("PAYPAL_ENV", "sandbox") !== "live")
        });
      case "stripe-session":
        return json(await stripeSession(b.token, b.lang));
      case "stripe-verify":
        return json(await stripeVerify(b.token, b.session));
      case "paypal-create":
        return json(await paypalCreate(b.token));
      case "paypal-capture":
        return json(await paypalCapture(b.token, b.paypalOrderId));
      default:
        throw new Fail("unknown action");
    }
  } catch (e) {
    const status = e instanceof Fail ? e.status : 500;
    console.error(e);
    return json({ error: e instanceof Fail ? e.message : "server error" }, status);
  }
});
