// Общая логика сайта: шапка, подвал, корзина, рендер страниц.
(function () {
  const PRODUCTS = window.KACH_PRODUCTS;
  const CART_KEY = "kach-cart";
  const FREE_DELIVERY_FROM = 3000;
  const DELIVERY_PRICE = 300;

  // ---------- Утилиты ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const money = (n) => n.toLocaleString("ru-RU") + " ₽";
  const findProduct = (id) => PRODUCTS.find((p) => p.id === id);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Картинка флакона, рисуется кодом — не нужны файлы изображений.
  function bottleSvg(p) {
    if (p.id === "tverdiy") {
      return `<svg viewBox="0 0 200 200" class="bottle" aria-hidden="true">
        <ellipse cx="100" cy="150" rx="70" ry="14" fill="rgba(0,0,0,.08)"/>
        <rect x="35" y="85" width="130" height="60" rx="30" fill="${p.color}"/>
        <rect x="35" y="85" width="130" height="22" rx="11" fill="rgba(255,255,255,.35)"/>
        <text x="100" y="125" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="${p.accent}">kach</text>
      </svg>`;
    }
    return `<svg viewBox="0 0 200 200" class="bottle" aria-hidden="true">
      <ellipse cx="100" cy="185" rx="45" ry="8" fill="rgba(0,0,0,.08)"/>
      <rect x="85" y="18" width="30" height="22" rx="4" fill="${p.accent}"/>
      <rect x="80" y="38" width="40" height="10" rx="3" fill="${p.accent}" opacity=".8"/>
      <path d="M70 60 Q70 48 82 48 H118 Q130 48 130 60 V172 Q130 182 120 182 H80 Q70 182 70 172 Z" fill="${p.color}"/>
      <path d="M76 62 Q76 54 84 54 H90 V176 H82 Q76 176 76 170 Z" fill="rgba(255,255,255,.3)"/>
      <rect x="74" y="95" width="52" height="56" rx="4" fill="#fffdf7"/>
      <text x="100" y="118" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="${p.accent}">kach</text>
      <path d="M92 132 q8 -12 16 0 q-8 8 -16 0z" fill="${p.accent}" opacity=".7"/>
    </svg>`;
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
  function addToCart(id, qty = 1) {
    const cart = getCart();
    cart[id] = (cart[id] || 0) + qty;
    saveCart(cart);
    toast("Добавлено в корзину");
  }
  function setQty(id, qty) {
    const cart = getCart();
    if (qty <= 0) delete cart[id];
    else cart[id] = Math.min(qty, 99);
    saveCart(cart);
  }
  function cartItems() {
    const cart = getCart();
    return Object.keys(cart)
      .map((id) => ({ product: findProduct(id), qty: cart[id] }))
      .filter((i) => i.product && i.qty > 0);
  }
  function cartTotals() {
    const items = cartItems();
    const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
    const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_PRICE;
    return { items, subtotal, delivery, total: subtotal + delivery };
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
  function renderChrome() {
    const page = document.body.dataset.page;
    const link = (href, label, key) =>
      `<a href="${href}"${page === key ? ' aria-current="page"' : ""}>${label}</a>`;
    const header = $("#site-header");
    if (header) {
      header.innerHTML = `
        <div class="container header-inner">
          <a href="index.html" class="logo">kach<span>organic</span></a>
          <button class="menu-toggle" aria-label="Меню" aria-expanded="false">☰</button>
          <nav class="nav">
            ${link("index.html", "Главная", "home")}
            ${link("catalog.html", "Каталог", "catalog")}
            ${link("about.html", "О нас", "about")}
            ${link("about.html#contacts", "Контакты", "")}
          </nav>
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
        <div class="container footer-inner">
          <div>
            <a href="index.html" class="logo">kach<span>organic</span></a>
            <p class="muted">Органические шампуни ручной работы.<br>Без сульфатов, парабенов и силиконов.</p>
          </div>
          <div>
            <h4>Магазин</h4>
            <a href="catalog.html">Каталог</a>
            <a href="cart.html">Корзина</a>
            <a href="about.html#delivery">Доставка и оплата</a>
          </div>
          <div>
            <h4>Связаться</h4>
            <a href="tel:+70000000000">+7 (000) 000-00-00</a>
            <a href="mailto:hello@kach.shop">hello@kach.shop</a>
            <span class="muted">Ежедневно 10:00–20:00</span>
          </div>
        </div>
        <div class="container copyright muted">© ${new Date().getFullYear()} Kach. Все права защищены.</div>`;
    }
  }

  // ---------- Карточка товара ----------
  function productCard(p) {
    return `
      <article class="card">
        <a href="product.html?id=${p.id}" class="card-image" style="--tint:${p.color}33">
          ${p.tag ? `<span class="badge">${esc(p.tag)}</span>` : ""}
          ${bottleSvg(p)}
        </a>
        <div class="card-body">
          <p class="card-type">${esc(p.type)}</p>
          <h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
          <p class="muted small">${esc(p.short)}</p>
          <div class="card-footer">
            <span class="price">${money(p.price)}</span>
            <button class="btn btn-small" data-add="${p.id}">В корзину</button>
          </div>
        </div>
      </article>`;
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (btn) addToCart(btn.dataset.add);
  });

  // ---------- Страницы ----------
  const pages = {
    home() {
      const grid = $("#featured");
      if (grid) grid.innerHTML = PRODUCTS.slice(0, 3).map(productCard).join("");
    },

    catalog() {
      const grid = $("#catalog-grid");
      const filters = $("#filters");
      const sort = $("#sort");
      let current = new URLSearchParams(location.search).get("type") || "all";
      if (!window.KACH_HAIR_TYPES[current]) current = "all";

      filters.innerHTML = Object.entries(window.KACH_HAIR_TYPES)
        .map(([key, label]) => `<button class="chip" data-filter="${key}">${label}</button>`)
        .join("");

      function draw() {
        filters.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c.dataset.filter === current));
        let list = PRODUCTS.filter((p) => current === "all" || p.hair === current);
        if (sort.value === "cheap") list = [...list].sort((a, b) => a.price - b.price);
        if (sort.value === "expensive") list = [...list].sort((a, b) => b.price - a.price);
        grid.innerHTML = list.length
          ? list.map(productCard).join("")
          : `<p class="muted">В этой категории пока нет товаров.</p>`;
      }
      filters.addEventListener("click", (e) => {
        const chip = e.target.closest("[data-filter]");
        if (!chip) return;
        current = chip.dataset.filter;
        draw();
      });
      sort.addEventListener("change", draw);
      draw();
    },

    product() {
      const root = $("#product");
      const p = findProduct(new URLSearchParams(location.search).get("id"));
      if (!p) {
        root.innerHTML = `<div class="empty"><h1>Товар не найден</h1><p><a class="btn" href="catalog.html">Перейти в каталог</a></p></div>`;
        return;
      }
      document.title = `${p.name} — Kach`;
      root.innerHTML = `
        <nav class="breadcrumbs muted small"><a href="catalog.html">Каталог</a> / ${esc(p.name)}</nav>
        <div class="product-layout">
          <div class="product-image" style="--tint:${p.color}33">${bottleSvg(p)}</div>
          <div class="product-info">
            <p class="card-type">${esc(p.type)}</p>
            <h1>${esc(p.name)}</h1>
            <p class="price big">${money(p.price)} <span class="muted small">/ ${esc(p.volume)}</span></p>
            <p>${esc(p.description)}</p>
            <div class="buy-row">
              <div class="qty">
                <button type="button" data-step="-1" aria-label="Меньше">−</button>
                <input type="number" id="qty" value="1" min="1" max="99" aria-label="Количество">
                <button type="button" data-step="1" aria-label="Больше">+</button>
              </div>
              <button class="btn" id="buy">Добавить в корзину</button>
            </div>
            <ul class="perks small">
              <li>🌿 Натуральный состав</li>
              <li>🐰 Не тестируется на животных</li>
              <li>🚚 Бесплатная доставка от ${money(FREE_DELIVERY_FROM)}</li>
            </ul>
            <details open><summary>Состав</summary><p>${esc(p.ingredients)}</p></details>
            <details><summary>Способ применения</summary><p>${esc(p.usage)}</p></details>
          </div>
        </div>
        <section class="section">
          <h2>Вам может понравиться</h2>
          <div class="grid">${PRODUCTS.filter((x) => x.id !== p.id).slice(0, 3).map(productCard).join("")}</div>
        </section>`;
      const qty = $("#qty");
      root.querySelectorAll("[data-step]").forEach((b) =>
        b.addEventListener("click", () => {
          qty.value = Math.min(99, Math.max(1, (parseInt(qty.value, 10) || 1) + Number(b.dataset.step)));
        })
      );
      $("#buy").addEventListener("click", () => addToCart(p.id, Math.min(99, Math.max(1, parseInt(qty.value, 10) || 1))));
    },

    cart() {
      const root = $("#cart");
      function draw() {
        const { items, subtotal, delivery, total } = cartTotals();
        if (!items.length) {
          root.innerHTML = `<div class="empty"><p>Ваша корзина пуста.</p><a class="btn" href="catalog.html">Перейти в каталог</a></div>`;
          return;
        }
        const left = FREE_DELIVERY_FROM - subtotal;
        root.innerHTML = `
          <div class="cart-layout">
            <div class="cart-list">
              ${items
                .map(
                  ({ product: p, qty }) => `
                <div class="cart-row">
                  <a href="product.html?id=${p.id}" class="cart-thumb" style="--tint:${p.color}33">${bottleSvg(p)}</a>
                  <div class="cart-name">
                    <a href="product.html?id=${p.id}"><strong>${esc(p.name)}</strong></a>
                    <span class="muted small">${esc(p.volume)} · ${money(p.price)}</span>
                  </div>
                  <div class="qty">
                    <button data-id="${p.id}" data-delta="-1" aria-label="Меньше">−</button>
                    <span>${qty}</span>
                    <button data-id="${p.id}" data-delta="1" aria-label="Больше">+</button>
                  </div>
                  <strong class="cart-sum">${money(p.price * qty)}</strong>
                  <button class="remove" data-remove="${p.id}" aria-label="Удалить">×</button>
                </div>`
                )
                .join("")}
            </div>
            <aside class="summary">
              <h3>Итого</h3>
              <div class="row"><span>Товары</span><span>${money(subtotal)}</span></div>
              <div class="row"><span>Доставка</span><span>${delivery ? money(delivery) : "бесплатно"}</span></div>
              ${left > 0 ? `<p class="muted small">Добавьте товаров ещё на ${money(left)} — и доставка будет бесплатной.</p>` : ""}
              <div class="row total"><span>К оплате</span><span>${money(total)}</span></div>
              <a href="checkout.html" class="btn btn-block">Оформить заказ</a>
            </aside>
          </div>`;
      }
      root.addEventListener("click", (e) => {
        const d = e.target.closest("[data-delta]");
        const r = e.target.closest("[data-remove]");
        if (d) setQty(d.dataset.id, (getCart()[d.dataset.id] || 0) + Number(d.dataset.delta));
        if (r) setQty(r.dataset.remove, 0);
        if (d || r) draw();
      });
      draw();
    },

    checkout() {
      const root = $("#checkout");
      const { items, subtotal, delivery, total } = cartTotals();
      if (!items.length) {
        root.innerHTML = `<div class="empty"><p>В корзине нет товаров.</p><a class="btn" href="catalog.html">Перейти в каталог</a></div>`;
        return;
      }
      $("#order-summary").innerHTML = `
        <h3>Ваш заказ</h3>
        ${items.map(({ product: p, qty }) => `<div class="row"><span>${esc(p.name)} × ${qty}</span><span>${money(p.price * qty)}</span></div>`).join("")}
        <div class="row"><span>Доставка</span><span>${delivery ? money(delivery) : "бесплатно"}</span></div>
        <div class="row total"><span>К оплате</span><span>${money(total)}</span></div>`;

      const form = $("#checkout-form");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const data = Object.fromEntries(new FormData(form));
        const number = "K-" + Date.now().toString().slice(-6);
        const order = {
          number,
          date: new Date().toISOString(),
          customer: data,
          items: items.map(({ product: p, qty }) => ({ id: p.id, name: p.name, price: p.price, qty })),
          subtotal,
          delivery,
          total
        };
        // Сохраняем заказ в браузере. Чтобы заказы приходили вам на почту,
        // подключите сервис форм (см. README.md).
        try {
          const orders = JSON.parse(localStorage.getItem("kach-orders") || "[]");
          orders.push(order);
          localStorage.setItem("kach-orders", JSON.stringify(orders));
        } catch (err) {}
        saveCart({});
        root.innerHTML = `
          <div class="empty success">
            <div class="success-icon">✓</div>
            <h1>Спасибо за заказ!</h1>
            <p>Номер заказа: <strong>${number}</strong></p>
            <p class="muted">Мы свяжемся с вами по телефону ${esc(data.phone)} в течение рабочего дня, чтобы подтвердить заказ и способ оплаты.</p>
            <a class="btn" href="index.html">На главную</a>
          </div>`;
        window.scrollTo(0, 0);
      });
    },

    about() {}
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderChrome();
    const page = document.body.dataset.page;
    if (pages[page]) pages[page]();
    updateCartCount();
  });
  window.addEventListener("storage", updateCartCount);
})();
