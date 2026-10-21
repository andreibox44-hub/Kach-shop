// Уведомления о заказах KACH в Telegram-группу.
// Вызывается триггером базы после создания заказа и после оплаты (тело: {"id": <id заказа>}).
// Секрет (Supabase → Edge Functions → Secrets): TELEGRAM_BOT_TOKEN — токен от @BotFather.
// ID группы хранится в таблице app_settings (ключ telegram_chat_id).
// Каждое уведомление отправляется один раз: отметки notified_new_at / notified_paid_at в заказе.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const env = (k: string) => Deno.env.get(k) ?? "";
const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const COUNTRY: Record<string, string> = { RO: "Румыния", IT: "Италия", DE: "Германия", FR: "Франция" };
const DELIVERY: Record<string, string> = { courier: "Курьером", post: "Почтой" };
const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const money = (n: number) => (Math.round(n * 100) / 100).toLocaleString("ru-RU", { maximumFractionDigits: 2 }) + " €";

async function tg(method: string, body: Record<string, unknown> = {}) {
  const token = env("TELEGRAM_BOT_TOKEN");
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set");
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!data.ok) throw new Error("telegram: " + (data.description || res.status));
  return data.result;
}

async function chatId() {
  const { data } = await db.from("app_settings").select("value").eq("key", "telegram_chat_id").maybeSingle();
  return data?.value || "";
}

type Order = {
  id: number;
  number: string;
  customer: Record<string, string>;
  items: { name: string; size: string; qty: number; price?: number }[];
  total: number;
  payment_status: string;
  paid_amount: number | null;
  tg_message_id: number | null;
};

function newOrderText(o: Order) {
  const c = o.customer || {};
  const items = (o.items || []).map((i) => {
    const sum = i.price ? " — " + money(i.price * i.qty) : "";
    return `• ${esc(i.name)}, ${esc(i.size)} × ${i.qty}${sum}`;
  });
  const city = [c.zip, c.city].filter(Boolean).join(" ") + (c.region ? ` (${c.region})` : "");
  const addr = [c.address, c.address2, city.trim(), COUNTRY[c.country] || c.country].filter(Boolean).join(", ");
  const paid = o.payment_status === "paid";
  return [
    `🛒 <b>Новый заказ ${esc(o.number)}</b>`,
    paid ? "✅ Оплачен" : "⏳ Ожидает оплаты картой",
    "",
    ...items,
    `<b>Итого: ${money(Number(o.total))}</b>`,
    "",
    `👤 ${esc(c.name)}`,
    `📞 ${esc(c.phone)}`,
    c.email ? `✉️ ${esc(c.email)}` : "",
    `🚚 ${esc(DELIVERY[c.delivery] || c.delivery)}`,
    `📍 ${esc(addr)}`,
    c.comment ? `💬 ${esc(c.comment)}` : ""
  ].filter((l, i, a) => l !== "" || (a[i - 1] !== "" && i > 0)).join("\n");
}

// Ставит отметку атомарно: если её уже поставил другой вызов, вернёт null
async function claim(id: number, col: "notified_new_at" | "notified_paid_at") {
  const { data, error } = await db
    .from("orders")
    .update({ [col]: new Date().toISOString() })
    .eq("id", id)
    .is(col, null)
    .select("id, number, customer, items, total, payment_status, paid_amount, tg_message_id")
    .maybeSingle();
  if (error) throw error;
  return data as Order | null;
}

async function notify(id: number) {
  const chat = await chatId();
  if (!chat || !env("TELEGRAM_BOT_TOKEN")) return { skipped: "not configured" };

  const { data: cur } = await db.from("orders").select("payment_status, notified_new_at").eq("id", id).maybeSingle();
  if (!cur) return { skipped: "no order" };
  const sent: string[] = [];

  if (!cur.notified_new_at) {
    const o = await claim(id, "notified_new_at");
    if (o) {
      const m = await tg("sendMessage", { chat_id: chat, text: newOrderText(o), parse_mode: "HTML" });
      await db.from("orders").update({ tg_message_id: m.message_id }).eq("id", id);
      sent.push("new");
      // Если заказ уже оплачен к этому моменту, отдельное «оплачен» не нужно
      if (o.payment_status === "paid") await claim(id, "notified_paid_at");
    }
  }

  if (cur.payment_status === "paid") {
    const o = await claim(id, "notified_paid_at");
    if (o) {
      const amount = o.paid_amount != null ? money(Number(o.paid_amount)) : money(Number(o.total));
      await tg("sendMessage", {
        chat_id: chat,
        text: `✅ <b>Заказ ${esc(o.number)} оплачен</b> · ${amount}`,
        parse_mode: "HTML",
        ...(o.tg_message_id ? { reply_parameters: { message_id: o.tg_message_id, allow_sending_without_reply: true } } : {})
      });
      sent.push("paid");
    }
  }
  return { sent };
}

// Первичная настройка: находит группы, куда добавлен бот. Работает, только пока группа ещё не выбрана.
async function findChats() {
  if (await chatId()) return { error: "already configured" };
  const updates = await tg("getUpdates", { allowed_updates: ["message", "my_chat_member"] });
  const chats = new Map<number, { id: number; title: string; type: string }>();
  for (const u of updates) {
    const c = u.message?.chat || u.my_chat_member?.chat;
    if (c && c.type !== "private") chats.set(c.id, { id: c.id, title: c.title, type: c.type });
  }
  return { chats: [...chats.values()] };
}

Deno.serve(async (req) => {
  try {
    const b = await req.json().catch(() => ({}));
    if (b.action === "find-chats") return json(await findChats());
    const id = Number(b.id);
    if (!Number.isInteger(id) || id <= 0) return json({ error: "bad id" }, 400);
    return json(await notify(id));
  } catch (e) {
    console.error(e);
    return json({ error: "server error" }, 500);
  }
});
