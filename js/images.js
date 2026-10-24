import { placeholderSvg } from "./utils.js?v=20261023-4";

const clientCaches = new WeakMap();
const imageRequests = new WeakMap();
const URL_LIFETIME = 15 * 60;
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function getCache(db) {
  const userId = db.getUserId ? (db.getUserId() || 'anonymous') : ((db.getSession ? await db.getSession() : null)?.user?.id || 'anonymous');
  const key = `webbase-photo-links:${db.config.url}:${userId}`;
  let cache = clientCaches.get(db);
  if (cache?.key === key) return cache;
  if (cache) {
    try { sessionStorage.removeItem(cache.key); } catch { /* Storage can be unavailable. */ }
  }
  cache = { key, urls: new Map(), pending: new Map() };
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || "[]");
    for (const [path, entry] of saved) {
      if (entry.expiresAt > Date.now()) cache.urls.set(path, entry);
    }
  } catch { /* Private browsing can disable sessionStorage. */ }
  clientCaches.set(db, cache);
  return cache;
}

function saveCache(cache) {
  try {
    const entries = [...cache.urls].filter(([, entry]) => entry.expiresAt > Date.now());
    sessionStorage.setItem(cache.key, JSON.stringify(entries));
  } catch { /* Keep the in-memory cache when storage is unavailable. */ }
}

export async function primeSignedUrls(db, paths) {
  const cache = await getCache(db);
  const unique = [...new Set(paths.filter(Boolean))];
  const missing = unique.filter(path => !cache.pending.has(path) && !(cache.urls.get(path)?.expiresAt > Date.now()));
  for (let offset = 0; offset < missing.length; offset += 100) {
    const batch = missing.slice(offset, offset + 100);
    const request = (async () => {
      const { data, error } = await db.client.storage.from(db.config.bucket).createSignedUrls(batch, URL_LIFETIME);
      if (error) throw error;
      for (const entry of data || []) {
        if (entry.signedUrl && !entry.error) cache.urls.set(entry.path, { url: entry.signedUrl, expiresAt: Date.now() + 12 * 60 * 1000 });
      }
      saveCache(cache);
    })().finally(() => batch.forEach(path => cache.pending.delete(path)));
    batch.forEach(path => cache.pending.set(path, request));
  }
  await Promise.all(unique.map(path => cache.pending.get(path)).filter(Boolean));
}

export async function getSignedUrl(db, path, force = false) {
  if (!path) return null;
  const cache = await getCache(db);
  if (force) cache.urls.delete(path);
  if (!(cache.urls.get(path)?.expiresAt > Date.now())) await primeSignedUrls(db, [path]);
  const entry = cache.urls.get(path);
  if (!entry) throw new Error("Фотография недоступна.");
  return entry.url;
}

export async function setSignedImage(db, image, path, fallbackLabel = "Товар") {
  const ticket = (imageRequests.get(image) || 0) + 1;
  imageRequests.set(image, ticket);
  image.onerror = null;
  image.decoding = "async";
  if (!path || image.dataset.storagePath !== path) image.src = placeholderSvg(fallbackLabel);
  if (!path) { delete image.dataset.storagePath; return; }
  image.dataset.storagePath = path;
  try {
    const url = await getSignedUrl(db, path);
    if (imageRequests.get(image) !== ticket) return;
    if (image.src !== url) image.src = url;
    image.onerror = async () => {
      image.onerror = null;
      try {
        const refreshed = await getSignedUrl(db, path, true);
        if (imageRequests.get(image) !== ticket) return;
        image.onerror = () => { if (imageRequests.get(image) === ticket) image.src = placeholderSvg(fallbackLabel); image.onerror = null; };
        image.src = refreshed;
      } catch {
        if (imageRequests.get(image) === ticket) image.src = placeholderSvg(fallbackLabel);
      }
    };
  } catch {
    if (imageRequests.get(image) === ticket) image.src = placeholderSvg(fallbackLabel);
  }
}

export function observeCatalogImages(db, root = document) {
  const images = [...root.querySelectorAll("img[data-lazy-path]")];
  const load = image => { image.loading = "eager"; return setSignedImage(db, image, image.dataset.lazyPath, image.alt); };
  if (!("IntersectionObserver" in window)) { images.forEach(load); return () => {}; }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      load(entry.target);
    }
  }, { rootMargin: "600px" });
  images.forEach((image, index) => index < 8 ? load(image) : observer.observe(image));
  return () => observer.disconnect();
}

async function decodeImage(file) {
  if ("createImageBitmap" in window) return createImageBitmap(file);
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function prepareImage(file) {
  if (!file) throw new Error("Выберите изображение.");
  const name = file.name.toLocaleLowerCase("en-US");
  if (/\.(heic|heif)$/.test(name) || /heic|heif/.test(file.type)) {
    throw new Error("HEIC пока не поддерживается надёжно в браузере. На iPhone выберите «Наиболее совместимый» формат или сохраните фото как JPG.");
  }
  if (!ACCEPTED_TYPES.has(file.type)) throw new Error("Разрешены только JPG, PNG и WebP.");
  if (file.size > MAX_SOURCE_BYTES) throw new Error("Исходный файл должен быть не больше 12 МБ.");

  const source = await decodeImage(file);
  const width = source.width || source.naturalWidth;
  const height = source.height || source.naturalHeight;
  const scale = Math.min(1, 1024 / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d", { alpha: false });
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  if (source.close) source.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  if (!blob) throw new Error("Браузер не смог подготовить изображение.");
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error("После сжатия файл превышает 5 МБ. Выберите изображение меньшего размера.");
  return { blob, width: canvas.width, height: canvas.height, originalName: file.name };
}

export async function uploadProductImage(db, productId, prepared, userId, isPrimary = false) {
  const { count, error: limitError } = await db.client.from("webbase_product_images")
    .select("id", { count: "exact", head: true }).eq("product_id", productId);
  if (limitError) throw limitError;
  if (count >= 3) throw new Error("У товара может быть не более 3 фотографий.");
  const path = `products/${productId}/${crypto.randomUUID()}.webp`;
  const { error: uploadError } = await db.client.storage
    .from(db.config.bucket)
    .upload(path, prepared.blob, { contentType: "image/webp", cacheControl: "3600", upsert: false });
  if (uploadError) throw uploadError;

  const { data: existing, error: countError } = await db.client
    .from("webbase_product_images")
    .select("id,sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1);
  if (countError) {
    await db.client.storage.from(db.config.bucket).remove([path]);
    throw countError;
  }
  const sortOrder = existing?.[0] ? existing[0].sort_order + 1 : 0;
  const { data, error } = await db.client
    .from("webbase_product_images")
    .insert({
      product_id: productId,
      storage_path: path,
      sort_order: sortOrder,
      is_primary: isPrimary || !existing?.length,
      uploaded_by: userId,
      mime_type: "image/webp",
      byte_size: prepared.blob.size,
      width: prepared.width,
      height: prepared.height,
      original_name: prepared.originalName,
    })
    .select()
    .single();
  if (error) {
    await db.client.storage.from(db.config.bucket).remove([path]);
    throw error;
  }
  return data;
}

export async function deleteProductImage(db, image) {
  const { error: rowError } = await db.client
    .from("webbase_product_images")
    .delete()
    .eq("id", image.id);
  if (rowError) throw rowError;
  const { error: storageError } = await db.client.storage
    .from(db.config.bucket)
    .remove([image.storage_path]);
  if (storageError) {
    console.warn("WebBase: orphaned storage object after metadata deletion", image.storage_path, storageError);
  }
  const cache = await getCache(db);
  cache.urls.delete(image.storage_path);
  saveCache(cache);
}

export async function setPrimaryImage(db, image) {
  const { error } = await db.client
    .from("webbase_product_images")
    .update({ is_primary: true })
    .eq("id", image.id);
  if (error) throw error;
}

export async function reorderImages(db, productId, images) {
  for (let index = 0; index < images.length; index += 1) {
    const { error } = await db.client
      .from("webbase_product_images")
      .update({ sort_order: index })
      .eq("id", images[index].id)
      .eq("product_id", productId);
    if (error) throw error;
  }
}
