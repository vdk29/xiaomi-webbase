import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import manifest from "./manifest.json" with { type: "json" };

// Fixed reviewed sources only. No arbitrary URLs, keys or product updates accepted.
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
  const { start = 0 } = await req.json();
  if (!Number.isInteger(start) || start < 0 || start >= manifest.length) return new Response("Invalid offset", { status: 400 });
  const results = [];
  for (const entry of manifest.slice(start, start + 3)) {
    let path: string | null = null;
    try {
      const { data: product, error: productError } = await db.from("webbase_products").select("id,sku").eq("sku", entry.sku).single();
      if (productError || !product) throw new Error("Product SKU not found");
      const { data: images, error: imagesError } = await db.from("webbase_product_images").select("id,source_url,original_name").eq("product_id", product.id);
      if (imagesError) throw imagesError;
      const originalName = "original_name" in entry ? entry.original_name : `Официальное изображение модели: ${entry.name}`;
      if (images!.some(i => "original_name" in entry ? i.original_name === originalName : i.source_url === entry.source_url) || images!.length >= 3) {
        results.push({ sku: entry.sku, status: "already-present" }); continue;
      }
      const imageUrl = new URL(entry.image_url);
      if (imageUrl.protocol !== "https:" || !["i02.appmifile.com", "i01.appmifile.com", "www.borofone.com", "mi-shop.com"].includes(imageUrl.hostname)) throw new Error("Unapproved source");
      const response = await fetch(imageUrl, { redirect: "error", signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`Image HTTP ${response.status}`);
      const bytes = await response.arrayBuffer();
      if (bytes.byteLength > 5242880 || bytes.byteLength === 0) throw new Error("Invalid image size");
      // Accept actual raster signatures, not HTML pages or SVG.
      const b = new Uint8Array(bytes);
      const mime = b[0] === 0xff && b[1] === 0xd8 ? "image/jpeg" : b[0] === 0x89 && b[1] === 0x50 ? "image/png" : null;
      if (!mime) throw new Error("Unsupported image signature");
      path = `products/${product.id}/${crypto.randomUUID()}.${mime === "image/png" ? "png" : "jpg"}`;
      const { error: uploadError } = await db.storage.from("webbase-products").upload(path, bytes, { contentType: mime, upsert: false });
      if (uploadError) throw uploadError;
      const { error } = await db.from("webbase_product_images").insert({ product_id: product.id, storage_path: path,
        mime_type: mime, byte_size: bytes.byteLength, source_url: entry.source_url,
        original_name: originalName, sort_order: images!.length, is_primary: images!.length === 0 });
      if (error) throw error;
      results.push({ sku: entry.sku, status: "uploaded" });
    } catch (error) {
      if (path) await db.storage.from("webbase-products").remove([path]);
      results.push({ sku: entry.sku, status: "error", message: String(error) });
    }
  }
  return Response.json({ results });
});
