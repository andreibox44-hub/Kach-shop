// Личный кабинет: вход, регистрация, профиль, заказы и избранное.
// Работает через Supabase. Если ключи в js/supabase-config.js не заполнены,
// сайт работает как раньше, а кабинет показывает «скоро будет доступен».
(function () {
  const FAV_KEY = "kach-favorites";
  const listeners = [];
  let user = null;
  let profile = null;
  let sb = null;
  let readyResolve;
  const ready = new Promise((r) => (readyResolve = r));

  const localFavs = () => {
    try {
      const v = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  };
  const saveLocalFavs = (list) => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(list));
    } catch (e) {}
  };
  const emit = () => listeners.forEach((fn) => fn(user, profile));

  // Понятные сообщения об ошибках
  function errorText(e) {
    const m = String((e && (e.message || e.error_description)) || e || "").toLowerCase();
    if (m.includes("invalid login credentials")) return "Неверная почта или пароль.";
    if (m.includes("email not confirmed")) return "Почта не подтверждена. Откройте письмо от нас и нажмите ссылку.";
    if (m.includes("already registered") || m.includes("already been registered")) return "Эта почта уже зарегистрирована. Войдите или восстановите пароль.";
    if (m.includes("password should be at least") || m.includes("weak")) return "Пароль слишком простой: нужно минимум 6 символов.";
    if (m.includes("invalid email") || m.includes("unable to validate email")) return "Неверный формат почты.";
    if (m.includes("rate limit") || m.includes("too many")) return "Слишком много попыток. Попробуйте через несколько минут.";
    if (m.includes("provider is not enabled")) return "Вход через Google пока не включён в настройках Supabase.";
    if (m.includes("failed to fetch") || m.includes("network")) return "Нет соединения с сервером. Проверьте интернет.";
    if (m.includes("row-level security") || m.includes("permission")) return "Нет доступа к данным. Проверьте, что выполнен файл supabase/schema.sql.";
    return "Что-то пошло не так. Попробуйте ещё раз.";
  }

  const pageUrl = (name) => new URL(name, location.href).href.split("#")[0].split("?")[0];

  async function loadProfile() {
    if (!user) return (profile = null);
    let { data, error } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (error) throw error;
    if (!data) {
      data = {
        id: user.id,
        name: (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || "",
        email: user.email || "",
        phone: "",
        addresses: [],
        favorites: []
      };
      const ins = await sb.from("profiles").insert(data);
      if (ins.error) throw ins.error;
    }
    profile = { addresses: [], favorites: [], ...data };
    // Переносим избранное, добавленное до входа
    const local = localFavs();
    if (local.length) {
      const merged = Array.from(new Set([...(profile.favorites || []), ...local]));
      profile.favorites = merged;
      await sb.from("profiles").update({ favorites: merged }).eq("id", user.id);
      saveLocalFavs([]);
    }
    return profile;
  }

  const api = {
    enabled: false,
    ready,
    errorText,
    get user() {
      return user;
    },
    get profile() {
      return profile;
    },
    onChange(fn) {
      listeners.push(fn);
      fn(user, profile);
    },
    async signIn(email, password) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    // Возвращает true, если нужно подтвердить почту
    async signUp(name, email, password) {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { full_name: name }, emailRedirectTo: pageUrl("account.html") }
      });
      if (error) throw error;
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new Error("already registered");
      }
      return !data.session;
    },
    async signInWithGoogle() {
      const { error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: pageUrl("account.html"), queryParams: { prompt: "select_account" } }
      });
      if (error) throw error;
    },
    async resetPassword(email) {
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: pageUrl("account.html") + "?reset=1" });
      if (error) throw error;
    },
    async updatePassword(password) {
      const { error } = await sb.auth.updateUser({ password });
      if (error) throw error;
    },
    async signOut() {
      await sb.auth.signOut();
    },
    async saveProfile(data) {
      const { error } = await sb.from("profiles").update(data).eq("id", user.id);
      if (error) throw error;
      Object.assign(profile, data);
      emit();
    },
    async orders() {
      const { data, error } = await sb.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async saveOrder(order) {
      const { error } = await sb.from("orders").insert({ ...order, user_id: user ? user.id : null });
      if (error) throw error;
    },
    favorites() {
      return user && profile ? profile.favorites || [] : localFavs();
    },
    async toggleFavorite(id) {
      const list = api.favorites();
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      if (user && profile) {
        profile.favorites = next;
        await sb.from("profiles").update({ favorites: next }).eq("id", user.id);
      } else {
        saveLocalFavs(next);
      }
      emit();
      return next.includes(id);
    }
  };
  window.KACH_AUTH = api;

  // Тестовый режим для проверки вёрстки без сервера
  if (window.KACH_AUTH_MOCK) {
    window.KACH_AUTH_MOCK(api, { emit, setUser: (u, p) => ((user = u), (profile = p)) });
    readyResolve();
    return;
  }

  const cfg = window.KACH_SUPABASE || {};
  if (!cfg.url || !cfg.anonKey || !window.supabase) {
    readyResolve();
    return;
  }

  sb = window.supabase.createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  api.enabled = true;
  api.client = sb;

  let first = true;
  const finish = () => {
    if (first) {
      first = false;
      readyResolve();
    }
  };
  async function apply(session, event) {
    const prev = user && user.id;
    user = session ? session.user : null;
    if (event === "PASSWORD_RECOVERY") api.recovery = true;
    if (!user) profile = null;
    else if (user.id !== prev || !profile) {
      try {
        await loadProfile();
      } catch (e) {
        console.error(e);
        profile = { name: "", phone: "", addresses: [], favorites: [] };
      }
    }
    emit();
    finish();
  }
  // Обработчик не должен ждать запросов внутри себя — откладываем их
  sb.auth.onAuthStateChange((event, session) => setTimeout(() => apply(session, event), 0));
  sb.auth.getSession().then(({ data }) => apply(data.session, "INITIAL"));
})();
