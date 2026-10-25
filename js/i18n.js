// Languages of the site. English is the main language (texts in the HTML and JS files).
// Translations live in js/lang/de.js, it.js, ro.js, fr.js. Only the chosen language file is loaded.
// The choice comes from ?lang=xx in the address, otherwise from the visitor's last choice.
(function () {
  const LANGS = { en: "English", de: "Deutsch", it: "Italiano", ro: "Română", fr: "Français" };
  const LOCALES = { en: "en-GB", de: "de-DE", it: "it-IT", ro: "ro-RO", fr: "fr-FR" };
  const KEY = "kach-lang";
  const SITE = "https://kachhair.com";
  let lang = "en";
  let fromUrl = false;
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q && LANGS[q]) {
      lang = q;
      fromUrl = true;
      localStorage.setItem(KEY, q);
    } else {
      const s = localStorage.getItem(KEY);
      if (s && LANGS[s]) lang = s;
    }
  } catch (e) {}

  const dict = {};
  // Text in the chosen language; {name} parts are filled from vars
  function t(s, vars) {
    let r = dict[s] != null ? dict[s] : s;
    if (vars) r = String(r).replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    return r;
  }
  // Pack sizes are stored as "250 мл" / "Набор" (the payment table uses them); shown translated
  const size = (s) => (String(s) === "Набор" ? t("Kit") : String(s).replace(/\s*мл$/, " ml"));

  // Page address in another language
  function urlFor(code, href) {
    const u = new URL(href || location.href);
    if (code === "en") u.searchParams.delete("lang");
    else u.searchParams.set("lang", code);
    return u.pathname + u.search + u.hash;
  }
  function setLang(code) {
    if (!LANGS[code]) return;
    try {
      localStorage.setItem(KEY, code);
    } catch (e) {}
    location.href = urlFor(code);
  }

  // Swaps texts marked with data-i18n (inner HTML), data-i18n-alt, data-i18n-content, data-i18n-aria
  function apply(root = document) {
    if (lang !== "en") {
      root.querySelectorAll("[data-i18n]").forEach((el) => {
        const v = dict[el.dataset.i18n];
        if (v != null) el.innerHTML = v;
      });
      [["alt", "data-i18n-alt"], ["content", "data-i18n-content"], ["aria-label", "data-i18n-aria"]].forEach(([attr, data]) =>
        root.querySelectorAll("[" + data + "]").forEach((el) => {
          const v = dict[el.getAttribute(data)];
          if (v != null) el.setAttribute(attr, v);
        })
      );
    }
    // Address of this page in this language for search engines
    if (root === document && fromUrl && lang !== "en") {
      const can = document.querySelector('link[rel="canonical"]');
      const og = document.querySelector('meta[property="og:url"]');
      const own = SITE + urlFor(lang).split("#")[0];
      if (can) can.href = own;
      if (og) og.content = own;
    }
    document.documentElement.classList.remove("i18n-wait");
  }

  document.documentElement.lang = lang;
  window.KACH_I18N = { lang, LANGS, locale: LOCALES[lang], dict, products: {}, t, size, apply, setLang, urlFor };

  if (lang !== "en") {
    // Hide the page for a moment so English text does not flash before the translation
    document.documentElement.classList.add("i18n-wait");
    setTimeout(() => document.documentElement.classList.remove("i18n-wait"), 2500);
    const me = document.currentScript && document.currentScript.src;
    const v = me && me.includes("?") ? me.slice(me.indexOf("?")) : "";
    document.write('<script src="js/lang/' + lang + ".js" + v + '"><\/script>');
  }
  document.addEventListener("DOMContentLoaded", () => apply());
})();
