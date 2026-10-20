// Страны доставки и формат адреса для каждой страны.
// Чтобы добавить страну, скопируйте один из блоков ниже и поменяйте подписи и проверки.
(function () {
  const RO_COUNTIES = ["Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani", "Brașov", "Brăila", "București", "Buzău", "Caraș-Severin", "Călărași", "Cluj", "Constanța", "Covasna", "Dâmbovița", "Dolj", "Galați", "Giurgiu", "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov", "Maramureș", "Mehedinți", "Mureș", "Neamț", "Olt", "Prahova", "Satu Mare", "Sălaj", "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea", "Vaslui", "Vâlcea", "Vrancea"];

  // rows: строки формы; в одной строке может быть одно или два поля
  const COUNTRIES = {
    RO: {
      name: "Румыния",
      phone: "+40 712 345 678",
      rows: [
        ["region"],
        ["city", "zip"],
        ["address"],
        ["address2"]
      ],
      fields: {
        region: { label: "Уезд (județ)", options: RO_COUNTIES, required: true },
        city: { label: "Населённый пункт (localitate)", placeholder: "Cluj-Napoca", required: true },
        zip: { label: "Индекс (cod poștal)", placeholder: "400001", pattern: "\\d{6}", hint: "6 цифр", required: true },
        address: { label: "Улица и номер дома (strada, nr.)", placeholder: "Str. Mihai Eminescu, nr. 10", required: true },
        address2: { label: "Блок, подъезд, этаж, квартира", placeholder: "Bl. A2, sc. 1, et. 3, ap. 12" }
      }
    },
    IT: {
      name: "Италия",
      phone: "+39 312 345 6789",
      rows: [
        ["address"],
        ["address2"],
        ["zip", "city"],
        ["region"]
      ],
      fields: {
        address: { label: "Улица и номер дома (via, n. civico)", placeholder: "Via Roma 10", required: true },
        address2: { label: "Подъезд, этаж, квартира (scala, piano, interno)", placeholder: "Scala B, piano 2, int. 5" },
        zip: { label: "Индекс (CAP)", placeholder: "20121", pattern: "\\d{5}", hint: "5 цифр", required: true },
        city: { label: "Город (città)", placeholder: "Milano", required: true },
        region: { label: "Провинция (sigla)", placeholder: "MI", pattern: "[A-Za-z]{2}", hint: "2 буквы, например MI, RM, TO", required: true, upper: true, maxlength: 2 }
      }
    },
    DE: {
      name: "Германия",
      phone: "+49 151 23456789",
      rows: [
        ["address"],
        ["address2"],
        ["zip", "city"]
      ],
      fields: {
        address: { label: "Улица и номер дома (Straße, Hausnummer)", placeholder: "Hauptstraße 5", required: true },
        address2: { label: "Дополнительно (c/o, квартира)", placeholder: "c/o Müller, Wohnung 3" },
        zip: { label: "Индекс (PLZ)", placeholder: "10115", pattern: "\\d{5}", hint: "5 цифр", required: true },
        city: { label: "Город (Ort)", placeholder: "Berlin", required: true }
      }
    },
    FR: {
      name: "Франция",
      phone: "+33 6 12 34 56 78",
      rows: [
        ["address"],
        ["address2"],
        ["zip", "city"]
      ],
      fields: {
        address: { label: "Номер дома и улица (numéro et rue)", placeholder: "12 rue de la Paix", required: true },
        address2: { label: "Здание, подъезд, этаж (bâtiment, étage)", placeholder: "Bât. B, 3e étage" },
        zip: { label: "Индекс (code postal)", placeholder: "75002", pattern: "\\d{5}", hint: "5 цифр", required: true },
        city: { label: "Город (ville)", placeholder: "Paris", required: true }
      }
    }
  };

  // Города для подсказки: [город, уезд/провинция]. Можно вписать и город не из списка.
  const CITIES = {
    RO: [["București","București"],["Cluj-Napoca","Cluj"],["Timișoara","Timiș"],["Iași","Iași"],["Constanța","Constanța"],["Craiova","Dolj"],["Brașov","Brașov"],["Galați","Galați"],["Ploiești","Prahova"],["Oradea","Bihor"],["Brăila","Brăila"],["Arad","Arad"],["Pitești","Argeș"],["Sibiu","Sibiu"],["Bacău","Bacău"],["Târgu Mureș","Mureș"],["Baia Mare","Maramureș"],["Buzău","Buzău"],["Botoșani","Botoșani"],["Satu Mare","Satu Mare"],["Râmnicu Vâlcea","Vâlcea"],["Suceava","Suceava"],["Piatra Neamț","Neamț"],["Drobeta-Turnu Severin","Mehedinți"],["Focșani","Vrancea"],["Târgu Jiu","Gorj"],["Tulcea","Tulcea"],["Târgoviște","Dâmbovița"],["Bistrița","Bistrița-Năsăud"],["Reșița","Caraș-Severin"],["Slatina","Olt"],["Alba Iulia","Alba"],["Călărași","Călărași"],["Giurgiu","Giurgiu"],["Deva","Hunedoara"],["Hunedoara","Hunedoara"],["Petroșani","Hunedoara"],["Zalău","Sălaj"],["Sfântu Gheorghe","Covasna"],["Vaslui","Vaslui"],["Bârlad","Vaslui"],["Roman","Neamț"],["Turda","Cluj"],["Mediaș","Sibiu"],["Slobozia","Ialomița"],["Alexandria","Teleorman"],["Miercurea Ciuc","Harghita"],["Odorheiu Secuiesc","Harghita"],["Mangalia","Constanța"],["Medgidia","Constanța"],["Câmpina","Prahova"],["Onești","Bacău"],["Făgăraș","Brașov"],["Voluntari","Ilfov"],["Otopeni","Ilfov"],["Buftea","Ilfov"],["Popești-Leordeni","Ilfov"],["Pantelimon","Ilfov"],["Bragadiru","Ilfov"],["Chiajna","Ilfov"]],
    IT: [["Roma","RM"],["Milano","MI"],["Napoli","NA"],["Torino","TO"],["Palermo","PA"],["Genova","GE"],["Bologna","BO"],["Firenze","FI"],["Bari","BA"],["Catania","CT"],["Venezia","VE"],["Verona","VR"],["Messina","ME"],["Padova","PD"],["Trieste","TS"],["Brescia","BS"],["Parma","PR"],["Taranto","TA"],["Prato","PO"],["Modena","MO"],["Reggio Calabria","RC"],["Reggio Emilia","RE"],["Perugia","PG"],["Livorno","LI"],["Ravenna","RA"],["Cagliari","CA"],["Foggia","FG"],["Rimini","RN"],["Salerno","SA"],["Ferrara","FE"],["Sassari","SS"],["Latina","LT"],["Monza","MB"],["Siracusa","SR"],["Pescara","PE"],["Bergamo","BG"],["Vicenza","VI"],["Trento","TN"],["Bolzano","BZ"],["Novara","NO"],["Piacenza","PC"],["Ancona","AN"],["Udine","UD"],["Arezzo","AR"],["La Spezia","SP"],["Lecce","LE"],["Pisa","PI"],["Como","CO"],["Varese","VA"],["Treviso","TV"],["Lucca","LU"],["Pesaro","PU"],["Cremona","CR"],["Pavia","PV"],["Alessandria","AL"],["Asti","AT"],["Cuneo","CN"],["Mantova","MN"],["Lecco","LC"],["Sanremo","IM"]],
    DE: ["Berlin","Hamburg","München","Köln","Frankfurt am Main","Stuttgart","Düsseldorf","Leipzig","Dortmund","Essen","Bremen","Dresden","Hannover","Nürnberg","Duisburg","Bochum","Wuppertal","Bielefeld","Bonn","Münster","Mannheim","Karlsruhe","Augsburg","Wiesbaden","Mönchengladbach","Gelsenkirchen","Aachen","Braunschweig","Kiel","Chemnitz","Halle (Saale)","Magdeburg","Freiburg im Breisgau","Krefeld","Mainz","Lübeck","Erfurt","Oberhausen","Rostock","Kassel","Hagen","Potsdam","Saarbrücken","Hamm","Ludwigshafen am Rhein","Oldenburg","Mülheim an der Ruhr","Osnabrück","Leverkusen","Heidelberg","Darmstadt","Regensburg","Würzburg","Ingolstadt","Ulm","Heilbronn","Wolfsburg","Göttingen","Pforzheim","Offenbach am Main"].map((c) => [c]),
    FR: ["Paris","Marseille","Lyon","Toulouse","Nice","Nantes","Montpellier","Strasbourg","Bordeaux","Lille","Rennes","Toulon","Reims","Saint-Étienne","Le Havre","Villeurbanne","Dijon","Grenoble","Angers","Saint-Denis","Nîmes","Aix-en-Provence","Clermont-Ferrand","Le Mans","Brest","Tours","Amiens","Annecy","Limoges","Metz","Perpignan","Besançon","Boulogne-Billancourt","Orléans","Rouen","Argenteuil","Montreuil","Mulhouse","Caen","Nancy","Roubaix","Tourcoing","Nanterre","Vitry-sur-Seine","Avignon","Créteil","Poitiers","Versailles","Pau","Cannes","Antibes","La Rochelle","Calais","Ajaccio","Bastia","Colmar","Valence","Chambéry","Biarritz","Saint-Malo"].map((c) => [c])
  };
  const DEFAULT = "RO";
  const KEYS = ["region", "city", "zip", "address", "address2"];
  const AUTOCOMPLETE = { region: "address-level1", city: "address-level2", zip: "postal-code", address: "address-line1", address2: "address-line2" };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function countryOptions(selected) {
    return Object.entries(COUNTRIES)
      .map(([code, c]) => `<option value="${code}"${code === selected ? " selected" : ""}>${esc(c.name)}</option>`)
      .join("");
  }

  function fieldHtml(key, f, value, prefix) {
    const id = prefix + key;
    const label = `<label for="${id}">${esc(f.label)}${f.required ? " *" : ""}</label>`;
    if (f.options) {
      return `<div class="field">${label}<select id="${id}" name="${key}"${f.required ? " required" : ""} autocomplete="${AUTOCOMPLETE[key]}">
        <option value="">Выберите…</option>
        ${f.options.map((o) => `<option${o === value ? " selected" : ""}>${esc(o)}</option>`).join("")}
      </select></div>`;
    }
    const attrs = [
      `id="${id}"`,
      `name="${key}"`,
      `value="${esc(value)}"`,
      `autocomplete="${AUTOCOMPLETE[key]}"`,
      f.placeholder ? `placeholder="${esc(f.placeholder)}"` : "",
      f.pattern ? `pattern="${f.pattern}" title="${esc(f.hint || "")}"` : "",
      f.pattern && /^\\d/.test(f.pattern) ? `inputmode="numeric"` : "",
      f.maxlength ? `maxlength="${f.maxlength}"` : "",
      f.upper ? `style="text-transform:uppercase"` : "",
      f.required ? "required" : ""
    ]
      .filter(Boolean)
      .join(" ");
    const list = key === "city" ? ` list="${id}-list"` : "";
    const dl = key === "city" ? `<datalist id="${id}-list"></datalist>` : "";
    return `<div class="field">${label}<input ${attrs}${list}>${dl}${f.hint ? `<span class="field-hint">${esc(f.hint)}</span>` : ""}</div>`;
  }

  // Рисует поля адреса выбранной страны в box; уже введённое сохраняется при смене страны
  function render(box, code, values = {}, prefix = "") {
    const c = COUNTRIES[code] || COUNTRIES[DEFAULT];
    box.innerHTML = c.rows
      .map((row) => {
        const html = row.map((k) => fieldHtml(k, c.fields[k], values[k] || "", prefix)).join("");
        return row.length > 1 ? `<div class="field-row">${html}</div>` : html;
      })
      .join("");
    // Подсказки городов; для Румынии — города выбранного уезда; уезд/провинция подставляются по городу
    const all = CITIES[code] || [];
    const city = box.querySelector('[name="city"]');
    const region = box.querySelector('[name="region"]');
    const dl = box.querySelector("datalist");
    const fillList = () => {
      const r = region && region.tagName === "SELECT" ? region.value : "";
      const items = r ? all.filter((c) => c[1] === r) : all;
      dl.innerHTML = (items.length ? items : all)
        .slice()
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map((c) => `<option value="${esc(c[0])}">${c[1] && !r ? esc(c[1]) : ""}</option>`)
        .join("");
    };
    if (city && dl) {
      fillList();
      if (region && region.tagName === "SELECT") region.addEventListener("change", fillList);
      city.addEventListener("change", () => {
        const hit = all.find((c) => c[0].toLowerCase() === city.value.trim().toLowerCase());
        if (hit && region && hit[1] && !(region.tagName === "SELECT" && region.value === hit[1])) {
          region.value = hit[1];
          if (region.tagName === "SELECT") fillList();
        }
      });
    }
    box.querySelectorAll('input[style*="uppercase"]').forEach((el) => el.addEventListener("input", () => (el.value = el.value.toUpperCase())));
  }

  function readValues(box) {
    const v = {};
    KEYS.forEach((k) => {
      const el = box.querySelector(`[name="${k}"]`);
      if (el) v[k] = el.value;
    });
    return v;
  }

  // Подключает выбор страны к блоку адреса
  function bind(select, box, values = {}, prefix = "", onChange) {
    const start = COUNTRIES[values.country] ? values.country : DEFAULT;
    select.innerHTML = countryOptions(start);
    render(box, start, values, prefix);
    select.addEventListener("change", () => {
      const keep = readValues(box);
      keep.region = keep.city = keep.zip = ""; // у каждой страны свои города и индексы
      render(box, select.value, keep, prefix);
      if (onChange) onChange(COUNTRIES[select.value]);
    });
    if (onChange) onChange(COUNTRIES[start]);
  }

  // Адрес одной строкой для истории заказов и списка адресов
  function format(a) {
    if (!a) return "";
    const c = COUNTRIES[a.country];
    const cityLine = [a.zip, a.city].filter(Boolean).join(" ") + (a.region ? ` (${a.region})` : "");
    return [a.address, a.address2, cityLine.trim(), c ? c.name : ""].filter(Boolean).join(", ");
  }

  window.KACH_ADDR = { COUNTRIES, CITIES, DEFAULT, render, bind, readValues, format, names: () => Object.values(COUNTRIES).map((c) => c.name) };
})();
