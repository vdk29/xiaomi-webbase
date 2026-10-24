import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import manifest from "./manifest.json" with { type: "json" };

// Only reviewed, preprocessed files at fixed paths may be staged or attached.
Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || "";
  const { data: { user } } = await db.auth.getUser(token);
  let authorized = false;
  if (user) {
    const { data } = await db.from("webbase_staff").select("role,active").eq("user_id", user.id).single();
    authorized = data?.role === "admin" && data.active;
  }
  if (!authorized) return new Response("Admin only", { status: 403 });
  const body = await req.json();
  const { start = 0, action = "verify" } = body;
  if (!Number.isInteger(start) || start < 0 || start >= manifest.length || !["stage", "verify", "attach"].includes(action)) return new Response("Invalid request", { status: 400 });
  const results = [];
  for (const entry of manifest.slice(start, start + 10)) {
    try {
      if (action === "stage") {
        const { data, error } = await db.storage.from("webbase-products").createSignedUploadUrl(entry.path);
        if (error) throw error;
        results.push({ sku: entry.sku, path: entry.path, signedUrl: data.signedUrl });
        continue;
      }
      const { data: blob, error: downloadError } = await db.storage.from("webbase-products").download(entry.path);
      if (downloadError) throw downloadError;
      const bytes = await blob.arrayBuffer();
      const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map(b => b.toString(16).padStart(2, "0")).join("");
      if (hash !== entry.sha256 || bytes.byteLength !== entry.byte_size) throw new Error("Prepared image checksum mismatch");
      if (action === "attach") {
        const { data: existing, error: lookupError } = await db.from("webbase_product_images").select("id").eq("storage_path", entry.path).maybeSingle();
        if (lookupError) throw lookupError;
        if (!existing) {
          const { data: product, error: productError } = await db.from("webbase_products").select("id").eq("sku", entry.sku).single();
          if (productError) throw productError;
          const { count, error: countError } = await db.from("webbase_product_images").select("id", {count:"exact",head:true}).eq("product_id", product.id);
          if (countError) throw countError;
          const { error } = await db.from("webbase_product_images").insert({product_id:product.id,storage_path:entry.path,mime_type:"image/webp",byte_size:entry.byte_size,width:entry.width,height:entry.height,source_url:entry.source_url,original_name:entry.original_name,is_primary:count===0,sort_order:count || 0});
          if (error) throw error;
        }
      }
      results.push({ sku: entry.sku, status: action === "attach" ? "attached" : "verified" });
    } catch (error) { results.push({ sku: entry.sku, status: "error", message: String(error) }); }
  }
  return Response.json({ results });
});
