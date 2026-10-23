import { $, escapeHtml, formatDate, setBusy, errorMessage } from "./utils.js";

async function invoke(db, body) {
  const { data, error } = await db.client.functions.invoke("webbase-create-staff", { body });
  if (error) throw new Error(data?.message || error.message);
  if (!data?.ok) throw new Error(data?.message || "Операция не выполнена.");
  return data;
}

export async function loadEmployees(db) {
  const data = await invoke(db, { action: "list" });
  return data.staff || [];
}

export function initializeEmployees(db, state, notify) {
  $("staffForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.submitter;
    setBusy(button, true, "Создаю…");
    try {
      const form = new FormData(event.currentTarget);
      await invoke(db, {
        action: "create",
        username: form.get("username"),
        displayName: form.get("displayName"),
        password: form.get("password"),
        role: form.get("role"),
      });
      event.currentTarget.reset();
      notify("Сотрудник создан. Передайте временный пароль лично.");
      await refreshEmployees(db, state, notify);
    } catch (error) {
      notify(errorMessage(error), true);
    } finally {
      setBusy(button, false);
    }
  });

  $("staffList").addEventListener("click", async (event) => {
    const button = event.target.closest("button[da…2210 tokens truncated…lse })
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
  signedUrlCache.delete(image.storage_path);
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
