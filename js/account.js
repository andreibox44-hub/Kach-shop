// Страница личного кабинета
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const ui = () => window.KACH_UI;
  const auth = () => window.KACH_AUTH;
  const esc = (s) => ui().esc(s == null ? "" : s);
  const GOOGLE =
    '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.5z"/></svg>';
  const STATUS = { new: "Новый", confirmed: "Подтверждён", paid: "Оплачен", shipped: "Отправлен", done: "Выполнен", cancelled: "Отменён" };

  let root;
  let mode = "login"; // login | register | reset

  function msg(el, text, ok) {
    el.textContent = text || "";
    el.className = "form-msg" + (ok ? " ok" : text ? " err" : "");
  }

  async function run(btn, msgEl, fn) {
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Подождите…";
    msg(msgEl, "");
    try {
      await fn();
    } catch (e) {
      console.error(e);
      msg(msgEl, auth().errorText(e));
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  // ---------- Вход и регистрация ----------
  function renderAuth() {
    const titles = { login: "Вход", register: "Регистрация", reset: "Восстановление пароля" };
    root.innerHTML = `
      <div class="auth-wrap">
        <div class="auth-card">
          <div class="auth-tabs" role="tablist">
            <button role="tab" data-mode="login" aria-selected="${mode === "login"}" class="${mode === "login" ? "active" : ""}">Вход</button>
            <button role="tab" data-mode="register" aria-selected="${mode === "register"}" class="${mode === "register" ? "active" : ""}">Регистрация</button>
          </div>
          <h1 class="auth-title">${titles[mode]}</h1>
          ${
            mode !== "reset"
              ? `<button class="btn-google" id="google">${GOOGLE}<span>${mode === "login" ? "Войти" : "Зарегистрироваться"} через Google</span></button>
                 <div class="or"><span>или по почте</span></div>`
              : `<p class="muted">Введите почту, и мы пришлём ссылку для смены пароля.</p>`
          }
          <form id="auth-form" class="auth-form" novalidate>
            ${mode === "register" ? `<div class="field"><label for="a-name">Имя</label><input id="a-name" name="name" required autocomplete="name"></div>` : ""}
            <div class="field"><label for="a-email">Почта</label><input id="a-email" name="email" type="email" required autocomplete="email"></div>
            ${
              mode !== "reset"
                ? `<div class="field"><label for="a-pass">Пароль</label>
                     <div class="pass-wrap"><input id="a-pass" name="password" type="password" required minlength="6" autocomplete="${mode === "login" ? "current-password" : "new-password"}">
                     <button type="button" class="pass-toggle" aria-label="Показать пароль">Показать</button></div>
                     ${mode === "register" ? `<small class="muted">Минимум 6 символов</small>` : ""}
                   </div>`
                : ""
            }
            ${mode === "register" ? `<label class="small muted check"><input type="checkbox" required> Я согласен(на) на обработку <a href="info.html#privacy">персональных данных</a></label>` : ""}
            <p class="form-msg" id="auth-msg" role="alert"></p>
            <button class="btn btn-block" type="submit">${mode === "login" ? "Войти" : mode === "register" ? "Создать аккаунт" : "Отправить ссылку"}</button>
          </form>
          <p class="auth-foot">
            ${mode === "login" ? `<button class="link" data-mode="reset">Забыли пароль?</button>` : ""}
            ${mode === "reset" ? `<button class="link" data-mode="login">← Вернуться ко входу</button>` : ""}
          </p>
        </div>
        <aside class="auth-perks">
          <h2>Зачем нужен кабинет</h2>
          <ul>
            <li><strong>История заказов</strong><span>Все ваши заказы и их статусы в одном месте.</span></li>
            <li><strong>Быстрое оформление</strong><span>Имя, телефон и адрес подставятся сами.</span></li>
            <li><strong>Избранное</strong><span>Сохраняйте средства, чтобы вернуться к ним позже.</span></li>
            <li><strong>Сохранённые адреса</strong><span>Дом, работа, салон — выберите нужный при заказе.</span></li>
          </ul>
        </aside>
      </div>`;

    root.querySelectorAll("[data-mode]").forEach((b) =>
      b.addEventListener("click", () => {
        mode = b.dataset.mode;
        renderAuth();
      })
    );
    const passToggle = $(".pass-toggle", root);
    if (passToggle)
      passToggle.addEventListener("click", () => {
        const inp = $("#a-pass");
        const show = inp.type === "password";
        inp.type = show ? "text" : "password";
        passToggle.textContent = show ? "Скрыть" : "Показать";
      });
    const m = $("#auth-msg");
    const g = $("#google");
    if (g) g.addEventListener("click", () => run(g, m, () => auth().signInWithGoogle()));
    const form = $("#auth-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const d = Object.fromEntries(new FormData(form));
      const btn = form.querySelector('[type="submit"]');
      run(btn, m, async () => {
        if (mode === "login") await auth().signIn(d.email.trim(), d.password);
        if (mode === "register") {
          const needConfirm = await auth().signUp(d.name.trim(), d.email.trim(), d.password);
          if (needConfirm) {
            root.innerHTML = `<div class="empty"><div class="success-icon">✉</div><h1>Подтвердите почту</h1>
              <p>Мы отправили письмо на <strong>${esc(d.email)}</strong>. Откройте его и нажмите ссылку, чтобы завершить регистрацию.</p>
              <p class="muted small">Письма нет? Проверьте папку «Спам».</p></div>`;
          }
        }
        if (mode === "reset") {
          await auth().resetPassword(d.email.trim());
          msg(m, "Готово! Проверьте почту: мы отправили ссылку для смены пароля.", true);
        }
      });
    });
  }

  function renderNewPassword() {
    root.innerHTML = `
      <div class="auth-wrap single"><div class="auth-card">
        <h1 class="auth-title">Новый пароль</h1>
        <form id="np-form" class="auth-form" novalidate>
          <div class="field"><label for="np">Новый пароль</label><input id="np" type="password" required minlength="6" autocomplete="new-password"></div>
          <p class="form-msg" id="np-msg" role="alert"></p>
          <button class="btn btn-block" type="submit">Сохранить пароль</button>
        </form>
      </div></div>`;
    const f = $("#np-form");
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!f.reportValidity()) return;
      run(f.querySelector("button"), $("#np-msg"), async () => {
        await auth().updatePassword($("#np").value);
        auth().recovery = false;
        history.replaceState(null, "", "account.html");
        ui().toast("Пароль изменён");
        render();
      });
    });
  }

  // ---------- Кабинет ----------
  const TABS = [
    ["orders", "Мои заказы"],
    ["favorites", "Избранное"],
    ["profile", "Личные данные"],
    ["addresses", "Адреса доставки"]
  ];
  const currentTab = () => {
    const h = location.hash.replace("#", "");
    return TABS.some(([k]) => k === h) ? h : "orders";
  };

  function renderCabinet() {
    const a = auth();
    const pr = a.profile || {};
    const name = pr.name || (a.user && a.user.email) || "";
    const tab = currentTab();
    root.innerHTML = `
      <div class="cab-head">
        <div class="avatar" aria-hidden="true">${esc(name.trim().charAt(0).toUpperCase() || "K")}</div>
        <div><p class="muted small">Личный кабинет</p><h1>Здравствуйте${pr.name ? ", " + esc(pr.name.split(" ")[0]) : ""}!</h1></div>
      </div>
      <div class="cab-layout">
        <nav class="cab-nav" aria-label="Разделы кабинета">
          ${TABS.map(([k, v]) => `<a href="#${k}" class="${k === tab ? "active" : ""}" ${k === tab ? 'aria-current="page"' : ""}>${v}</a>`).join("")}
          <button class="link logout" id="logout">Выйти</button>
        </nav>
        <section class="cab-body" id="cab-body"></section>
      </div>`;
    $("#logout").addEventListener("click", async () => {
      await a.signOut();
      ui().toast("Вы вышли из кабинета");
    });
    ({ orders, favorites, profile: profileTab, addresses })[tab]($("#cab-body"));
    const act = root.querySelector(".cab-nav a.active");
    if (act && act.scrollIntoView && window.innerWidth < 860) act.scrollIntoView({ block: "nearest", inline: "center" });
  }

  async function orders(box) {
    box.innerHTML = `<h2>Мои заказы</h2><p class="muted">Загружаем…</p>`;
    let list = [];
    try {
      list = await auth().orders();
    } catch (e) {
      box.innerHTML = `<h2>Мои заказы</h2><p class="form-msg err">${esc(auth().errorText(e))}</p>`;
      return;
    }
    if (!list.length) {
      box.innerHTML = `<h2>Мои заказы</h2><div class="cab-empty"><p>У вас пока нет заказов.</p><a class="btn" href="catalog.html">Перейти в каталог</a></div>`;
      return;
    }
    box.innerHTML =
      `<h2>Мои заказы</h2>` +
      list
        .map((o) => {
          const d = o.created_at ? new Date(o.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "";
          const items = Array.isArray(o.items) ? o.items : [];
          return `<article class="order">
            <header><div><strong>Заказ ${esc(o.number)}</strong><span class="muted small"> · ${esc(d)}</span></div>
            <span class="status status-${esc(o.status)}">${esc(STATUS[o.status] || o.status)}</span></header>
            <ul>${items.map((i) => `<li><span>${esc(i.name)}, ${esc(i.size)} × ${esc(i.qty)}</span><span>${typeof i.price === "number" ? ui().money(i.price * i.qty) : "по запросу"}</span></li>`).join("")}</ul>
            <footer><span class="muted small">${esc((o.customer && [o.customer.city, o.customer.address].filter(Boolean).join(", ")) || "")}</span>
            <strong>${o.total ? ui().money(Number(o.total)) : "Сумму сообщит менеджер"}</strong></footer>
          </article>`;
        })
        .join("");
  }

  function favorites(box) {
    const ids = auth().favorites();
    const list = ids.map((id) => ui().findProduct(id)).filter(Boolean);
    box.innerHTML =
      `<h2>Избранное</h2>` +
      (list.length
        ? `<div class="grid grid-3">${list.map(ui().productCard).join("")}</div>`
        : `<div class="cab-empty"><p>Нажимайте ♡ на товарах, чтобы сохранить их здесь.</p><a class="btn" href="catalog.html">Перейти в каталог</a></div>`);
  }

  function profileTab(box) {
    const a = auth();
    const pr = a.profile || {};
    box.innerHTML = `
      <h2>Личные данные</h2>
      <form id="pf" class="cab-form" novalidate>
        <div class="field"><label for="pf-name">Имя и фамилия</label><input id="pf-name" name="name" value="${esc(pr.name)}" autocomplete="name"></div>
        <div class="field"><label for="pf-phone">Телефон</label><input id="pf-phone" name="phone" type="tel" value="${esc(pr.phone)}" placeholder="+7 900 000-00-00" autocomplete="tel"></div>
        <div class="field"><label for="pf-email">Почта</label><input id="pf-email" value="${esc(a.user.email)}" disabled></div>
        <p class="form-msg" id="pf-msg" role="alert"></p>
        <button class="btn" type="submit">Сохранить</button>
      </form>
      <div class="cab-sub">
        <h3>Пароль</h3>
        <p class="muted small">Мы отправим на почту ссылку для смены пароля.</p>
        <button class="btn btn-outline btn-small" id="pf-reset">Сменить пароль</button>
        <p class="form-msg" id="pr-msg" role="alert"></p>
      </div>`;
    const f = $("#pf");
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      run(f.querySelector("button"), $("#pf-msg"), async () => {
        await a.saveProfile({ name: d.name.trim(), phone: d.phone.trim() });
        msg($("#pf-msg"), "Сохранено", true);
      });
    });
    const rb = $("#pf-reset");
    rb.addEventListener("click", () =>
      run(rb, $("#pr-msg"), async () => {
        await a.resetPassword(a.user.email);
        msg($("#pr-msg"), "Ссылка отправлена на " + a.user.email, true);
      })
    );
  }

  function addresses(box) {
    const a = auth();
    const list = (a.profile && a.profile.addresses) || [];
    box.innerHTML = `
      <h2>Адреса доставки</h2>
      ${
        list.length
          ? `<div class="addr-list">${list
              .map(
                (ad, i) => `<div class="addr">
                  <div><strong>${esc(ad.title || "Адрес " + (i + 1))}</strong>${i === 0 ? ' <span class="pill">Основной</span>' : ""}
                  <p class="muted small">${esc([ad.zip, ad.city, ad.address].filter(Boolean).join(", "))}</p></div>
                  <div class="addr-actions">
                    ${i > 0 ? `<button class="link" data-main="${i}">Сделать основным</button>` : ""}
                    <button class="link danger" data-del="${i}">Удалить</button>
                  </div></div>`
              )
              .join("")}</div>`
          : `<p class="muted">Сохранённых адресов пока нет. Основной адрес подставится при оформлении заказа.</p>`
      }
      <form id="ad" class="cab-form" novalidate>
        <h3>Добавить адрес</h3>
        <div class="field"><label for="ad-title">Название</label><input id="ad-title" name="title" placeholder="Дом, работа, салон"></div>
        <div class="field-row">
          <div class="field"><label for="ad-city">Город *</label><input id="ad-city" name="city" required autocomplete="address-level2"></div>
          <div class="field"><label for="ad-zip">Индекс</label><input id="ad-zip" name="zip" inputmode="numeric" autocomplete="postal-code"></div>
        </div>
        <div class="field"><label for="ad-address">Улица, дом, квартира *</label><input id="ad-address" name="address" required autocomplete="street-address"></div>
        <p class="form-msg" id="ad-msg" role="alert"></p>
        <button class="btn" type="submit">Добавить адрес</button>
      </form>`;
    const save = (next) => a.saveProfile({ addresses: next }).then(() => addresses(box));
    box.querySelectorAll("[data-del]").forEach((b) =>
      b.addEventListener("click", () => save(list.filter((_, i) => i !== Number(b.dataset.del))).catch((e) => ui().toast(a.errorText(e))))
    );
    box.querySelectorAll("[data-main]").forEach((b) =>
      b.addEventListener("click", () => {
        const i = Number(b.dataset.main);
        save([list[i], ...list.filter((_, j) => j !== i)]).catch((e) => ui().toast(a.errorText(e)));
      })
    );
    const f = $("#ad");
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!f.reportValidity()) return;
      const d = Object.fromEntries(new FormData(f));
      run(f.querySelector('[type="submit"]'), $("#ad-msg"), async () => {
        await save([...list, { title: d.title.trim(), city: d.city.trim(), zip: d.zip.trim(), address: d.address.trim() }]);
        ui().toast("Адрес сохранён");
      });
    });
  }

  // ---------- Кабинет без сервера ----------
  function renderDisabled() {
    root.innerHTML = `
      <div class="auth-wrap single"><div class="auth-card center">
        <h1 class="auth-title">Личный кабинет</h1>
        <p>Регистрация и вход скоро будут доступны.</p>
        <p class="muted small">А пока вы можете оформить заказ без регистрации: менеджер свяжется с вами по телефону.</p>
        <a class="btn" href="catalog.html">Перейти в каталог</a>
      </div></div>
      <section class="section"><div id="fav-local"></div></section>`;
    const ids = auth().favorites();
    if (ids.length) {
      $("#fav-local").innerHTML = `<h2>Избранное</h2><div class="grid">${ids
        .map((id) => ui().findProduct(id))
        .filter(Boolean)
        .map(ui().productCard)
        .join("")}</div>`;
    }
  }

  function render() {
    const a = auth();
    if (!a.enabled) return renderDisabled();
    if (a.recovery || (a.user && new URLSearchParams(location.search).get("reset"))) return renderNewPassword();
    if (!a.user) return renderAuth();
    renderCabinet();
  }

  document.addEventListener("DOMContentLoaded", () => {
    root = $("#account");
    if (new URLSearchParams(location.search).get("mode") === "register") mode = "register";
    auth().ready.then(() => {
      render();
      auth().onChange(() => {
        // Перерисовываем только при входе/выходе, чтобы не сбивать заполнение форм
        const key = auth().user ? auth().user.id : "";
        if (key !== render.last) {
          render.last = key;
          render();
        }
      });
      render.last = auth().user ? auth().user.id : "";
    });
    window.addEventListener("hashchange", () => auth().user && renderCabinet());
  });
})();
