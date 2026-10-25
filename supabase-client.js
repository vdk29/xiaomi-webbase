// Browser adapter. This file intentionally contains only a public publishable key.
(function initializeWebBaseClient() {
  "use strict";
  const config = window.WEBBASE_SUPABASE;
  if (!config || !window.supabase?.createClient) {
    console.warn("WebBase: Supabase SDK or public configuration is missing.");
    return;
  }

  // Bound auth and read-only image signing, including response bodies.
  // Imports, uploads, product writes and staff mutations keep their original fetch.
  const boundedFetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const authRequest = url?.includes('/auth/v1/');
    const signingRequest = url?.includes('/storage/v1/object/sign/');
    if (!authRequest && !signingRequest) return fetch(input, init);
    const controller = new AbortController();
    const forwardAbort = () => controller.abort();
    if (init.signal?.aborted) forwardAbort();
    init.signal?.addEventListener('abort', forwardAbort, { once: true });
    const timer = setTimeout(() => controller.abort(), authRequest ? 12000 : 6000);
    try {
      const response = await fetch(input, { ...init, signal: controller.signal });
      const body = await response.arrayBuffer();
      const headers = new Headers(response.headers);
      headers.delete('content-encoding');
      headers.delete('content-length');
      return new Response([204, 205, 304].includes(response.status) ? null : body, { status: response.status, statusText: response.statusText, headers });
    } finally {
      clearTimeout(timer);
      init.signal?.removeEventListener('abort', forwardAbort);
    }
  };
  const client = window.supabase.createClient(config.url, config.publishableKey, {
    global: { fetch: boundedFetch },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: "xiaomi-webbase-auth",
      lockAcquireTimeout: 10000,
    },
  });
  let currentUserId = null;
  client.auth.onAuthStateChange((_event, session) => { currentUserId = session?.user?.id || null; });

  const usernameToEmail = (login) => {
    const username = String(login ?? "").trim();
    if (username.includes("@")) return username.toLocaleLowerCase("en-US");
    const canonical = username.toLocaleLowerCase("ru-RU");
    const bytes = new TextEncoder().encode(canonical);
    const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
    return `staff-${hex}@users.webbase.invalid`;
  };

  window.WebBaseDB = Object.freeze({
    client,
    config,
    // Identity only, for signed-link cache isolation; authorization still uses RLS.
    getUserId: () => currentUserId,
    usernameToEmail,
    async getSession() {
      let timer;
      try {
        const result = await Promise.race([
          client.auth.getSession(),
          new Promise((_, reject) => { timer = setTimeout(() => reject(Object.assign(new Error('Проверка входа заняла слишком много времени. Повторите подключение.'), { code: 'SESSION_TIMEOUT' })), 18000); }),
        ]);
        if (result.error) throw result.error;
        currentUserId = result.data.session?.user?.id || null;
        return result.data.session;
      } finally { clearTimeout(timer); }
    },
    async signIn(login, password) {
      const email = usernameToEmail(login);
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async signOut() {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
    },
  });
})();
