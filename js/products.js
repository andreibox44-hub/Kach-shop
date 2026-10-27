// KACH Hair Organic Solutions catalog (English, the main site language).
// Translations of names and descriptions are in js/lang/*.js under "products".
// Sizes stay as "250 мл" / "Набор": the payment table product_prices uses exactly these values.
// On the site they are shown as "250 ml" / "Kit". To change a price, change it here and in product_prices.
window.KACH_PRODUCTS = [
  {
    id: "bhx-kit",
    name: "BHX Botohair Effect Kit",
    subtitle: "Professional hair care kit",
    category: "pro",
    tag: "Kit",
    variants: [{ size: "Набор", price: 349, gtin: "7508304272398" }],
    ph: "",
    hair: "All hair types",
    formula: "Free from parabens, sulphates and formaldehyde",
    short: "Hydration, reconstruction and repair in one kit.",
    description: [
      "Intensive professional care for healthier, stronger and shinier hair. The kit is inspired by the hair botox effect and made with natural ingredients and advanced biotechnology.",
      "It repairs hair from within and restores moisture, strength, volume and extraordinary shine. Visible results from the very first use.",
      "The kit contains: 15 BHX ampoules (intensive moisturising treatment with a botox effect), Shampoo DC (deep cleansing that prepares hair for the treatment), Aminoplasma AP (intensive reconstruction) and Serum SSN (shine, silkiness, nourishment)."
    ],
    actives: ["Keratin", "Hyaluronic acid", "Argan oil", "Amino acids", "Ceramides"],
    benefits: ["Deep hydration", "Reconstruction", "Volume and shine", "Professional results"]
  },
  {
    id: "shampoo-rh",
    name: "Shampoo RH",
    subtitle: "Rapid hydration shampoo",
    category: "shampoo",
    tag: "",
    variants: [{ size: "250 мл", price: 23, gtin: "7508304272930" }, { size: "450 мл", price: 32 }],
    ph: "5.5",
    hair: "Normal and coarse hair, and hair damaged by chemical treatments",
    formula: "30% repair · 70% hydration",
    short: "Gently cleanses and deeply moisturises dry and coloured hair.",
    description: [
      "A blend of plant-based active ingredients cleanses gently and effectively without damaging the hair fibre. Ideal for dry hair and hair after chemical treatments.",
      "The moisturising and repairing formula reduces frizz: hair becomes softer, silkier and more lively.",
      "Fruit extracts, green tea, ginseng, blueberry and wheat germ, together with hyaluronic acid, collagen and keratin, give hair body, prevent split ends and keep moisture at an optimal level while preserving the hair's natural structure and colour."
    ],
    actives: ["Green tea", "Ginseng", "Blueberry", "Wheat germ", "Hyaluronic acid", "Collagen", "Keratin"],
    benefits: ["Deep hydration", "Less frizz", "Protection against split ends", "Softness and shine"]
  },
  {
    id: "shampoo-rr",
    name: "Shampoo RR",
    subtitle: "Rapid repair shampoo",
    category: "shampoo",
    tag: "",
    variants: [{ size: "250 мл", price: 23, gtin: "7508304272961" }, { size: "450 мл", price: 32, gtin: "7508304272954" }],
    ph: "5.5",
    hair: "Normal and fine hair, and hair damaged by chemical treatments",
    formula: "30% repair · 70% hydration",
    short: "Repairing shampoo for dry and chemically treated hair.",
    description: [
      "A repairing shampoo with top-quality ingredients, nourishing oils and precious extracts. Ideal for dry hair and hair after chemical treatments.",
      "Free from parabens and sulphates: it cleanses gently and non-aggressively and respects the hair fibre.",
      "It reduces frizz and makes hair stronger, fuller and silkier. Prevents split ends and strengthens hair while preserving its natural structure."
    ],
    actives: ["Nourishing oils", "Plant extracts"],
    benefits: ["Deep repair", "Less frizz", "Protection against split ends", "Strength and volume"]
  },
  {
    id: "only1one",
    name: "Only 1 One Shampoo",
    subtitle: "Anti-frizz smoothing shampoo",
    category: "shampoo",
    tag: "Bestseller",
    variants: [{ size: "80 мл", price: 29, gtin: "7508304272817" }, { size: "400 мл", price: 149, gtin: "7508304272800" }],
    ph: "0.5–1.5",
    hair: "Wavy, frizzy and curly hair",
    formula: "Free from SLS, SLES, parabens, silicones, GMOs and formaldehyde",
    short: "Smooths and tames hair, eliminates frizz.",
    description: [
      "A smoothing shampoo with a unique combination of organic acids and natural proteins. It acts on the bonds of the keratin chains inside the hair (in the cortex).",
      "The innovative heat-activated formula makes hair smooth, shiny and frizz-free.",
      "Tamarind, apple, sugar cane and milk extracts, together with hyaluronic acid and very low molecular weight ceramides, repair hair and make it silky."
    ],
    actives: ["Tamarind", "Apple", "Sugar cane", "Milk", "Hyaluronic acid", "Ceramides"],
    benefits: ["Smooths", "Eliminates frizz", "Extra shine", "Moisturises", "Strengthens"]
  },
  {
    id: "only1one-violet",
    name: "Only 1 One Violet Shampoo",
    subtitle: "Smoothing shampoo for blonde hair",
    category: "shampoo",
    tag: "For blondes",
    variants: [{ size: "80 мл", price: 29 }, { size: "400 мл", price: 111, gtin: "7508304272824" }],
    ph: "0.5–1.5",
    hair: "Blonde wavy, frizzy and curly hair",
    formula: "Free from SLS, SLES, parabens, silicones, GMOs and formaldehyde",
    short: "Smoothing and frizz protection for blondes.",
    description: [
      "A smoothing shampoo for blonde hair with a unique combination of organic acids and natural proteins. It acts on the bonds of the keratin chains inside the hair.",
      "The heat-activated formula makes hair smooth, shiny and frizz-free.",
      "Tamarind, apple, sugar cane and milk extracts, together with hyaluronic acid and ceramides, repair hair and give it a luxurious silkiness."
    ],
    actives: ["Tamarind", "Apple", "Sugar cane", "Milk", "Hyaluronic acid", "Ceramides"],
    benefits: ["Smooths", "Eliminates frizz", "Extra shine", "Moisturises", "Strengthens"]
  },
  {
    id: "shampoo-ac",
    name: "Shampoo AC",
    subtitle: "Acidic deep-cleansing shampoo",
    category: "shampoo",
    tag: "",
    variants: [{ size: "80 мл", price: 10 }, { size: "450 мл", price: 39 }],
    ph: "3.5–4.5",
    hair: "Hair after chemical treatments",
    formula: "Natural formula · free from SLES and parabens",
    short: "Deeply cleanses and prepares hair for treatments.",
    description: [
      "An exclusive formula with high-quality natural ingredients: fruit extracts, green tea, blueberry and wheat germ, plus hyaluronic acid and ceramides for optimal hydration.",
      "This gentle shampoo deeply cleanses all hair types, gently opens the cuticle and removes impurities and product residue.",
      "Ideal for preparing hair for the next treatments: the active ingredients are absorbed better."
    ],
    actives: ["Green tea", "Blueberry", "Wheat germ", "Hyaluronic acid", "Ceramides"],
    benefits: ["Deep cleansing", "Removes impurities", "Hydration", "Opens the cuticle", "Prepares for treatments"]
  },
  {
    id: "shampoo-dc",
    name: "Shampoo DC",
    subtitle: "Alkaline deep-cleansing shampoo",
    category: "shampoo",
    tag: "",
    variants: [{ size: "450 мл", price: 39, gtin: "7508304272862" }, { size: "1000 мл", price: 69, gtin: "7508304272855" }],
    ph: "8.5–9.0",
    hair: "All hair types",
    formula: "Natural formula",
    short: "Deep cleansing before keratin and other treatments.",
    description: [
      "An exclusive formula with high-quality natural ingredients: fruit extracts, green tea, blueberry and wheat germ, plus hyaluronic acid and ceramides for optimal hydration.",
      "This gentle shampoo deeply cleanses all hair types, gently opens the cuticle and removes impurities and product residue.",
      "Ideal for preparing hair for the next treatments: the active ingredients are absorbed better."
    ],
    actives: ["Green tea", "Blueberry", "Wheat germ", "Hyaluronic acid", "Ceramides"],
    benefits: ["Deep cleansing", "Removes impurities", "Hydration", "Opens the cuticle", "Prepares for treatments"]
  },
  {
    id: "conditioner-rh",
    name: "Conditioner RH",
    subtitle: "Rapid hydration conditioner",
    category: "conditioner",
    tag: "",
    variants: [{ size: "250 мл", price: 23, gtin: "7508304272992" }, { size: "450 мл", price: 32 }],
    ph: "4.5",
    hair: "Normal and coarse hair, and hair damaged by chemical treatments",
    formula: "30% repair · 70% hydration",
    short: "Moisturises, repairs and protects colour.",
    description: [
      "A balanced formula with high and low molecular weight components that conditions hair perfectly: it moisturises, repairs, reconstructs and protects colour.",
      "It gives hair strength, shine and silkiness, controls frizz and volume and makes hair fuller."
    ],
    actives: ["High and low molecular weight components"],
    benefits: ["Deep hydration", "Repair", "Colour protection", "Frizz control"]
  },
  {
    id: "conditioner-rr",
    name: "Conditioner RR",
    subtitle: "Rapid repair conditioner",
    category: "conditioner",
    tag: "",
    variants: [{ size: "250 мл", price: 23, gtin: "7508304273029" }, { size: "450 мл", price: 32, gtin: "7508304273012" }],
    ph: "4.5",
    hair: "Normal and fine hair, and hair damaged by chemical treatments",
    formula: "30% repair · 70% hydration",
    short: "Intensive repair and colour protection.",
    description: [
      "A balanced formula with high and low molecular weight components that conditions hair perfectly and provides intensive deep repair, reconstruction, hydration and colour protection.",
      "It gives hair strength, shine, silkiness and volume."
    ],
    actives: ["High and low molecular weight components"],
    benefits: ["Deep hydration", "Intensive repair", "Colour protection", "Strength and volume"]
  },
  {
    id: "aminoplasma-ap",
    name: "Aminoplasma AP",
    subtitle: "Intensive hair reconstruction",
    category: "care",
    tag: "",
    variants: [{ size: "200 мл", price: 69, gtin: "7508304273043" }],
    ph: "4.0–5.0",
    hair: "All hair types",
    formula: "Pure concentrate of amino acids and keratin",
    short: "Amino acid and keratin concentrate for damaged hair.",
    description: [
      "A pure concentrate of amino acids and keratin. It penetrates deep into the hair fibre to repair, reconstruct and strengthen damaged hair.",
      "Amino acids repair the fibre from within, while keratin of different molecular weights strengthens and protects the hair structure."
    ],
    actives: ["Amino acids", "Keratin"],
    benefits: ["Deep reconstruction", "Repairs the cuticle", "Seals the ends", "Strengthens", "Shine and elasticity"]
  },
  {
    id: "siero-ssn",
    name: "Siero SSN",
    subtitle: "Serum: shine, silkiness, nourishment",
    category: "care",
    tag: "",
    variants: [{ size: "100 мл", price: 49, gtin: "7508304273067" }, { size: "250 мл", price: 99, gtin: "7508304273050" }],
    ph: "",
    hair: "Normal, coarse and thick hair",
    formula: "Free from parabens and sulphates",
    short: "Serum with argan oil and Omega-3 for radiant hair.",
    description: [
      "A precious serum based on argan oil and Omega-3. It deeply nourishes, intensely moisturises and gives hair an extraordinary radiance.",
      "Ideal for normal and coarse hair. Argan oil, jojoba oil, narcissus flower extract and ceramides seal and repair hair without weighing it down.",
      "Hair becomes silky, very shiny and manageable, and the style holds perfectly."
    ],
    actives: ["Argan oil", "Omega-3", "Jojoba oil", "Narcissus extract", "Ceramides"],
    benefits: ["Radiance", "Silkiness", "Deep nourishment", "Free from parabens and sulphates"]
  },
  {
    id: "crema-csn",
    name: "Crema CSN",
    subtitle: "Volume cream: shine and nourishment",
    category: "care",
    tag: "",
    soldOut: true, // out of stock: remove this line when the product is back
    variants: [{ size: "100 мл", price: 30 }],
    ph: "",
    hair: "Normal and fine hair",
    formula: "Free from parabens and sulphates",
    short: "Styling cream for volume without weighing hair down.",
    description: [
      "A styling and volume cream with natural ingredients: argan oil, jojoba oil, hyaluronic acid, collagen, keratin and Omega 3 and 6. It gives hair body, deep hydration and shine.",
      "Ideal for normal and fine hair: it gives volume and a defined shape without making hair greasy or heavy.",
      "Free from parabens and sulphates. Hair becomes silky, shiny and easy to style."
    ],
    actives: ["Argan oil", "Jojoba oil", "Hyaluronic acid", "Collagen", "Keratin", "Omega 3 and 6"],
    benefits: ["Radiance", "Volume and shape", "Deep hydration", "Free from parabens and sulphates"]
  },
  {
    id: "bhx-botohair",
    name: "BHX Botohair Effect",
    subtitle: "Intensive hair hydration, ampoules",
    category: "pro",
    tag: "",
    variants: [{ size: "20 мл", price: 25 }],
    ph: "5.0–5.5",
    hair: "All hair types",
    formula: "Hyaluronic acid, ceramides and oils",
    short: "Deep hydration concentrate with an effect lasting up to three weeks.",
    description: [
      "A highly concentrated formula with hyaluronic acid, ceramides and a blend of precious argan, jojoba and avocado oils.",
      "A deep hydration treatment with a visible effect lasting up to three weeks. It helps control frizz, seals the cuticle and split ends, and gives softness and radiance.",
      "Suitable as an after-colour treatment or as a sealing product after treatments such as botoplex. It can be added to colours, bleaches and straightening products to protect and nourish hair."
    ],
    actives: ["Hyaluronic acid", "Ceramides", "Argan oil", "Jojoba oil", "Avocado oil"],
    benefits: ["Deep hydration", "Frizz control", "Seals the ends", "Softness and radiance"]
  }
];

window.KACH_CATEGORIES = {
  all: "All",
  shampoo: "Shampoos",
  conditioner: "Conditioners",
  care: "Care and styling",
  pro: "BHX treatments"
};

// Prices above are for Italy, Germany and France. For Romania 21% VAT is added on top
// (the same rule is in supabase/functions/payments/index.ts, RO_VAT).
// Delivery country: ?country=RO, else the one chosen at checkout; until then prices are shown without VAT.
(function () {
  const ok = ["RO", "IT", "DE", "FR"];
  let c = "";
  try {
    c = (new URLSearchParams(location.search).get("country") || "").toUpperCase();
    if (ok.includes(c)) localStorage.setItem("kach-country", c);
    else c = localStorage.getItem("kach-country") || "";
  } catch (e) {}
  window.KACH_PRICE_COUNTRY = ok.includes(c) ? c : "";
  if (c === "RO")
    window.KACH_PRODUCTS.forEach((p) =>
      p.variants.forEach((v) => {
        if (typeof v.price === "number") v.price = Math.round(v.price * 121) / 100; // + 21% VAT
      })
    );
})();

// Texts in the chosen language. baseName keeps the English name for orders and payments.
(function () {
  const I = window.KACH_I18N;
  window.KACH_PRODUCTS.forEach((p) => {
    p.baseName = p.name;
    const tr = I && I.products && I.products[p.id];
    if (tr) Object.assign(p, tr);
  });
  if (I) Object.keys(window.KACH_CATEGORIES).forEach((k) => (window.KACH_CATEGORIES[k] = I.t(window.KACH_CATEGORIES[k])));
})();
