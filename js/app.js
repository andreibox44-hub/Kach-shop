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

  // Иллюстрация товара (см. js/art.js)
  const bottleSvg = (p) => window.KACH_ART.product(p);

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
    const page = (document.querySelector("[data-page]") || document.body).dataset.page;
    const link = (href, label, key) =>
      `<a href="${href}"${page === key ? ' aria-current="page"' : ""}>${label}</a>`;
    const header = $("#site-header");
    if (header) {
      header.innerHTML = `
        <div class="container header-inner">
          <a href="index.html" class="logo">kach<span>natural</span></a>
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
            <a href="index.html" class="logo">kach<span>natural</span></a>
            <p class="muted">Натуральные шампуни из трав и растительных масел.<br>Варим небольшими партиями.</p>
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
        <a href="product.html?id=${p.id}" class="card-image" style="--tint:${p.tint}1a">
          ${p.tag ? `<span class="badge">${esc(p.tag)}</span>` : ""}
          ${bottleSvg(p)}
        </a>
        <div class="card-body">
          <p class="card-type">${esc(p.type)}</p>
          <h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
          <p class="muted small">${esc(p.short)}</p>
          <p class="card-natural small">🌿 ${p.natural}% натуральных ингредиентов</p>
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
      const art = $("#hero-art");
      if (art) {
        const pick = (id) => findProduct(id);
        art.innerHTML =
          `<svg class="hero-herbs" viewBox="0 0 200 200" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
             <g transform="translate(-60 10)">${window.KACH_ART.herb("lavender", "#8a77ad")}</g>
             <g transform="translate(40 0)">${window.KACH_ART.herb("nettle", "#5f7f45")}</g>
           </svg>` +
          [pick("krapiva"), pick("argan"), pick("lavanda")].map((p) => window.KACH_ART.product({ ...p, herb: "" })).join("");
      }
      const ing = $("#ingredients");
      if (ing) {
        const list = [
          ["lavender", "#7d6aa3", "Лаванда", "Успокаивает кожу головы и снимает зуд."],
          ["nettle", "#4f6f3a", "Крапива", "Укрепляет корни и уменьшает жирность."],
          ["chamomile", "#b8901f", "Ромашка", "Смягчает и подходит даже детям."],
          ["mint", "#3f7f6c", "Мята", "Освежает и охлаждает кожу головы."],
          ["argan", "#a36a2c", "Аргановое масло", "Питает сухие и ломкие волосы."],
          ["pine", "#3d5a3f", "Кедр и пихта", "Очищают и дарят лесной аромат."]
        ];
        ing.innerHTML = list
          .map(([h, c, name, text]) => `
            <div class="ingredient">
              <svg viewBox="20 20 180 180" aria-hidden="true">${window.KACH_ART.herb(h, c)}</svg>
              <div><h3>${name}</h3><p>${text}</p></div>
            </div>`)
          .join("");
      }
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
          <div class="product-image" style="--tint:${p.tint}1a">${bottleSvg(p)}</div>
          <div class="product-info">
            <p class="card-type">${esc(p.type)}</p>
            <h1>${esc(p.name)}</h1>
            <p class="price big">${money(p.price)} <span class="muted small">/ ${esc(p.volume)}</span></p>
            <p>${esc(p.description)}</p>
            <div class="natural-meter">
              <div class="row small"><span>Натуральные ингредиенты</span><strong>${p.natural}%</strong></div>
              <div class="meter"><span style="width:${p.natural}%"></span></div>
            </div>
            <div class="keys">${p.keys.map((k) => `<span class="key">🌿 ${esc(k)}</span>`).join("")}</div>
            <p class="muted small">Откуда сырьё: ${esc(p.origin)}</p>
            <div class="buy-row">
              <div class="qty">
                <button type="button" data-step="-1" aria-label="Меньше">−</button>
                <input type="number" id="qty" value="1" min="1" max="99" aria-label="Количество">
                <button type="button" data-step="1" aria-label="Больше">+</button>
              </div>
              <button class="btn" id="buy">Добавить в корзину</button>
            </div>
            <ul class="perks small">
              <li>✓ Без сульфатов, парабенов и силиконов</li>
              <li>✓ Без синтетических отдушек и красителей</li>
              <li>✓ Не тестируется на животных, подходит веганам</li>
              <li>🚚 Бесплатная доставка от ${money(FREE_DELIVERY_FROM)}</li>
            </ul>
            <details open><summary>Полный состав</summary><p>${esc(p.ingredients)}</p></details>
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
                  <a href="product.html?id=${p.id}" class="cart-thumb" style="--tint:${p.tint}1a">${bottleSvg(p)}</a>
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
    const page = (document.querySelector("[data-page]") || document.body).dataset.page;
    if (pages[page]) pages[page]();
    updateCartCount();
  });
  window.addEventListener("storage", updateCartCount);
})();
