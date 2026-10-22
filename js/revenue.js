// Страница «Выручка по неделям». Видна только владельцу:
// сервер отдаёт заказы лишь почтам из app_settings → admin_emails.
(function () {
  const WEEKS = 12; // сколько недель показываем в таблице
  const SET_KEY = "kach-revenue-settings";
  const DEFAULTS = { feePct: 1.5, feeFix: 0.25, vat: 21 };
  const auth = () => window.KACH_AUTH;
  const ui = () => window.KACH_UI;
  const esc = (s) => ui().esc(s == null ? "" : s);
  const money = (n) => ui().money(Math.round(n * 100) / 100);

  let root;
  let orders = null; // оплаченные заказы за последние WEEKS недель
  let weekIdx = 0; // 0 = текущая неделя, 1 = прошлая…
  let loadedFor = null;

  function settings() {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SET_KEY) || "{}") };
    } catch (e) {
      return { ...DEFAULTS };
    }
  }
  function saveSettings(s) {
    try {
      localStorage.setItem(SET_KEY, JSON.stringify(s));
    } catch (e) {}
  }

  // Понедельник 00:00 текущей недели (время этого компьютера)
  function monday(back) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - 7 * back);
    return d;
  }
  const addDays = (d, n) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };
  const fmtDay = (d) => d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  const weekLabel = (i) => {
    const m = monday(i);
    return fmtDay(m) + " – " + fmtDay(addDays(m, 6));
  };

  function weekStats(i) {
    const from = monday(i);
    const to = addDays(from, 7);
    const list = orders.filter((o) => {
      const t = new Date(o.paid_at);
      return t >= from && t < to;
    });
    const s = settings();
    const sum = list.reduce((a, o) => a + Number(o.paid_amount || 0), 0);
    const fee = list.reduce((a, o) => a + (Number(o.paid_amount || 0) * s.feePct) / 100 + s.feeFix, 0);
    const vat = (sum * s.vat) / (100 + s.vat);
    return { list, sum, fee, net: sum - fee, vat, noVat: sum - vat, count: list.length };
  }

  function renderLogin(text) {
    root.innerHTML = `<div class="rev-box" style="max-width:520px;margin:0 auto;text-align:center">
      <h2>Выручка по неделям</h2>
      <p class="muted">${text}</p>
      <a class="btn" href="account.html">Войти в кабинет</a>
      <p class="rev-note">После входа откройте эту страницу снова.</p></div>`;
  }

  async function load() {
    const from = monday(WEEKS - 1);
    const to = addDays(monday(0), 7);
    const { data, error } = await auth().client.rpc("admin_paid_orders", {
      p_from: from.toISOString(),
      p_to: to.toISOString()
    });
    if (error) throw error;
    orders = data || [];
  }

  function render() {
    const w = weekStats(weekIdx);
    const s = settings();
    const all = [];
    for (let i = 0; i < WEEKS; i++) all.push({ i, ...weekStats(i) });
    const max = Math.max(1, ...all.map((x) => x.sum));
    const total = all.reduce((a, x) => a + x.sum, 0);

    // Что продали за неделю
    const goods = {};
    w.list.forEach((o) =>
      (o.items || []).forEach((it) => {
        const key = it.name + (it.size ? " · " + it.size : "");
        goods[key] = goods[key] || { qty: 0, sum: 0 };
        goods[key].qty += Number(it.qty || 0);
        goods[key].sum += Number(it.qty || 0) * Number(it.price || 0);
      })
    );
    const goodsRows = Object.entries(goods).sort((a, b) => b[1].sum - a[1].sum);

    root.innerHTML = `
      <div class="rev-head">
        <h1>Выручка по неделям</h1>
        <div class="rev-week">
          <button class="rev-arrow" id="prev" aria-label="Прошлая неделя" ${weekIdx >= WEEKS - 1 ? "disabled" : ""}>‹</button>
          <strong>${weekLabel(weekIdx)}${weekIdx === 0 ? "<br><small class='muted'>эта неделя</small>" : ""}</strong>
          <button class="rev-arrow" id="next" aria-label="Следующая неделя" ${weekIdx === 0 ? "disabled" : ""}>›</button>
        </div>
      </div>

      <div class="rev-tiles">
        <div class="rev-tile main"><span>Оплачено покупателями</span><b>${money(w.sum)}</b></div>
        <div class="rev-tile"><span>Заказов</span><b>${w.count}</b></div>
        <div class="rev-tile"><span>Средний чек</span><b>${w.count ? money(w.sum / w.count) : "—"}</b></div>
        <div class="rev-tile"><span>Комиссия Stripe ≈</span><b>${money(w.fee)}</b></div>
        <div class="rev-tile"><span>Придёт на счёт ≈</span><b>${money(w.net)}</b></div>
        <div class="rev-tile"><span>НДС внутри цены (${s.vat}%)</span><b>${money(w.vat)}</b></div>
      </div>

      <div class="rev-box">
        <h2>Последние ${WEEKS} недель</h2>
        <table class="rev-table">
          <thead><tr><th>Неделя</th><th class="num">Заказов</th><th class="num">Выручка</th><th></th><th class="num">Комиссия ≈</th><th class="num">На счёт ≈</th></tr></thead>
          <tbody>${all
            .map(
              (x) => `<tr data-w="${x.i}" class="${x.i === weekIdx ? "sel" : ""}">
                <td>${weekLabel(x.i)}</td><td class="num">${x.count}</td><td class="num">${money(x.sum)}</td>
                <td><span class="rev-bar" style="width:${Math.round((x.sum / max) * 120)}px"></span></td>
                <td class="num">${money(x.fee)}</td><td class="num">${money(x.net)}</td></tr>`
            )
            .join("")}</tbody>
          <tfoot><tr><th>Итого</th><th class="num">${all.reduce((a, x) => a + x.count, 0)}</th><th class="num">${money(total)}</th><th></th>
            <th class="num">${money(all.reduce((a, x) => a + x.fee, 0))}</th><th class="num">${money(all.reduce((a, x) => a + x.net, 0))}</th></tr></tfoot>
        </table>
      </div>

      <div class="rev-box">
        <h2>Что продали за неделю</h2>
        ${
          goodsRows.length
            ? `<table class="rev-table"><thead><tr><th>Товар</th><th class="num">Штук</th><th class="num">Сумма</th></tr></thead><tbody>
               ${goodsRows.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="num">${v.qty}</td><td class="num">${money(v.sum)}</td></tr>`).join("")}
               </tbody></table>`
            : `<p class="muted">На этой неделе оплаченных заказов нет.</p>`
        }
      </div>

      ${
        w.list.length
          ? `<div class="rev-box"><h2>Заказы недели</h2><table class="rev-table">
              <thead><tr><th>Номер</th><th>Оплачен</th><th class="num">Сумма</th></tr></thead><tbody>
              ${w.list
                .map(
                  (o) => `<tr><td>${esc(o.number)}</td><td>${new Date(o.paid_at).toLocaleString("ru-RU", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td><td class="num">${money(o.paid_amount)}</td></tr>`
                )
                .join("")}</tbody></table></div>`
          : ""
      }

      <div class="rev-box">
        <h2>Настройки расчёта</h2>
        <form class="rev-settings" id="set">
          <div class="field"><label for="s-pct">Комиссия Stripe, %</label><input id="s-pct" type="number" step="0.01" min="0" value="${s.feePct}"></div>
          <div class="field"><label for="s-fix">+ за заказ, €</label><input id="s-fix" type="number" step="0.01" min="0" value="${s.feeFix}"></div>
          <div class="field"><label for="s-vat">НДС, %</label><input id="s-vat" type="number" step="0.1" min="0" value="${s.vat}"></div>
          <button class="btn btn-small btn-outline" type="button" id="reset">Как было</button>
        </form>
        <p class="rev-note">Считаются только оплаченные заказы. Неделя — с понедельника по воскресенье.
        Комиссия — примерная: 1,5% + 0,25 € — это тариф Stripe для обычных карт из Европы; для карт из других стран комиссия выше.
        Точные цифры — в Stripe → Balances → Payouts.</p>
      </div>`;

    root.querySelector("#prev").onclick = () => ((weekIdx = Math.min(WEEKS - 1, weekIdx + 1)), render());
    root.querySelector("#next").onclick = () => ((weekIdx = Math.max(0, weekIdx - 1)), render());
    root.querySelectorAll("tr[data-w]").forEach((tr) => (tr.onclick = () => ((weekIdx = Number(tr.dataset.w)), render())));
    const num = (id, d) => {
      const v = parseFloat(root.querySelector(id).value);
      return isFinite(v) && v >= 0 ? v : d;
    };
    root.querySelectorAll("#set input").forEach(
      (inp) =>
        (inp.onchange = () => {
          saveSettings({ feePct: num("#s-pct", DEFAULTS.feePct), feeFix: num("#s-fix", DEFAULTS.feeFix), vat: num("#s-vat", DEFAULTS.vat) });
          render();
        })
    );
    root.querySelector("#reset").onclick = () => {
      saveSettings(DEFAULTS);
      render();
    };
  }

  async function show(user) {
    if (!auth() || !auth().enabled) return renderLogin("Сервер недоступен.");
    if (!user) {
      loadedFor = null;
      return renderLogin("Эта страница только для владельца магазина. Войдите в свой кабинет.");
    }
    if (loadedFor === user.id && orders) return;
    loadedFor = user.id;
    root.innerHTML = `<p class="muted center">Загружаем…</p>`;
    try {
      await load();
      render();
    } catch (e) {
      console.error(e);
      orders = null;
      const denied = /not admin|42501|permission/i.test(String((e && (e.message || e.code)) || e));
      root.innerHTML = `<div class="rev-box" style="max-width:520px;margin:0 auto;text-align:center"><h2>Нет доступа</h2>
        <p class="muted">${denied ? "Эта страница доступна только владельцу магазина." : "Не удалось загрузить данные. Обновите страницу."}</p></div>`;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    root = document.getElementById("rev");
    if (!auth()) return renderLogin("Сервер недоступен.");
    auth().ready.then(() => auth().onChange((u) => show(u)));
  });
})();
