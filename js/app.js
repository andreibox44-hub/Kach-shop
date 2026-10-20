// Общая логика сайта: шапка, подвал, корзина, рендер страниц.
(function () {
  const PRODUCTS = window.KACH_PRODUCTS;
  const CATS = window.KACH_CATEGORIES;
  const CART_KEY = "kach-cart-v2";

  // Контакты магазина — замените на свои.
  const CONTACTS = {
    phone: "+40 (000) 000 000",
    phoneHref: "+40000000000",
    email: "info@kachhair.com",
    hours: "Ежедневно 10:00–20:00",
    address: "Адрес уточняется",
    company: "S.R.L. «Название» · CUI RO00000000",
    // Ссылки на соцсети. Пустая строка = значок не показывается.
    social: {
      instagram: "https://instagram.com/",
      telegram: "https://t.me/",
      whatsapp: "https://wa.me/70000000000",
      vk: "https://vk.com/"
    }
  };

  const SOCIAL_ICONS = {
    instagram: ["Instagram", '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>'],
    telegram: ["Telegram", '<path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/><path d="m9 13 8-6"/>'],
    whatsapp: ["WhatsApp", '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.4-2.1-1.5-2.5-2.5l1-1-1-2z"/>'],
    vk: ["ВКонтакте", '<path d="M3 7h3c.5 3 2 5 3.5 5.5V7h3v3c1.5 0 3-1.5 3.5-3h3c-.5 2.5-2.5 4-3.5 4.5 1 .5 3 2 3.8 4.5h-3.3c-.6-1.6-2-3-3.5-3V16h-1C7 16 3.5 12.5 3 7z"/>']
  };
  const socialLinks = () =>
    Object.entries(CONTACTS.social)
      .filter(([, url]) => url)
      .map(
        ([k, url]) =>
          `<a class="social" href="${url}" target="_blank" rel="noopener" aria-label="${SOCIAL_ICONS[k][0]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${SOCIAL_ICONS[k][1]}</svg></a>`
      )
      .join("");

  // ---------- Утилиты ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const money = (n) => n.toLocaleString("ru-RU", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " €";
  const findProduct = (id) => PRODUCTS.find((p) => p.id === id);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const img = (p) => `images/products/${p.id}.jpg`;
  const poster = (p) => `images/posters/${p.id}.jpg`;
  const pageName = () => (document.querySelector("[data-page]") || document.body).dataset.page;

  function priceLabel(p) {
    const prices = p.variants.map((v) => v.price).filter((x) => typeof x === "number");
    if (!prices.length) return "Цена по запросу";
    const min = Math.min(...prices);
    return (prices.length < p.variants.length || new Set(prices).size > 1 ? "от " : "") + money(min);
  }

  // ---------- Корзина (хранится в браузере) ----------
  function getCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
      return raw && typeof raw === "object" ? raw : {};
    } catch (e) {
      return {};
    }
  }
  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {}
    updateCartCount();
  }
  const keyOf = (id, size) => id + "|" + size;
  function addToCart(id, size, qty = 1) {
    const p = findProduct(id);
    if (!p) return;
    const v = p.variants.find((x) => x.size === size) || p.variants[0];
    const cart = getCart();
    const k = keyOf(id, v.size);
    cart[k] = Math.min(99, (cart[k] || 0) + qty);
    saveCart(cart);
    toast("Добавлено в корзину");
  }
  function setQty(k, qty) {
    const cart = getCart();
    if (qty <= 0) delete cart[k];
    else cart[k] = Math.min(qty, 99);
    saveCart(cart);
  }
  function cartItems() {
    const cart = getCart();
    return Object.keys(cart)
      .map((k) => {
        const [id, size] = k.split("|");
        const product = findProduct(id);
        const variant = product && product.variants.find((v) => v.size === size);
        return { key: k, product, variant, qty: cart[k] };
      })
      .filter((i) => i.product && i.variant && i.qty > 0);
  }
  function cartTotals() {
    const items = cartItems();
    const allPriced = items.every((i) => typeof i.variant.price === "number");
    const total = items.reduce((s, i) => s + (i.variant.price || 0) * i.qty, 0);
    return { items, allPriced, total };
  }
  function updateCartCount() {
    const count = cartItems().reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  let toastTimer;
  function toast(text) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
  }

  // ---------- Шапка и подвал ----------
  const logo = `<a href="index.html" class="logo" aria-label="KACH — на главную"><span class="logo-word">KACH</span><span class="logo-sub">Hair Organic Solutions</span></a>`;

  function renderChrome() {
    const page = pageName();
    const link = (href, label, key) => `<a href="${href}"${page === key ? ' aria-current="page"' : ""}>${label}</a>`;
    const header = $("#site-header");
    if (header) {
      header.innerHTML = `
        <div class="container header-inner">
          ${logo}
          <button class="menu-toggle" aria-label="Меню" aria-expanded="false">☰</button>
          <nav class="nav">
            ${link("index.html", "Главная", "home")}
            ${link("catalog.html", "Каталог", "catalog")}
            ${link("about.html", "О бренде", "about")}
            ${link("about.html#contacts", "Контакты", "")}
          </nav>
          <a href="account.html" class="account-link" aria-label="Личный кабинет" data-account-link>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>
            <span class="account-initial" hidden></span>
          </a>
          <a href="cart.html" class="cart-link" aria-label="Корзина">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6 5 3H2"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>
            <span class="cart-count" data-cart-count hidden>0</span>
          </a>
        </div>`;
      const toggle = $(".menu-toggle", header);
      toggle.addEventListener("click", () => {
        const open = header.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open);
      });
    }
    const footer = $("#site-footer");
    if (footer) {
      footer.innerHTML = `
        <div class="footer-top">
          <div class="container footer-top-inner">
            <div>
              <strong>Следите за новинками KACH</strong>
              <span>Советы по уходу, новые средства и акции в наших соцсетях.</span>
            </div>
            <div class="socials">${socialLinks()}</div>
          </div>
        </div>
        <div class="container footer-inner">
          <div class="footer-brand">
            ${logo}
            <p class="footer-note">Профессиональный уход за волосами на натуральных ингредиентах. Природа. Наука. Красота.</p>
            <p class="footer-made">Сделано в Мексике</p>
          </div>
          <div>
            <h4>Каталог</h4>
            ${Object.entries(CATS)
              .map(([k, v]) => `<a href="catalog.html${k === "all" ? "" : "?cat=" + k}">${k === "all" ? "Все товары" : v}</a>`)
              .join("")}
          </div>
          <div>
            <h4>Покупателям</h4>
            <a href="info.html#delivery">Доставка</a>
            <a href="info.html#payment">Оплата</a>
            <a href="info.html#returns">Обмен и возврат</a>
            <a href="info.html#faq">Вопросы и ответы</a>
            <a href="cart.html">Корзина</a>
          </div>
          <div>
            <h4>Компания</h4>
            <a href="about.html">О бренде</a>
            <a href="info.html#pro">Салонам и мастерам</a>
            <a href="about.html#contacts">Контакты</a>
          </div>
          <div>
            <h4>Контакты</h4>
            <a href="tel:${CONTACTS.phoneHref}" class="footer-phone">${CONTACTS.phone}</a>
            <a href="mailto:${CONTACTS.email}">${CONTACTS.email}</a>
            <span>${CONTACTS.hours}</span>
            <span>${CONTACTS.address}</span>
          </div>
        </div>
        <div class="container footer-bottom">
          <div class="pay" aria-label="Способы оплаты">
            <span>Visa</span><span>Mastercard</span><span>Apple Pay</span><span>Google Pay</span><span>Наличные</span>
          </div>
          <div class="legal">
            <a href="info.html#privacy">Политика конфиденциальности</a>
            <a href="info.html#offer">Публичная оферта</a>
          </div>
        </div>
        <div class="container copyright">
          <span>© ${new Date().getFullYear()} KACH Hair Organic Solutions. Все права защищены.</span>
          <span>${CONTACTS.company}</span>
        </div>`;
    }
    document.querySelectorAll("[data-contact]").forEach((el) => {
      const k = el.dataset.contact;
      if (k === "phone") el.innerHTML = `<a href="tel:${CONTACTS.phoneHref}">${CONTACTS.phone}</a>`;
      if (k === "email") el.innerHTML = `<a href="mailto:${CONTACTS.email}">${CONTACTS.email}</a>`;
      if (k === "hours") el.textContent = CONTACTS.hours;
      if (k === "address") el.textContent = CONTACTS.address;
      if (k === "social") el.innerHTML = socialLinks();
    });
  }

  // ---------- Избранное ----------
  const AUTH = () => window.KACH_AUTH;
  const isFav = (id) => (AUTH() ? AUTH().favorites().includes(id) : false);
  const favButton = (id, extra = "") =>
    `<button class="fav${isFav(id) ? " on" : ""}${extra}" data-fav="${id}" aria-pressed="${isFav(id)}" aria-label="В избранное">${HEART}</button>`;
  const HEART = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
  function refreshFavs() {
    document.querySelectorAll("[data-fav]").forEach((b) => {
      const on = isFav(b.dataset.fav);
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on);
    });
  }
  window.KACH_UI = { productCard: (p) => productCard(p), money, esc, img, findProduct, CATS, toast };

  // ---------- Карточка товара ----------
  function productCard(p) {
    return `
      <article class="card">
        <a href="product.html?id=${p.id}" class="card-image">
          ${p.tag ? `<span class="badge">${esc(p.tag)}</span>` : ""}
          <img src="${img(p)}" alt="${esc(p.name)}" loading="lazy" width="560" height="700">
        </a>
        ${favButton(p.id)}
        <div class="card-body">
          <p class="card-type">${esc(CATS[p.category])}</p>
          <h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
          <p class="card-sub">${esc(p.subtitle)}</p>
          <p class="card-sizes">${p.variants.map((v) => esc(v.size)).join(" · ")}${p.ph ? ` · pH ${esc(p.ph)}` : ""}</p>
          <div class="card-footer">
            <span class="price">${priceLabel(p)}</span>
            <button class="btn btn-small" data-add="${p.id}">В корзину</button>
          </div>
        </div>
      </article>`;
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    const fav = e.target.closest("[data-fav]");
    if (fav && AUTH()) {
      e.preventDefault();
      AUTH()
        .toggleFavorite(fav.dataset.fav)
        .then((on) => toast(on ? "Добавлено в избранное" : "Удалено из избранного"))
        .catch((err) => toast(AUTH().errorText(err)));
    }
    if (btn) {
      const p = findProduct(btn.dataset.add);
      if (p) addToCart(p.id, p.variants[0].size);
    }
  });

  // ---------- Страницы ----------
  // ---------- Онлайн-оплата ----------
  function loadPayPal(clientId) {
    if (window.paypal) return Promise.resolve(window.paypal);
    return new Promise((res, rej) => {
      const sc = document.createElement("script");
      sc.src = "https://www.paypal.com/sdk/js?client-id=" + encodeURIComponent(clientId) + "&currency=EUR&intent=capture&components=buttons";
      sc.onload = () => res(window.paypal);
      sc.onerror = rej;
      document.head.appendChild(sc);
    });
  }

  function paidScreen(root, number) {
    root.innerHTML = `
      <div class="empty success">
        <div class="success-icon">✓</div>
        <h1>Оплата прошла!</h1>
        ${number ? `<p>Заказ <strong>${esc(number)}</strong> оплачен.</p>` : ""}
        <p class="muted">Спасибо! Мы свяжемся с вами, чтобы согласовать доставку.</p>
        <a class="btn" href="${AUTH() && AUTH().user ? "account.html#orders" : "index.html"}">${AUTH() && AUTH().user ? "Мои заказы" : "На главную"}</a>
      </div>`;
  }

  // Экран «оплатите заказ»: кнопка Stripe и/или кнопки PayPal
  async function showPayScreen(root, { number, token, provider, note }) {
    const auth = AUTH();
    root.innerHTML = `
      <div class="empty pay-screen">
        <h1>Оплата заказа${number ? " " + esc(number) : ""}</h1>
        <p class="muted">${note || "Заказ сохранён. Осталось оплатить его."}</p>
        <div class="pay-actions">
          <button class="btn btn-block" id="pay-stripe-btn" hidden>Оплатить картой</button>
          <div id="paypal-buttons"></div>
        </div>
        <p class="form-msg err" id="pay-err" hidden></p>
        <p class="muted small">Если не получается оплатить, ничего страшного: заказ уже у нас, и менеджер свяжется с вами.</p>
      </div>`;
    const err = (m) => {
      const el = $("#pay-err");
      el.textContent = m;
      el.hidden = false;
    };
    let cfg;
    try {
      cfg = await auth.pay("config");
    } catch (e) {
      return err("Онлайн-оплата сейчас недоступна.");
    }
    if (cfg.stripe && provider !== "paypal") {
      const b = $("#pay-stripe-btn");
      b.hidden = false;
      b.addEventListener("click", async () => {
        b.disabled = true;
        b.textContent = "Переходим к оплате…";
        try {
          location.href = (await auth.pay("stripe-session", { token })).url;
        } catch (e) {
          b.disabled = false;
          b.textContent = "Оплатить картой";
          err(e.message === "already paid" ? "Этот заказ уже оплачен." : "Не удалось открыть оплату картой. Попробуйте ещё раз.");
        }
      });
    }
    if (cfg.paypal && provider !== "card") {
      try {
        const pp = await loadPayPal(cfg.paypal);
        pp.Buttons({
          style: { layout: "vertical", shape: "pill", label: "pay" },
          createOrder: async () => (await auth.pay("paypal-create", { token })).id,
          onApprove: async (d) => {
            await auth.pay("paypal-capture", { token, paypalOrderId: d.orderID });
            paidScreen(root, number);
          },
          onError: (e) => {
            console.error(e);
            err("PayPal не смог провести оплату. Попробуйте ещё раз.");
          }
        }).render("#paypal-buttons");
      } catch (e) {
        err("Не удалось загрузить PayPal.");
      }
    }
  }

  // Возврат со страницы оплаты Stripe
  async function paymentReturn(root, qs) {
    const auth = AUTH();
    if (!auth || !auth.enabled) return;
    const token = qs.get("paid") || qs.get("pay");
    if (qs.get("paid") && qs.get("session")) {
      root.innerHTML = `<div class="empty"><p class="muted">Проверяем оплату…</p></div>`;
      try {
        const r = await auth.pay("stripe-verify", { token, session: qs.get("session") });
        if (r.paid) return paidScreen(root, "");
      } catch (e) {
        console.error(e);
      }
    }
    showPayScreen(root, { token, provider: "", note: "Оплата не завершена. Заказ сохранён, его можно оплатить сейчас." });
  }

  const pages = {
    home() {
      const grid = $("#featured");
      if (grid) grid.innerHTML = ["only1one", "shampoo-rh", "siero-ssn", "aminoplasma-ap"].map((id) => productCard(findProduct(id))).join("");
    },

    catalog() {
      const grid = $("#catalog-grid");
      const filters = $("#filters");
      let current = new URLSearchParams(location.search).get("cat") || "all";
      if (!CATS[current]) current = "all";

      filters.innerHTML = Object.entries(CATS)
        .map(([key, label]) => `<button class="chip" data-filter="${key}">${label}</button>`)
        .join("");

      function draw() {
        filters.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c.dataset.filter === current));
        const list = PRODUCTS.filter((p) => current === "all" || p.category === current);
        grid.innerHTML = list.map(productCard).join("");
      }
      filters.addEventListener("click", (e) => {
        const chip = e.target.closest("[data-filter]");
        if (!chip) return;
        current = chip.dataset.filter;
        draw();
      });
      draw();
    },

    product() {
      const root = $("#product");
      const p = findProduct(new URLSearchParams(location.search).get("id"));
      if (!p) {
        root.innerHTML = `<div class="empty"><h1>Товар не найден</h1><p><a class="btn" href="catalog.html">Перейти в каталог</a></p></div>`;
        return;
      }
      document.title = `${p.name} — KACH`;
      let size = p.variants[0].size;
      const priceOf = (s) => {
        const v = p.variants.find((x) => x.size === s);
        return typeof v.price === "number" ? money(v.price) : "Цена по запросу";
      };
      root.innerHTML = `
        <nav class="breadcrumbs"><a href="catalog.html">Каталог</a> / <a href="catalog.html?cat=${p.category}">${esc(CATS[p.category])}</a> / ${esc(p.name)}</nav>
        <div class="product-layout">
          <div class="product-image"><img src="${img(p)}" alt="${esc(p.name)}" width="560" height="700"></div>
          <div class="product-info">
            <p class="card-type">${esc(CATS[p.category])}</p>
            <h1>${esc(p.name)}</h1>
            <p class="product-sub">${esc(p.subtitle)}</p>
            <p class="price big" id="price">${priceOf(size)}</p>
            ${
              p.variants.length > 1
                ? `<div class="sizes" role="radiogroup" aria-label="Объём">${p.variants
                    .map((v, i) => `<button class="chip${i === 0 ? " active" : ""}" data-size="${esc(v.size)}" role="radio" aria-checked="${i === 0}">${esc(v.size)}</button>`)
                    .join("")}</div>`
                : `<p class="muted">${esc(p.variants[0].size)}</p>`
            }
            <div class="buy-row">
              <div class="qty">
                <button type="button" data-step="-1" aria-label="Меньше">−</button>
                <input type="number" id="qty" value="1" min="1" max="99" aria-label="Количество">
                <button type="button" data-step="1" aria-label="Больше">+</button>
              </div>
              <button class="btn" id="buy">Добавить в корзину</button>
              ${favButton(p.id, " fav-big")}
            </div>
            <dl class="specs">
              <div><dt>Для волос</dt><dd>${esc(p.hair)}</dd></div>
              ${p.ph ? `<div><dt>pH</dt><dd>${esc(p.ph)}</dd></div>` : ""}
              <div><dt>Формула</dt><dd>${esc(p.formula)}</dd></div>
              <div><dt>Производство</dt><dd>Мексика</dd></div>
            </dl>
            <ul class="benefits">${p.benefits.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
          </div>
        </div>
        <section class="product-details">
          <div class="details-text">
            <h2>Описание</h2>
            ${p.description.map((t) => `<p>${esc(t)}</p>`).join("")}
            <h3>Основные активные ингредиенты</h3>
            <div class="keys">${p.actives.map((k) => `<span class="key">${esc(k)}</span>`).join("")}</div>
          </div>
          <figure class="poster">
            <a href="${poster(p)}" target="_blank" rel="noopener"><img src="${poster(p)}" alt="Плакат ${esc(p.name)}" loading="lazy"></a>
            <figcaption>Оригинальный плакат бренда. Нажмите, чтобы открыть крупно.</figcaption>
          </figure>
        </section>
        <section class="section">
          <h2>С этим товаром смотрят</h2>
          <div class="grid">${PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category)
            .concat(PRODUCTS.filter((x) => x.id !== p.id && x.category !== p.category))
            .slice(0, 4)
            .map(productCard)
            .join("")}</div>
        </section>`;
      root.querySelectorAll("[data-size]").forEach((b) =>
        b.addEventListener("click", () => {
          size = b.dataset.size;
          root.querySelectorAll("[data-size]").forEach((x) => {
            x.classList.toggle("active", x === b);
            x.setAttribute("aria-checked", x === b);
          });
          $("#price").textContent = priceOf(size);
        })
      );
      const qty = $("#qty");
      root.querySelectorAll("[data-step]").forEach((b) =>
        b.addEventListener("click", () => {
          qty.value = Math.min(99, Math.max(1, (parseInt(qty.value, 10) || 1) + Number(b.dataset.step)));
        })
      );
      $("#buy").addEventListener("click", () => addToCart(p.id, size, Math.min(99, Math.max(1, parseInt(qty.value, 10) || 1))));
    },

    cart() {
      const root = $("#cart");
      function draw() {
        const { items, allPriced, total } = cartTotals();
        if (!items.length) {
          root.innerHTML = `<div class="empty"><p>Ваша корзина пуста.</p><a class="btn" href="catalog.html">Перейти в каталог</a></div>`;
          return;
        }
        root.innerHTML = `
          <div class="cart-layout">
            <div class="cart-list">
              ${items
                .map(
                  ({ key, product: p, variant: v, qty }) => `
                <div class="cart-row">
                  <a href="product.html?id=${p.id}" class="cart-thumb"><img src="${img(p)}" alt=""></a>
                  <div class="cart-name">
                    <a href="product.html?id=${p.id}"><strong>${esc(p.name)}</strong></a>
                    <span class="muted small">${esc(v.size)} · ${typeof v.price === "number" ? money(v.price) : "цена по запросу"}</span>
                  </div>
                  <div class="qty">
                    <button data-key="${esc(key)}" data-delta="-1" aria-label="Меньше">−</button>
                    <span>${qty}</span>
                    <button data-key="${esc(key)}" data-delta="1" aria-label="Больше">+</button>
                  </div>
                  <strong class="cart-sum">${typeof v.price === "number" ? money(v.price * qty) : "—"}</strong>
                  <button class="remove" data-remove="${esc(key)}" aria-label="Удалить">×</button>
                </div>`
                )
                .join("")}
            </div>
            <aside class="summary">
              <h3>Итого</h3>
              ${
                allPriced
                  ? `<div class="row total"><span>К оплате</span><span>${money(total)}</span></div>`
                  : `<p class="muted small">Точную стоимость заказа и доставки менеджер сообщит после оформления.</p>`
              }
              <a href="checkout.html" class="btn btn-block">Оформить заказ</a>
            </aside>
          </div>`;
      }
      root.addEventListener("click", (e) => {
        const d = e.target.closest("[data-delta]");
        const r = e.target.closest("[data-remove]");
        if (d) setQty(d.dataset.key, (getCart()[d.dataset.key] || 0) + Number(d.dataset.delta));
        if (r) setQty(r.dataset.remove, 0);
        if (d || r) draw();
      });
      draw();
    },

    checkout() {
      const root = $("#checkout");
      const qs = new URLSearchParams(location.search);
      if (qs.get("paid") || qs.get("pay")) return paymentReturn(root, qs);
      const { items, allPriced, total } = cartTotals();
      if (!items.length) {
        root.innerHTML = `<div class="empty"><p>В корзине нет товаров.</p><a class="btn" href="catalog.html">Перейти в каталог</a></div>`;
        return;
      }
      $("#order-summary").innerHTML = `
        <h3>Ваш заказ</h3>
        ${items
          .map(
            ({ product: p, variant: v, qty }) =>
              `<div class="row"><span>${esc(p.name)}, ${esc(v.size)} × ${qty}</span><span>${typeof v.price === "number" ? money(v.price * qty) : "—"}</span></div>`
          )
          .join("")}
        ${
          allPriced
            ? `<div class="row total"><span>К оплате</span><span>${money(total)}</span></div>`
            : `<p class="muted small">Стоимость заказа и доставки сообщит менеджер.</p>`
        }`;

      const form = $("#checkout-form");
      const auth = AUTH();
      // Подставляем данные из личного кабинета
      if (auth) {
        auth.ready.then(() => {
          const pr = auth.profile;
          const u = auth.user;
          if (!u) {
            const hint = $("#login-hint");
            if (hint && auth.enabled) hint.hidden = false;
            return;
          }
          const setIf = (id, v) => {
            const el = $("#" + id);
            if (el && !el.value && v) el.value = v;
          };
          setIf("name", pr && pr.name);
          setIf("phone", pr && pr.phone);
          setIf("email", u.email);
          const addr = pr && pr.addresses && pr.addresses[0];
          if (addr) {
            setIf("city", addr.city);
            setIf("zip", addr.zip);
            setIf("address", addr.address);
          }
        });
      }
      // Онлайн-оплата: показываем, только если она настроена и у всех товаров есть цена
      if (auth && auth.enabled && allPriced) {
        auth
          .pay("config")
          .then((cfg) => {
            if (cfg.stripe) $("#pay-card").hidden = false;
            if (cfg.paypal) $("#pay-paypal").hidden = false;
            if ((cfg.stripe || cfg.paypal) && cfg.test) $("#pay-test").hidden = false;
          })
          .catch((err) => console.warn("payments:", err));
      }
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const data = Object.fromEntries(new FormData(form));
        const number = "K-" + Date.now().toString().slice(-6);
        const orderItems = items.map(({ product: p, variant: v, qty }) => ({ id: p.id, name: p.name, size: v.size, price: v.price, qty }));
        const submit = form.querySelector('[type="submit"]');
        const online = data.payment === "card" || data.payment === "paypal";
        const payToken = crypto.randomUUID ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
        // Отправляем заказ в базу (Supabase), если она подключена
        if (auth && auth.enabled) {
          submit.disabled = true;
          submit.textContent = "Отправляем…";
          try {
            await auth.saveOrder({ number, customer: data, items: orderItems, total: allPriced ? total : null, pay_token: payToken });
          } catch (err) {
            console.error(err);
            submit.disabled = false;
            submit.textContent = "Подтвердить заказ";
            toast("Не удалось отправить заказ. Попробуйте ещё раз или позвоните нам.");
            return;
          }
        }
        try {
          const orders = JSON.parse(localStorage.getItem("kach-orders") || "[]");
          orders.push({
            number,
            date: new Date().toISOString(),
            customer: data,
            items: orderItems
          });
          localStorage.setItem("kach-orders", JSON.stringify(orders));
        } catch (err) {}
        saveCart({});
        if (online && auth && auth.enabled) {
          if (data.payment === "card") {
            submit.textContent = "Переходим к оплате…";
            try {
              const { url } = await auth.pay("stripe-session", { token: payToken });
              location.href = url;
              return;
            } catch (err) {
              console.error(err);
            }
          }
          showPayScreen(root, { number, token: payToken, provider: data.payment });
          window.scrollTo(0, 0);
          return;
        }
        root.innerHTML = `
          <div class="empty success">
            <div class="success-icon">✓</div>
            <h1>Спасибо за заказ!</h1>
            <p>Номер заказа: <strong>${number}</strong></p>
            <p class="muted">Мы свяжемся с вами по телефону ${esc(data.phone)}, чтобы подтвердить заказ, стоимость и доставку.</p>
            <a class="btn" href="${auth && auth.user ? "account.html#orders" : "index.html"}">${auth && auth.user ? "Мои заказы" : "На главную"}</a>
          </div>`;
        window.scrollTo(0, 0);
      });
    },

    about() {},
    info() {},
    account() {}
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderChrome();
    const page = pageName();
    if (pages[page]) pages[page]();
    updateCartCount();
    const auth = AUTH();
    if (auth) {
      auth.onChange((u, pr) => {
        refreshFavs();
        document.querySelectorAll("[data-account-link]").forEach((a) => {
          const ini = a.querySelector(".account-initial");
          const name = (pr && pr.name) || (u && u.email) || "";
          ini.hidden = !u;
          ini.textContent = u ? name.trim().charAt(0).toUpperCase() : "";
          a.classList.toggle("logged", !!u);
          a.setAttribute("aria-label", u ? "Личный кабинет: " + name : "Войти в личный кабинет");
        });
      });
    }
  });
  window.addEventListener("storage", updateCartCount);
})();
