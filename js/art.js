// Иллюстрации товаров: стеклянный флакон или брусок в крафте + растение рядом.
// Рисуются кодом, поэтому сайту не нужны файлы картинок.
(function () {
  let uid = 0;

  // Один лист: эллипс с прожилкой, повёрнутый на угол a.
  const leaf = (x, y, a, len, w, color) =>
    `<g transform="translate(${x} ${y}) rotate(${a})">
       <path d="M0 0 Q${len / 2} ${-w} ${len} 0 Q${len / 2} ${w} 0 0Z" fill="${color}"/>
       <path d="M2 0 H${len - 3}" stroke="rgba(255,255,255,.35)" stroke-width="1"/>
     </g>`;

  // Веточка из пар листьев вдоль стебля.
  function sprig(x, y, h, color, opts = {}) {
    const { len = 18, w = 7, pairs = 5, lean = 8 } = opts;
    let out = `<path d="M${x} ${y} Q${x + lean} ${y - h / 2} ${x + lean / 2} ${y - h}" stroke="${color}" stroke-width="2" fill="none"/>`;
    for (let i = 1; i <= pairs; i++) {
      const t = i / (pairs + 1);
      const px = x + lean * t * (1.2 - t);
      const py = y - h * t;
      const l = len * (1 - t * 0.45);
      out += leaf(px, py, -150 + t * 30, l, w * (1 - t * 0.3), color);
      out += leaf(px, py, -30 - t * 30, l, w * (1 - t * 0.3), color);
    }
    out += leaf(x + lean / 2, y - h, -90, len * 0.6, w * 0.6, color);
    return out;
  }

  const herbs = {
    lavender(c) {
      let s = "";
      [[150, 188, 120, 6], [165, 190, 100, 14], [138, 190, 92, -6]].forEach(([x, y, h, lean]) => {
        s += `<path d="M${x} ${y} Q${x + lean / 2} ${y - h / 2} ${x + lean} ${y - h}" stroke="#7c8b5b" stroke-width="2" fill="none"/>`;
        for (let i = 0; i < 9; i++) {
          const t = i / 9;
          const cx = x + lean * (0.55 + t * 0.45);
          const cy = y - h * (0.55 + t * 0.45);
          s += `<ellipse cx="${cx - 3}" cy="${cy}" rx="3.2" ry="4.6" fill="${c}" opacity=".9"/>
                <ellipse cx="${cx + 3}" cy="${cy - 2}" rx="3.2" ry="4.6" fill="${c}"/>`;
        }
      });
      return s;
    },
    nettle(c) {
      return sprig(150, 190, 120, c, { len: 24, w: 10, pairs: 4, lean: 14 }) + sprig(40, 190, 80, "#6f8f52", { len: 16, w: 7, pairs: 3, lean: -8 });
    },
    mint(c) {
      return sprig(152, 190, 115, c, { len: 22, w: 13, pairs: 4, lean: 10 }) + sprig(42, 190, 70, c, { len: 16, w: 10, pairs: 2, lean: -6 });
    },
    argan(c) {
      return (
        sprig(150, 190, 110, "#6b7d45", { len: 22, w: 6, pairs: 4, lean: 12 }) +
        `<ellipse cx="166" cy="182" rx="11" ry="8" fill="${c}"/><ellipse cx="163" cy="179" rx="4" ry="2.5" fill="rgba(255,255,255,.3)"/>
         <ellipse cx="148" cy="186" rx="9" ry="6.5" fill="#8a5a24"/>`
      );
    },
    chamomile(c) {
      const flower = (x, y, r) => {
        let p = "";
        for (let i = 0; i < 12; i++) p += `<ellipse cx="${x}" cy="${y - r}" rx="${r * 0.32}" ry="${r * 0.7}" fill="#fffdf6" stroke="#e6dcc4" stroke-width=".6" transform="rotate(${i * 30} ${x} ${y})"/>`;
        return p + `<circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="${c}"/>`;
      };
      return (
        `<path d="M156 190 Q160 150 162 112 M146 190 Q140 160 136 138 M170 190 Q176 170 180 152" stroke="#7c8b5b" stroke-width="2" fill="none"/>` +
        leaf(158, 160, -30, 16, 4, "#7c8b5b") + leaf(140, 170, -150, 14, 4, "#7c8b5b") +
        flower(162, 108, 14) + flower(136, 134, 11) + flower(180, 148, 9)
      );
    },
    pine(c) {
      let s = `<path d="M30 70 Q100 40 175 62" stroke="#6b4f33" stroke-width="3" fill="none"/>`;
      for (let i = 0; i < 26; i++) {
        const t = i / 25;
        const x = 30 + 145 * t;
        const y = 70 - 30 * Math.sin(t * Math.PI) * 0.9 + t * -8;
        s += `<path d="M${x} ${y} l-8 -18 M${x} ${y} l8 -18 M${x} ${y} l-10 14 M${x} ${y} l10 14" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`;
      }
      return s + `<ellipse cx="160" cy="80" rx="9" ry="13" fill="#8a6239"/><path d="M152 74 h16 M151 80 h18 M152 86 h16" stroke="#6b4f33" stroke-width="1.2"/>`;
    }
  };

  function bottle(p, id) {
    return `
      <defs>
        <linearGradient id="g${id}" x1="0" x2="1">
          <stop offset="0" stop-color="#6e3a10"/><stop offset=".35" stop-color="#a35d1d"/>
          <stop offset=".7" stop-color="#8a4a15"/><stop offset="1" stop-color="#5e300c"/>
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="190" rx="42" ry="6" fill="rgba(60,40,20,.12)"/>
      <rect x="92" y="10" width="34" height="7" rx="3" fill="#2e2a24"/>
      <rect x="95" y="15" width="8" height="12" fill="#2e2a24"/>
      <rect x="88" y="26" width="24" height="18" rx="3" fill="#c49a6c"/>
      <path d="M88 32 h24 M88 38 h24" stroke="#a87d50" stroke-width="1"/>
      <path d="M84 44 H116 V52 Q132 56 132 72 V180 Q132 188 124 188 H76 Q68 188 68 180 V72 Q68 56 84 52 Z" fill="url(#g${id})"/>
      <path d="M75 72 Q75 62 84 58 V182 H78 Q75 182 75 178 Z" fill="rgba(255,255,255,.22)"/>
      <rect x="72" y="92" width="56" height="70" rx="3" fill="#e8d6b4"/>
      <rect x="72" y="92" width="56" height="70" rx="3" fill="none" stroke="#d2bc95"/>
      <text x="100" y="110" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="#3b3326" letter-spacing="1">kach</text>
      <path d="M100 118 v20" stroke="${p.tint}" stroke-width="1.4"/>
      ${leaf(100, 132, -140, 11, 4, p.tint)}${leaf(100, 126, -40, 11, 4, p.tint)}${leaf(100, 120, -90, 8, 3, p.tint)}
      <text x="100" y="152" text-anchor="middle" font-family="Arial,sans-serif" font-size="5.5" fill="#6b5d45" letter-spacing=".6">${p.natural}% NATURAL</text>`;
  }

  function bar(p) {
    return `
      <ellipse cx="100" cy="170" rx="70" ry="9" fill="rgba(60,40,20,.12)"/>
      <rect x="32" y="104" width="136" height="62" rx="30" fill="#d9c09a"/>
      <rect x="32" y="104" width="136" height="20" rx="10" fill="rgba(255,255,255,.25)"/>
      <rect x="84" y="102" width="32" height="66" fill="#c9ab7f"/>
      <path d="M84 102 v66 M116 102 v66" stroke="#b39066" stroke-width="1"/>
      <path d="M40 134 h120" stroke="#8a6a44" stroke-width="1.6" stroke-dasharray="3 2"/>
      <text x="100" y="145" text-anchor="middle" font-family="Georgia,serif" font-size="12" fill="#3b3326">kach</text>
      ${leaf(100, 126, -140, 9, 3.5, p.tint)}${leaf(100, 126, -40, 9, 3.5, p.tint)}`;
  }

  window.KACH_ART = {
    product(p) {
      const id = ++uid;
      const herb = herbs[p.herb] ? herbs[p.herb](p.tint) : "";
      const behind = p.herb === "pine" ? herb : "";
      const front = p.herb === "pine" ? "" : herb;
      return `<svg viewBox="0 0 200 200" class="bottle" role="img" aria-label="${p.name}">
        ${behind}${p.form === "bar" ? bar(p) : bottle(p, id)}${front}
      </svg>`;
    },
    sprig,
    herb(name, color) {
      return herbs[name] ? herbs[name](color) : "";
    }
  };
})();
