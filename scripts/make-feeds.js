// Makes product feeds for Google Merchant Center (Google Shopping) from js/products.js
// and the translations in js/lang/*.js. One feed per language:
//   feeds/google-en.xml, google-it.xml, google-de.xml, google-fr.xml, google-ro.xml
// Run after changing products or prices:  node scripts/make-feeds.js
// Then publish the site as usual: Google reads the feeds from https://kachhair.com/feeds/...
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const SITE = "https://kachhair.com";
const LANGS = ["en", "it", "de", "fr", "ro"];

function load(lang) {
  // The Romanian feed uses prices for Romania (+21% VAT), as the page opened with &country=RO shows them
  const ctx = { window: {}, console, URLSearchParams, location: { search: lang === "ro" ? "?country=RO" : "" } };
  const dict = {};
  ctx.window.KACH_I18N = {
    lang,
    dict,
    products: {},
    t: (s) => (dict[s] != null ? dict[s] : s),
    size: (s) => (String(s) === "Набор" ? ctx.window.KACH_I18N.t("Kit") : String(s).replace(/\s*мл$/, " ml"))
  };
  vm.createContext(ctx);
  if (lang !== "en") vm.runInContext(fs.readFileSync(path.join(ROOT, "js/lang", lang + ".js"), "utf8"), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js/products.js"), "utf8"), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js/shipping.js"), "utf8"), ctx);
  return { products: ctx.window.KACH_PRODUCTS, cats: ctx.window.KACH_CATEGORIES, I: ctx.window.KACH_I18N, SHIP: ctx.window.KACH_SHIPPING };
}

const sizeSlug = (s) => (String(s) === "Набор" ? "kit" : String(s).replace(/\D/g, "") + "ml");
const xml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));

function feed(lang) {
  const { products, cats, I, SHIP } = load(lang);
  const items = [];
  for (const p of products) {
    const multi = p.variants.length > 1;
    for (const v of p.variants) {
      if (typeof v.price !== "number") continue;
      const slug = sizeSlug(v.size);
      const ml = slug === "kit" ? 0 : parseInt(slug, 10);
      const link =
        `${SITE}/product.html?id=${p.id}` + (multi ? `&size=${slug}` : "") + (lang !== "en" ? `&lang=${lang}` : "") + (lang === "ro" ? "&country=RO" : "");
      const sizeText = slug === "kit" ? "" : " " + I.size(v.size);
      const title = `KACH ${p.name}${sizeText} – ${p.subtitle}`.slice(0, 150);
      const desc = [p.short].concat(p.description, p.benefits.length ? [p.benefits.join(", ") + "."] : []).join(" ").slice(0, 5000);
      const f = [
        ["g:id", multi ? `${p.id}-${slug}` : p.id],
        ["g:item_group_id", multi ? p.id : ""],
        ["g:title", title],
        ["g:description", desc],
        ["g:link", link],
        ["g:image_link", `${SITE}/images/products/${p.id}.jpg`],
        ["g:availability", p.soldOut ? "out_of_stock" : "in_stock"],
        ["g:price", `${v.price.toFixed(2)} EUR`],
        ["g:brand", "KACH"],
        ["g:condition", "new"],
        ["g:identifier_exists", "no"],
        ["g:product_type", `KACH > ${cats[p.category]}`],
        ["g:unit_pricing_measure", ml ? `${ml}ml` : ""],
        ["g:unit_pricing_base_measure", ml ? "100ml" : ""]
      ];
      const lines = f.filter(([, val]) => val !== "").map(([k, val]) => `      <${k}>${xml(val)}</${k}>`);
      // Cheapest delivery of one item to each country (js/shipping.js)
      for (const c of Object.keys(SHIP.RATES)) {
        const ship = Math.min(SHIP.cost(c, "courier", v.price), SHIP.cost(c, "post", v.price));
        lines.push(`      <g:shipping><g:country>${c}</g:country><g:price>${ship.toFixed(2)} EUR</g:price></g:shipping>`);
      }
      items.push(`    <item>\n${lines.join("\n")}\n    </item>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>KACH Hair Organic Solutions (${lang})</title>
    <link>${SITE}/</link>
    <description>KACH professional hair care: products, prices and availability</description>
${items.join("\n")}
  </channel>
</rss>
`;
}

fs.mkdirSync(path.join(ROOT, "feeds"), { recursive: true });
for (const lang of LANGS) {
  const out = path.join(ROOT, "feeds", `google-${lang}.xml`);
  const text = feed(lang);
  fs.writeFileSync(out, text);
  console.log(out, (text.match(/<item>/g) || []).length, "items");
}
