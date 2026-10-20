// Общая логика сайта: шапка, подвал, корзина, рендер страниц.
(function () {
  const PRODUCTS = window.KACH_PRODUCTS;
  const CATS = window.KACH_CATEGORIES;
  const CART_KEY = "kach-cart-v2";

  // Контакты магазина — замените на свои.
  const CONTACTS = {
    phone: "+7 (000) 000-00-00",
    phoneHref: "+70000000000",
    email: "info@kachhair.com",
    hours: "Ежедневно 10:00–20:00"
  };

  // ---------- Утилиты ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const money = (n) => n.toLocaleString("ru-RU") + " ₽";
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
            ${logo}
            <p class="footer-note">Natura. Scienza. Bellezza.<br>Профессиональный уход за волосами на натуральных ингредиентах.</p>
          </div>
          <div>
            <h4>Каталог</h4>
            ${Object.entries(CATS)
              .filter(([k]) => k !== "all")
              .map(([k, v]) => `<a href="catalog.html?cat=${k}">${v}</a>`)
              .join("")}
          </div>
          <div>
            <h4>Связаться</h4>
            <a href="tel:${CONTACTS.phoneHref}">${CONTACTS.phone}</a>
            <a href="mailto:${CONTACTS.email}">${CONTACTS.email}</a>
            <span>${CONTACTS.hours}</span>
          </div>
        </div>
        <div class="container copyright">© ${new Date().getFullYear()} KACH Hair Organic Solutions</div>`;
    }
    document.querySelectorAll("[data-contact]").forEach((el) => {
      const k = el.dataset.contact;
      if (k === "phone") el.innerHTML = `<a href="tel:${CONTACTS.phoneHref}">${CONTACTS.phone}</a>`;
      if (k === "email") el.innerHTML = `<a href="mailto:${CONTACTS.email}">${CONTACTS.email}</a>`;
      if (k === "hours") el.textContent = CONTACTS.hours;
    });
  }

  // ---------- Карточка товара ----------
  function productCard(p) {
    return `
      <article class="card">
        <a href="product.html?id=${p.id}" class="card-image">
          ${p.tag ? `<span class="badge">${esc(p.tag)}</span>` : ""}
          <img src="${img(p)}" alt="${esc(p.name)}" loading="lazy" width="560" height="700">
        </a>
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
    if (btn) {
      const p = findProduct(btn.dataset.add);
      if (p) addToCart(p.id, p.variants[0].size);
    }
  });

  // ---------- Страницы ----------
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
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const data = Object.fromEntries(new FormData(form));
        const number = "K-" + Date.now().toString().slice(-6);
        // Заказ пока сохраняется только в браузере покупателя.
        // Чтобы заказы приходили вам, подключите сервис форм (см. README.md).
        try {
          const orders = JSON.parse(localStorage.getItem("kach-orders") || "[]");
          orders.push({
            number,
            date: new Date().toISOString(),
            customer: data,
            items: items.map(({ product: p, variant: v, qty }) => ({ id: p.id, name: p.name, size: v.size, price: v.price, qty }))
          });
          localStorage.setItem("kach-orders", JSON.stringify(orders));
        } catch (err) {}
        saveCart({});
        root.innerHTML = `
          <div class="empty success">
            <div class="success-icon">✓</div>
            <h1>Спасибо за заказ!</h1>
            <p>Номер заказа: <strong>${number}</strong></p>
            <p class="muted">Мы свяжемся с вами по телефону ${esc(data.phone)}, чтобы подтвердить заказ, стоимость и доставку.</p>
            <a class="btn" href="index.html">На главную</a>
          </div>`;
        window.scrollTo(0, 0);
      });
    },

    about() {}
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderChrome();
    const page = pageName();
    if (pages[page]) pages[page]();
    updateCartCount();
  });
  window.addEventListener("storage", updateCartCount);
})();
