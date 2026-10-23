// Browser adapter. This file intentionally contains only a public publishable key.
(function initializeWebBaseClient() {
  "use strict";
  const config = window.WEBBASE_SUPABASE;
  if (!config || !window.supabase?.createClient) {
    console.warn("WebBase: Supabase SDK or public configuration is missing.");
    return;
  }

  const client = window.supabase.createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: "xiaomi-webbase-auth",
    },
  });

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
    usernameToEmail,
    async getSession() {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data.session;
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
