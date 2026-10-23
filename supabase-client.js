// Xiaomi WebBase Supabase adapter. Include the official supabase-js browser bundle
// before this file. Database reads require an approved authenticated staff account.
(function () {
  const config = window.WEBBASE_SUPABASE;
  if (!config || !window.supabase?.createClient) {
    console.warn("WebBase: Supabase SDK or configuration is missing.");
    return;
  }
  const client = window.supabase.createClient(config.url, config.publishableKey);
  const toProduct = (row) => ({
    id: row.external_id || row.id,
    dbId: row.id,
    sku: row.sku || "",
    name: row.name,
    category: row.category || "Другое",
    memory: row.memory || "",
    color: row.color || "",
    imagePath: row.image_path,
    display: row.webbase_stock?.display ?? 0,
    warehouse: row.webbase_stock?.warehouse ?? 0,
    ldu: row.webbase_stock?.ldu ?? 0,
    quantity: (row.webbase_stock?.display ?? 0) + (row.webbase_stock?.warehouse ?? 0),
    total: (row.webbase_stock?.display ?? 0) + (row.webbase_stock?.warehouse ?? 0),
    specs: {}
  });
  window.WebBaseDB = {
    client,
    async getSession() {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data.session;
    },
    async signIn(login, password) {
      const username = String(login).trim();
      const email = username.includes("@") ? username : "staff-" + Array.from(new TextEncoder().encode(username.toLowerCase())).map(x => x.toString(16).padStart(2,"0")).join("") + "@users.webbase.invalid";
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async createStaff(username,password) {
      const {data,error}=await client.functions.invoke("webbase-create-staff",{body:{username,password}});
      if(error) throw Error(data?.message || "Не удалось создать сотрудника");
      if(!data?.created) throw Error(data?.message || "Создание не подтверждено");
      return data;
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },
    async listProducts() {
      const { data, error } = await client.from("webbase_products")
        .select("*,webbase_stock(warehouse,display,ldu)")
        .eq("active", true).order("name");
      if (error) throw error;
      return data.map(toProduct);
    },
    async getImageUrl(path) {
      if (!path) return null;
      const { data, error } = await client.storage.from(config.bucket)
        .createSignedUrl(path, 3600);
      if (error) throw error;
      return data.signedUrl;
    }
  };
})();
