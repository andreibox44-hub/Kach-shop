// Общая логика сайта: шапка, подвал, корзина, рендер страниц.
// Все тексты на английском; перевод — через t() из js/i18n.js и файлов js/lang/*.js.
(function () {
  const I18N = window.KACH_I18N;
  const t = I18N.t;
  const sizeLabel = I18N.size;
  const PRODUCTS = window.KACH_PRODUCTS;
  const CATS = window.KACH_CATEGORIES;
  const CART_KEY = "kach-cart-v2";

  // Контакты магазина — замените на свои.
  // Логотипы платёжных систем в футере
  const PAY_BADGES = `<span class="pay-badge" title="Visa"><svg viewBox="0 7.6 24 8.8" aria-hidden="true"><path fill="#1A1F71" d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"/></svg><span class="sr-only">Visa</span></span><span class="pay-badge" title="Mastercard"><svg viewBox="0 0 38 24" aria-hidden="true"><circle cx="13" cy="12" r="10" fill="#EB001B"/><circle cx="25" cy="12" r="10" fill="#F79E1B"/><path fill="#FF5F00" d="M19 4a10 10 0 0 1 0 16a10 10 0 0 1 0-16z"/></svg><span class="sr-only">Mastercard</span></span><span class="pay-badge" title="Apple Pay"><svg viewBox="0 4 24 16" aria-hidden="true"><path fill="#000" d="M2.15 4.318a42.16 42.16 0 0 0-.454.003c-.15.005-.303.013-.452.04a1.44 1.44 0 0 0-1.06.772c-.07.138-.114.278-.14.43-.028.148-.037.3-.04.45A10.2 10.2 0 0 0 0 6.222v11.557c0 .07.002.138.003.207.004.15.013.303.04.452.027.15.072.291.142.429a1.436 1.436 0 0 0 .63.63c.138.07.278.115.43.142.148.027.3.036.45.04l.208.003h20.194l.207-.003c.15-.004.303-.013.452-.04.15-.027.291-.071.428-.141a1.432 1.432 0 0 0 .631-.631c.07-.138.115-.278.141-.43.027-.148.036-.3.04-.45.002-.07.003-.138.003-.208l.001-.246V6.221c0-.07-.002-.138-.004-.207a2.995 2.995 0 0 0-.04-.452 1.446 1.446 0 0 0-1.2-1.201 3.022 3.022 0 0 0-.452-.04 10.448 10.448 0 0 0-.453-.003zm0 .512h19.942c.066 0 .131.002.197.003.115.004.25.01.375.032.109.02.2.05.287.094a.927.927 0 0 1 .407.407.997.997 0 0 1 .094.288c.022.123.028.258.031.374.002.065.003.13.003.197v11.552c0 .065 0 .13-.003.196-.003.115-.009.25-.032.375a.927.927 0 0 1-.5.693 1.002 1.002 0 0 1-.286.094 2.598 2.598 0 0 1-.373.032l-.2.003H1.906c-.066 0-.133-.002-.196-.003a2.61 2.61 0 0 1-.375-.032c-.109-.02-.2-.05-.288-.094a.918.918 0 0 1-.406-.407 1.006 1.006 0 0 1-.094-.288 2.531 2.531 0 0 1-.032-.373 9.588 9.588 0 0 1-.002-.197V6.224c0-.065 0-.131.002-.197.004-.114.01-.248.032-.375.02-.108.05-.199.094-.287a.925.925 0 0 1 .407-.406 1.03 1.03 0 0 1 .287-.094c.125-.022.26-.029.375-.032.065-.002.131-.002.196-.003zm4.71 3.7c-.3.016-.668.199-.88.456-.191.22-.36.58-.316.918.338.03.675-.169.888-.418.205-.258.345-.603.308-.955zm2.207.42v5.493h.852v-1.877h1.18c1.078 0 1.835-.739 1.835-1.812 0-1.07-.742-1.805-1.808-1.805zm.852.719h.982c.739 0 1.161.396 1.161 1.089 0 .692-.422 1.092-1.164 1.092h-.979zm-3.154.3c-.45.01-.83.28-1.05.28-.235 0-.593-.264-.981-.257a1.446 1.446 0 0 0-1.23.747c-.527.908-.139 2.255.374 2.995.249.366.549.769.944.754.373-.014.52-.242.973-.242.454 0 .586.242.98.235.41-.007.667-.366.915-.733.286-.417.403-.82.41-.841-.007-.008-.79-.308-.797-1.209-.008-.754.615-1.113.644-1.135-.352-.52-.9-.578-1.09-.593a1.123 1.123 0 0 0-.092-.002zm8.204.397c-.99 0-1.606.533-1.652 1.256h.777c.072-.358.369-.586.845-.586.502 0 .803.266.803.711v.309l-1.097.064c-.951.054-1.488.484-1.488 1.184 0 .72.548 1.207 1.332 1.207.526 0 1.032-.281 1.264-.727h.019v.659h.788v-2.76c0-.803-.62-1.317-1.591-1.317zm1.94.072l1.446 4.009c0 .003-.073.24-.073.247-.125.41-.33.571-.711.571-.069 0-.206 0-.267-.015v.666c.06.011.267.019.335.019.83 0 1.226-.312 1.568-1.283l1.5-4.214h-.868l-1.012 3.259h-.015l-1.013-3.26zm-1.167 2.189v.316c0 .521-.45.917-1.024.917-.442 0-.731-.228-.731-.579 0-.342.278-.56.769-.593z"/></svg><span class="sr-only">Apple Pay</span></span><span class="pay-badge" title="Google Pay"><svg viewBox="0 6.5 24 11" aria-hidden="true"><path fill="#3c4043" d="M3.963 7.235A3.963 3.963 0 00.422 9.419a3.963 3.963 0 000 3.559 3.963 3.963 0 003.541 2.184c1.07 0 1.97-.352 2.627-.957.748-.69 1.18-1.71 1.18-2.916a4.722 4.722 0 00-.07-.806H3.964v1.526h2.14a1.835 1.835 0 01-.79 1.205c-.356.241-.814.379-1.35.379-1.034 0-1.911-.697-2.225-1.636a2.375 2.375 0 010-1.517c.314-.94 1.191-1.636 2.225-1.636a2.152 2.152 0 011.52.594l1.132-1.13a3.808 3.808 0 00-2.652-1.033zm6.501.55v6.9h.886V11.89h1.465c.603 0 1.11-.196 1.522-.588a1.911 1.911 0 00.635-1.464 1.92 1.92 0 00-.635-1.456 2.125 2.125 0 00-1.522-.598zm2.427.85a1.156 1.156 0 01.823.365 1.176 1.176 0 010 1.686 1.171 1.171 0 01-.877.357H11.35V8.635h1.487a1.156 1.156 0 01.054 0zm4.124 1.175c-.842 0-1.477.308-1.907.925l.781.491c.288-.417.68-.626 1.175-.626a1.255 1.255 0 01.856.323 1.009 1.009 0 01.366.785v.202c-.34-.193-.774-.289-1.3-.289-.617 0-1.11.145-1.479.434-.37.288-.554.677-.554 1.165a1.476 1.476 0 00.525 1.156c.35.308.785.463 1.305.463.61 0 1.098-.27 1.465-.81h.038v.655h.848v-2.909c0-.61-.19-1.09-.568-1.44-.38-.35-.896-.525-1.551-.525zm2.263.154l1.946 4.422-1.098 2.38h.915L24 9.963h-.965l-1.368 3.391h-.02l-1.406-3.39zm-2.146 2.368c.494 0 .88.11 1.156.33 0 .372-.147.696-.44.973a1.413 1.413 0 01-.997.414 1.081 1.081 0 01-.69-.232.708.708 0 01-.293-.578c0-.257.12-.47.363-.647.24-.173.54-.26.9-.26Z"/></svg><span class="sr-only">Google Pay</span></span>`;

  const CONTACTS = {
    phone: "+39 389 040 5737",
    phoneHref: "+393890405737",
    email: "supearius@gmail.com",
    get hours() {
      return t("Daily 10:00–20:00");
    },
    address: "Str. Adrian Adamiu nr. 8, 710013 Botoșani, România",
    company: "FIRMA DE COMERT ROMAVA SRL · CUI RO35249323 · J07/458/2015",
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
    vk: ["VK", '<path d="M3 7h3c.5 3 2 5 3.5 5.5V7h3v3c1.5 0 3-1.5 3.5-3h3c-.5 2.5-2.5 4-3.5 4.5 1 .5 3 2 3.8 4.5h-3.3c-.6-1.6-2-3-3.5-3V16h-1C7 16 3.5 12.5 3 7z"/>']
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
  // Цена в формате 23.00 € (тысячи через пробел: 1 047.00 €)
  const money = (n) => Number(n).toFixed(2).replace(/\B(?=(\d{3})+\.)/g, " ") + " €";
  const findProduct = (id) => PRODUCTS.find((p) => p.id === id);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const img = (p) => `images/products/${p.id}.jpg?v=7`;
  const poster = (p) => `images/posters/${p.id}.jpg`;
  const pageName = () => (document.querySelector("[data-page]") || document.body).dataset.page;

  const SHIP = window.KACH_SHIPPING;
  // Romania: prices include 21% VAT; other countries: without VAT
  const vatNote = (many) =>
    window.KACH_PRICE_COUNTRY === "RO"
      ? t(many ? "Prices include VAT" : "Price incl. VAT")
      : t(many ? "Prices excl. VAT (Romania: +21% VAT)" : "Price excl. VAT (Romania: +21% VAT)");
  // "Free delivery from 40 € in Romania, from 80 € to Italy, Germany and France"
  const freeDeliveryNote = () =>
    t("Free delivery from {ro} in Romania, from {eu} to Italy, Germany and France", {
      ro: money(SHIP.RATES.RO.freeFrom).replace(".00", ""),
      eu: money(SHIP.RATES.IT.freeFrom).replace(".00", "")
    });

  // Size for addresses: "250 мл" -> "250ml", "Набор" -> "kit"
  const sizeSlug = (s) => (String(s) === "Набор" ? "kit" : String(s).replace(/\D/g, "") + "ml");

  // Product data for Google (schema.org): name, photo, price of each size, stock,
  // free delivery to RO/IT/DE/FR and the 14-day return policy.
  function addProductSchema(p) {
    const SITE = "https://kachhair.com";
    const lang = I18N.lang;
    const url = (v) =>
      `${SITE}/product.html?id=${p.id}` + (p.variants.length > 1 ? `&size=${sizeSlug(v.size)}` : "") + (lang !== "en" ? `&lang=${lang}` : "") + (window.KACH_PRICE_COUNTRY === "RO" ? "&country=RO" : "");
    const RATES = SHIP.RATES;
    const countries = Object.keys(RATES);
    // Cheapest delivery of one item to each country
    const shipping = (price) =>
      countries.map((c) => ({
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: Math.min(SHIP.cost(c, "courier", price), SHIP.cost(c, "post", price)), currency: "EUR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: c }
      }));
    const returns = {
      "@type": "MerchantReturnPolicy",
      applicableCountry: countries,
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 14,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/ReturnShippingFees"
    };
    const offers = p.variants
      .filter((v) => typeof v.price === "number")
      .map((v) => ({
        "@type": "Offer",
        sku: p.variants.length > 1 ? `${p.id}-${sizeSlug(v.size)}` : p.id,
        name: `${p.name} ${sizeLabel(v.size)}`,
        url: url(v),
        price: v.price.toFixed(2),
        priceCurrency: "EUR",
        availability: p.soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: "KACH Hair Organic Solutions" },
        shippingDetails: shipping(v.price),
        hasMerchantReturnPolicy: returns
      }));
    const data = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      description: [p.short].concat(p.description).join(" "),
      image: [`${SITE}/images/products/${p.id}.jpg`],
      sku: p.id,
      brand: { "@type": "Brand", name: "KACH" },
      category: CATS[p.category],
      offers
    };
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);
  }

  function priceLabel(p) {
    const prices = p.variants.map((v) => v.price).filter((x) => typeof x === "number");
    if (!prices.length) return t("Price on request");
    const min = Math.min(...prices);
    return (prices.length < p.variants.length || new Set(prices).size > 1 ? t("from") + " " : "") + money(min);
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
    if (p.soldOut) return toast(t("This product is currently out of stock"));
    const v = p.variants.find((x) => x.size === size) || p.variants[0];
    const cart = getCart();
    const k = keyOf(id, v.size);
    cart[k] = Math.min(99, (cart[k] || 0) + qty);
    saveCart(cart);
    toast(t("Added to cart"));
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
      .filter((i) => i.product && i.variant && i.qty > 0 && !i.product.soldOut);
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
  const logo = `<a href="index.html" class="logo" aria-label="${t("KACH — home page")}"><span class="logo-word">KACH</span><span class="logo-sub">Hair Organic Solutions</span></a>`;

  // Выбор языка в шапке
  const langSwitch = () => `
          <label class="lang-switch">
            <span class="sr-only">Language</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>
            <select data-lang-select aria-label="Language">
              ${Object.keys(I18N.LANGS)
                .map((code) => `<option value="${code}"${code === I18N.lang ? " selected" : ""} title="${I18N.LANGS[code]}">${code.toUpperCase()}</option>`)
                .join("")}
            </select>
          </label>`;

  function renderChrome() {
    const page = pageName();
    const link = (href, label, key) => `<a href="${href}"${page === key ? ' aria-current="page"' : ""}>${label}</a>`;
    const header = $("#site-header");
    if (header) {
      header.innerHTML = `
        <div class="container header-inner">
          ${logo}
          <button class="menu-toggle" aria-label="${t("Menu")}" aria-expanded="false">☰</button>
          <nav class="nav">
            ${link("index.html", t("Home"), "home")}
            ${link("catalog.html", t("Catalog"), "catalog")}
            ${link("about.html", t("About the brand"), "about")}
            ${link("about.html#contacts", t("Contacts"), "")}
          </nav>
          <a href="account.html" class="account-link" aria-label="${t("My account")}" data-account-link>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>
            <span class="account-initial" hidden></span>
          </a>
          ${langSwitch()}
          <a href="cart.html" class="cart-link" aria-label="${t("Cart")}">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6 5 3H2"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>
            <span class="cart-count" data-cart-count hidden>0</span>
          </a>
        </div>`;
      const ls = $("[data-lang-select]", header);
      ls.addEventListener("change", () => I18N.setLang(ls.value));
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
          <div class="footer-brand">
            ${logo}
            <p class="footer-note">${t("Professional hair care with natural ingredients. Nature. Science. Beauty.")}</p>
          </div>
          <div>
            <h4>${t("Catalog")}</h4>
            ${Object.entries(CATS)
              .map(([k, v]) => `<a href="catalog.html${k === "all" ? "" : "?cat=" + k}">${k === "all" ? t("All products") : v}</a>`)
              .join("")}
          </div>
          <div>
            <h4>${t("Customer info")}</h4>
            <a href="info.html#delivery">${t("Delivery")}</a>
            <a href="info.html#payment">${t("Payment")}</a>
            <a href="info.html#returns">${t("Returns and exchanges")}</a>
            <a href="info.html#faq">${t("FAQ")}</a>
            <a href="cart.html">${t("Cart")}</a>
          </div>
          <div>
            <h4>${t("Company")}</h4>
            <a href="about.html">${t("About the brand")}</a>
            <a href="info.html#pro">${t("For salons and stylists")}</a>
            <a href="about.html#contacts">${t("Contacts")}</a>
          </div>
          <div>
            <h4>${t("Contacts")}</h4>
            <a href="tel:${CONTACTS.phoneHref}" class="footer-phone">${CONTACTS.phone}</a>
            <a href="mailto:${CONTACTS.email}">${CONTACTS.email}</a>
            <span>${CONTACTS.hours}</span>
            <span>${CONTACTS.address}</span>
          </div>
        </div>
        <div class="container footer-bottom">
          <div class="pay" aria-label="${t("Payment methods")}">
            ${PAY_BADGES}
          </div>
          <div class="legal">
            <a href="info.html#privacy">${t("Privacy policy")}</a>
            <a href="info.html#offer">${t("Terms of sale")}</a>
          </div>
        </div>
        <div class="container footer-langs" aria-label="Language">
          ${Object.entries(I18N.LANGS)
            .map(([code, name]) => `<a href="${I18N.urlFor(code)}" hreflang="${code}" lang="${code}"${code === I18N.lang ? ' aria-current="true"' : ""} data-lang="${code}">${name}</a>`)
            .join("")}
        </div>
        <div class="container copyright">
          <span>© ${new Date().getFullYear()} KACH Hair Organic Solutions. ${t("All rights reserved.")}</span>
          <span>${CONTACTS.company}</span>
        </div>`;
    }
    document.querySelectorAll("[data-pay-badges]").forEach((el) => (el.innerHTML = PAY_BADGES));
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
    `<button class="fav${isFav(id) ? " on" : ""}${extra}" data-fav="${id}" aria-pressed="${isFav(id)}" aria-label="${t("Add to favourites")}">${HEART}</button>`;
  const HEART = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
  function refreshFavs() {
    document.querySelectorAll("[data-fav]").forEach((b) => {
      const on = isFav(b.dataset.fav);
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on);
    });
  }
  window.KACH_UI = { productCard: (p) => productCard(p), money, esc, img, findProduct, CATS, toast, t, sizeLabel };

  // ---------- Карточка товара ----------
  function productCard(p) {
    return `
      <article class="card">
        <a href="product.html?id=${p.id}" class="card-image">
          ${p.tag ? `<span class="badge">${esc(t(p.tag))}</span>` : ""}
          <img src="${img(p)}" alt="${esc(p.name)}" loading="lazy" width="560" height="700">
        </a>
        ${favButton(p.id)}
        <div class="card-body">
          <p class="card-type">${esc(CATS[p.category])}</p>
          <h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
          <p class="card-sub">${esc(p.subtitle)}</p>
          <p class="card-sizes">${p.variants.map((v) => esc(sizeLabel(v.size))).join(" · ")}${p.ph ? ` · pH ${esc(p.ph)}` : ""}</p>
          <div class="card-footer">
            ${
              p.soldOut
                ? `<span class="price sold-out">${t("Out of stock")}</span>`
                : `<span class="price">${priceLabel(p)}</span>
            <button class="btn btn-small" data-add="${p.id}">${t("Add to cart")}</button>`
            }
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
        .then((on) => toast(on ? t("Added to favourites") : t("Removed from favourites")))
        .catch((err) => toast(AUTH().errorText(err)));
    }
    if (btn) {
      const p = findProduct(btn.dataset.add);
      if (p) addToCart(p.id, p.variants[0].size);
    }
  });

  // ---------- Страницы ----------
  // Плакат товара в стиле бренда, текст на языке сайта (вместо итальянской картинки)
  const LEAF = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Zm0 0 7-7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  function posterCard(p) {
    const sizes = p.variants.map((v) => sizeLabel(v.size)).join(" · ");
    return `
      <figure class="poster-card" aria-label="${esc(t("Poster"))} ${esc(p.name)}">
        <div class="pc-photo"><img src="${img(p)}" alt="${esc(p.name)}" loading="lazy"></div>
        <div class="pc-body">
          <div class="pc-logo">KACH<small>HAIR ORGANIC SOLUTIONS</small></div>
          <h3 class="pc-name">${esc(p.name)}</h3>
          <div class="pc-sub">${esc(p.subtitle)}</div>
          <p class="pc-short">${esc(p.short)}</p>
          <ul class="pc-ben">${p.benefits.map((b) => `<li>${LEAF}<span>${esc(b)}</span></li>`).join("")}</ul>
        </div>
        <div class="pc-bar">
          <div><span>${t("Size")}</span><strong>${esc(sizes)}</strong></div>
          ${p.ph ? `<div><span class="pc-ph">pH</span><strong>${esc(p.ph)}</strong></div>` : ""}
          <div class="pc-hair"><span>${t("For hair")}</span><strong>${esc(p.hair)}</strong></div>
        </div>
      </figure>`;
  }

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
        <h1>${t("Payment successful!")}</h1>
        ${number ? `<p>${t("Order {n} has been paid.", { n: `<strong>${esc(number)}</strong>` })}</p>` : ""}
        <p class="muted">${t("Thank you! We will contact you to arrange delivery.")}</p>
        <a class="btn" href="${AUTH() && AUTH().user ? "account.html#orders" : "index.html"}">${AUTH() && AUTH().user ? t("My orders") : t("Back to home")}</a>
      </div>`;
  }

  // Экран «оплатите заказ»: кнопка Stripe и/или кнопки PayPal
  async function showPayScreen(root, { number, token, provider, note }) {
    const auth = AUTH();
    root.innerHTML = `
      <div class="empty pay-screen">
        <h1>${number ? t("Payment for order {n}", { n: esc(number) }) : t("Order payment")}</h1>
        <p class="muted">${note || t("Your order has been saved. All that is left is to pay for it.")}</p>
        <div class="pay-actions">
          <button class="btn btn-block" id="pay-stripe-btn" hidden>${t("Pay by card")}</button>
          <div id="paypal-buttons"></div>
        </div>
        <p class="form-msg err" id="pay-err" hidden></p>
        <p class="muted small">${t("Your order has been saved. If the payment does not go through, contact us and we will help.")}</p>
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
      return err(t("Online payment is currently unavailable."));
    }
    if (cfg.stripe && provider !== "paypal") {
      const b = $("#pay-stripe-btn");
      b.hidden = false;
      b.addEventListener("click", async () => {
        b.disabled = true;
        b.textContent = t("Opening payment…");
        try {
          location.href = (await auth.pay("stripe-session", { token, lang: I18N.lang })).url;
        } catch (e) {
          b.disabled = false;
          b.textContent = t("Pay by card");
          err(e.message === "already paid" ? t("This order has already been paid.") : t("Could not open card payment. Please try again."));
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
            err(t("PayPal could not process the payment. Please try again."));
          }
        }).render("#paypal-buttons");
      } catch (e) {
        err(t("Could not load PayPal."));
      }
    }
  }

  // Возврат со страницы оплаты Stripe
  async function paymentReturn(root, qs) {
    const auth = AUTH();
    if (!auth || !auth.enabled) return;
    const token = qs.get("paid") || qs.get("pay");
    if (qs.get("paid") && qs.get("session")) {
      root.innerHTML = `<div class="empty"><p class="muted">${t("Checking payment…")}</p></div>`;
      try {
        const r = await auth.pay("stripe-verify", { token, session: qs.get("session") });
        if (r.paid) return paidScreen(root, "");
      } catch (e) {
        console.error(e);
      }
    }
    showPayScreen(root, { token, provider: "", note: t("The payment was not completed. Your order has been saved and you can pay for it now.") });
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
        root.innerHTML = `<div class="empty"><h1>${t("Product not found")}</h1><p><a class="btn" href="catalog.html">${t("Go to catalog")}</a></p></div>`;
        return;
      }
      document.title = `${p.name} — KACH`;
      // ?size=250ml opens the page with that size selected (links from Google Shopping)
      const wanted = new URLSearchParams(location.search).get("size");
      const pick = p.variants.find((v) => sizeSlug(v.size) === wanted);
      let size = (pick || p.variants[0]).size;
      addProductSchema(p);
      const priceOf = (s) => {
        if (p.soldOut) return t("Out of stock");
        const v = p.variants.find((x) => x.size === s);
        return typeof v.price === "number" ? money(v.price) : t("Price on request");
      };
      root.innerHTML = `
        <nav class="breadcrumbs"><a href="catalog.html">${t("Catalog")}</a> / <a href="catalog.html?cat=${p.category}">${esc(CATS[p.category])}</a> / ${esc(p.name)}</nav>
        <div class="product-layout">
          <div class="product-image"><img src="${img(p)}" alt="${esc(p.name)}" width="560" height="700"></div>
          <div class="product-info">
            <p class="card-type">${esc(CATS[p.category])}</p>
            <h1>${esc(p.name)}</h1>
            <p class="product-sub">${esc(p.subtitle)}</p>
            <p class="price big" id="price">${priceOf(size)}</p>
            ${p.soldOut ? "" : `<p class="vat-note">${vatNote(false)} · <a href="info.html#delivery">${freeDeliveryNote()}</a></p>`}
            ${
              p.variants.length > 1
                ? `<div class="sizes" role="radiogroup" aria-label="${t("Size")}">${p.variants
                    .map((v) => `<button class="chip${v.size === size ? " active" : ""}" data-size="${esc(v.size)}" role="radio" aria-checked="${v.size === size}">${esc(sizeLabel(v.size))}</button>`)
                    .join("")}</div>`
                : `<p class="muted">${esc(sizeLabel(p.variants[0].size))}</p>`
            }
            <div class="buy-row">
              <div class="qty">
                <button type="button" data-step="-1" aria-label="${t("Less")}">−</button>
                <input type="number" id="qty" value="1" min="1" max="99" aria-label="${t("Quantity")}">
                <button type="button" data-step="1" aria-label="${t("More")}">+</button>
              </div>
              <button class="btn" id="buy"${p.soldOut ? " disabled" : ""}>${p.soldOut ? t("Out of stock") : t("Add to cart")}</button>
              ${favButton(p.id, " fav-big")}
            </div>
            <dl class="specs">
              <div><dt>${t("For hair")}</dt><dd>${esc(p.hair)}</dd></div>
              ${p.ph ? `<div><dt>pH</dt><dd>${esc(p.ph)}</dd></div>` : ""}
              <div><dt>${t("Formula")}</dt><dd>${esc(p.formula)}</dd></div>
            </dl>
            <ul class="benefits">${p.benefits.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
          </div>
        </div>
        <section class="product-details">
          <div class="details-text">
            <h2>${t("Description")}</h2>
            ${p.description.map((t) => `<p>${esc(t)}</p>`).join("")}
            <h3>${t("Key active ingredients")}</h3>
            <div class="keys">${p.actives.map((k) => `<span class="key">${esc(k)}</span>`).join("")}</div>
          </div>
          ${posterCard(p)}
        </section>
        <section class="section">
          <h2>${t("You may also like")}</h2>
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
          root.innerHTML = `<div class="empty"><p>${t("Your cart is empty.")}</p><a class="btn" href="catalog.html">${t("Go to catalog")}</a></div>`;
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
                    <span class="muted small">${esc(sizeLabel(v.size))} · ${typeof v.price === "number" ? money(v.price) : t("price on request")}</span>
                  </div>
                  <div class="qty">
                    <button data-key="${esc(key)}" data-delta="-1" aria-label="${t("Less")}">−</button>
                    <span>${qty}</span>
                    <button data-key="${esc(key)}" data-delta="1" aria-label="${t("More")}">+</button>
                  </div>
                  <strong class="cart-sum">${typeof v.price === "number" ? money(v.price * qty) : "—"}</strong>
                  <button class="remove" data-remove="${esc(key)}" aria-label="${t("Remove")}">×</button>
                </div>`
                )
                .join("")}
            </div>
            <aside class="summary">
              <h3>${t("Total")}</h3>
              ${
                allPriced
                  ? `<div class="row total"><span>${t("To pay")}</span><span>${money(total)}</span></div><p class="vat-note">${vatNote(true)}</p>`
                  : `<p class="muted small">${t("The manager will tell you the exact cost of the order and delivery after checkout.")}</p>`
              }
              <a href="checkout.html" class="btn btn-block">${t("Checkout")}</a>
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
        root.innerHTML = `<div class="empty"><p>${t("There are no products in your cart.")}</p><a class="btn" href="catalog.html">${t("Go to catalog")}</a></div>`;
        return;
      }
      const form = $("#checkout-form");
      // Delivery cost for the chosen country and method
      const shipNow = () => {
        const country = ($("#country") || {}).value;
        const method = (form.querySelector('input[name="delivery"]:checked') || {}).value || "courier";
        return SHIP.cost(country, method, total);
      };
      // Prices depend on the delivery country (Romania: + VAT): reload when it changes the prices
      const watchCountry = () => {
        const c = ($("#country") || {}).value;
        if (!c) return;
        try {
          localStorage.setItem("kach-country", c);
        } catch (e) {}
        if ((c === "RO") !== (window.KACH_PRICE_COUNTRY === "RO")) location.reload();
      };
      form.addEventListener("change", (e) => {
        if (e.target && e.target.id === "country") watchCountry();
      });
      const drawSummary = () => {
        const ship = shipNow();
        $("#order-summary").innerHTML = `
        <h3>${t("Your order")}</h3>
        ${items
          .map(
            ({ product: p, variant: v, qty }) =>
              `<div class="row"><span>${esc(p.name)}, ${esc(sizeLabel(v.size))} × ${qty}</span><span>${typeof v.price === "number" ? money(v.price * qty) : "—"}</span></div>`
          )
          .join("")}
        ${
          allPriced
            ? `<div class="row"><span>${t("Delivery")}</span><span>${ship == null ? "—" : ship === 0 ? t("Free") : money(ship)}</span></div>
               <div class="row total"><span>${t("To pay")}</span><span>${money(total + (ship || 0))}</span></div><p class="vat-note">${vatNote(true)}</p>
               <p class="muted small"><a href="info.html#delivery">${freeDeliveryNote()}</a></p>`
            : `<p class="muted small">${t("The manager will tell you the cost of the order and delivery.")}</p>`
        }`;
      };
      form.addEventListener("change", drawSummary);
      const auth = AUTH();
      // Страна и адрес в формате выбранной страны
      const ADDR = window.KACH_ADDR;
      const bindAddr = (values) =>
        ADDR.bind($("#country"), $("#addr-fields"), values, "", (c) => {
          $("#phone").placeholder = c.phone;
        });
      // Черновик формы: всё введённое хранится в этом браузере и не пропадает при обновлении страницы
      const DRAFT_KEY = "kach-checkout-draft";
      let draft = {};
      try {
        draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}") || {};
      } catch (e) {}
      bindAddr(draft);
      watchCountry();
      drawSummary();
      ["name", "phone", "email", "comment"].forEach((k) => {
        const el = $("#" + k);
        if (el && draft[k]) el.value = draft[k];
      });
      ["delivery", "payment"].forEach((k) => {
        const el = draft[k] && form.querySelector(`input[name="${k}"][value="${draft[k]}"]`);
        if (el && !el.closest("[hidden]")) el.checked = true;
      });
      drawSummary();
      const saveDraft = () => {
        try {
          const d = Object.fromEntries(new FormData(form));
          localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
        } catch (e) {}
      };
      form.addEventListener("input", saveDraft);
      form.addEventListener("change", saveDraft);
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
          if (addr && !draft.country) {
            const fresh = $("#country").cloneNode(false);
            $("#country").replaceWith(fresh);
            bindAddr(addr);
            watchCountry();
            drawSummary();
          }
        });
      }
      // Оплата только онлайн: проверяем, что она настроена и у всех товаров есть цена
      const submitBtn = form.querySelector('[type="submit"]');
      const payOff = (msg) => {
        const el = $("#pay-unavailable");
        el.textContent = msg;
        el.hidden = false;
        submitBtn.disabled = true;
      };
      if (!allPriced) {
        payOff(t("Some products in your cart have no price, so the order cannot be paid online yet. Please contact us."));
      } else if (!auth || !auth.enabled) {
        payOff(t("Online payment is currently unavailable. Please try again later."));
      } else {
        auth
          .pay("config")
          .then((cfg) => {
            if (cfg.paypal) $("#pay-paypal").hidden = false;
            if (cfg.test) $("#pay-test").hidden = false;
            if (!cfg.stripe && !cfg.paypal) payOff(t("Online payment is currently unavailable. Please try again later."));
          })
          .catch((err) => console.warn("payments:", err));
      }
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const data = Object.fromEntries(new FormData(form));
        const ship = shipNow() || 0;
        data.shipping = String(ship);
        const number = "K-" + Date.now().toString().slice(-6);
        const orderItems = items.map(({ product: p, variant: v, qty }) => ({ id: p.id, name: p.baseName || p.name, size: v.size, price: v.price, qty }));
        const submit = form.querySelector('[type="submit"]');
        const online = data.payment === "card" || data.payment === "paypal";
        const payToken = crypto.randomUUID ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
        // Отправляем заказ в базу (Supabase), если она подключена
        if (auth && auth.enabled) {
          submit.disabled = true;
          submit.textContent = t("Sending…");
          try {
            await auth.saveOrder({ number, customer: data, items: orderItems, total: allPriced ? total + ship : null, pay_token: payToken });
          } catch (err) {
            console.error(err);
            submit.disabled = false;
            submit.textContent = t("Proceed to payment");
            toast(t("Could not send the order. Please try again or call us."));
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
        // Контакты и адрес остаются на следующий раз, комментарий — нет
        try {
          const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
          delete d.comment;
          localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
        } catch (e) {}
        if (online && auth && auth.enabled) {
          if (data.payment === "card") {
            submit.textContent = t("Opening payment…");
            try {
              const { url } = await auth.pay("stripe-session", { token: payToken, lang: I18N.lang });
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
            <h1>${t("Thank you for your order!")}</h1>
            <p>${t("Order number:")} <strong>${number}</strong></p>
            <p class="muted">${t("We will call you at {phone} to confirm the order, cost and delivery.", { phone: esc(data.phone) })}</p>
            <a class="btn" href="${auth && auth.user ? "account.html#orders" : "index.html"}">${auth && auth.user ? t("My orders") : t("Back to home")}</a>
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
          a.setAttribute("aria-label", u ? t("My account") + ": " + name : t("Sign in to your account"));
        });
      });
    }
  });
  window.addEventListener("storage", updateCartCount);
})();
