import { parseQuantity } from "./utils.js?v=20261023-4";

export const PRODUCT_SELECT = `
  id,external_id,sku,name,source_name,source_skus,category,brand,model,memory,color,
  description,specs,active,created_at,updated_at,last_imported_at,
  webbase_stock(warehouse,display,ldu,updated_at),
  webbase_product_images(id,storage_path,sort_order,is_primary,mime_type,byte_size,width,height,created_at,original_name)
`;

export function normalizeProduct(row) {
  const stock = Array.isArray(row.webbase_stock) ? row.webbase_stock[0] : row.webbase_stock;
  const images = [...(row.webbase_product_images || [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  return {
    ...row,
    stock: {
      warehouse: Number(stock?.warehouse || 0),
      display: Number(stock?.display || 0),
      ldu: Number(stock?.ldu || 0),
      updated_at: stock?.updated_at || null,
    },
    images,
    primaryImage: images.find((image) => image.is_primary) || images[0] || null,
  };
}

export async function listProducts(db) {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db.client
      .from("webbase_products")
      .select(PRODUCT_SELECT)
      .eq("active", true)
      .order("name")
      .range(offset, offset + 499);
    if (error) throw error;
    rows.push(...data.map(normalizeProduct));
    if (data.length < 500) break;
  }
  return rows;
}

export async function getProduct(db, productId) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId || "")) {
    throw new Error("Некорректный идентификатор товара.");
  }
  const { data, error } = await db.client
    .from("webbase_products")
    .select(PRODUCT_SELECT)
    .eq("id", productId)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeProduct(data) : null;
}

export function readProductForm(form) {
  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();
  const sku = String(formData.get("sku") || "").trim();
  if (!name) throw new Error("Название обязательно.");
  if (name.length > 240) throw new Error("Название слишком длинное.");
  if (sku.length > 160) throw new Error("Артикул слишком длинный.");

  let specs = {};
  const specsText = String(formData.get("specs") || "").trim();
  if (specsText) {
    try {
      specs = JSON.parse(specsText);
    } catch {
      throw new Error("Характеристики должны быть корректным JSON-объектом.");
    }
    if (!specs || Array.isArray(specs) || typeof specs !== "object") {
      throw new Error("Характеристики должны быть JSON-объектом.");
    }
  }

  const warehouse = parseQuantity(formData.get("warehouse"));
  const display = parseQuantity(formData.get("display"));
  const ldu = parseQuantity(formData.get("ldu"));
  if ([warehouse, display, ldu].some((value) => value === null)) {
    throw new Error("Остатки должны быть целыми неотрицательными числами.");
  }

  const clean = (key, max = 160) => {
    const value = String(formData.get(key) || "").trim();
    if (value.length > max) throw new Error(`Поле «${key}» слишком длинное.`);
    return value || null;
  };
  return {
    patch: {
      name,
      sku: sku || null,
      category: clean("category"),
      brand: clean("brand"),
      model: clean("model"),
      color: clean("color"),
      memory: clean("memory"),
      description: clean("description", 5000),
      specs,
    },
    stock: { warehouse, display, ldu },
  };
}

export async function saveProduct(db, productId, formValue) {
  const { data, error } = await db.client.rpc("webbase_update_product", {
    p_product_id: productId,
    p_patch: formValue.patch,
    p_warehouse: formValue.stock.warehouse,
    p_display: formValue.stock.display,
    p_ldu: formValue.stock.ldu,
  });
  if (error) throw error;
  return data;
}

export async function archiveProduct(db, productId) {
  const { error } = await db.client.rpc("webbase_archive_product", { p_product_id: productId });
  if (error) throw error;
}
