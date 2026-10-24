import { $, escapeHtml, errorMessage, formatDate, placeholderSvg, setBusy } from "./js/utils.js?v=20261023-4";
import { requireApprovedUser } from "./js/auth.js?v=20261023-4";
import { archiveProduct, getProduct, readProductForm, saveProduct } from "./js/products.js?v=20261024-2";
import {
  deleteProductImage, prepareImage, reorderImages, setPrimaryImage, setSignedImage, uploadProductImage,
} from "./js/images.js?v=20261024-1";

const db = window.WebBaseDB;
const state = { context: null, product: null, selectedImageId: null, preparedImage: null, dirty: false };
const productId = new URLSearchParams(location.search).get("id");

function notify(message, isError = false) {
  const element = $("notice");
  element.textContent = message;
  element.className = `toast ${isError ? "error" : "success"}`;
  setTimeout(() => { if (element.textContent === message) element.textContent = ""; }, 6000);
}

const optionalField = (label, value) => value
  ? `<div class="detail"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`
  : "";

function trustedHttpUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function appendSpecRow(key = "", value = "") {
  if ($("specsEditor").children.length >= 80) throw new Error("Можно добавить не более 80 характеристик.");
  const row = document.createElement("div");
  row.className = "spec-row";
  const keyInput = document.createElement("input");
  keyInput.type = "text";
  keyInput.maxLength = 120;
  keyInput.placeholder = "Например, Экран";
  keyInput.dataset.specKey = "";
  keyInput.value = key;
  const valueInput = document.createElement("input");
  valueInput.type = "text";
  valueInput.maxLength = 1000;
  valueInput.placeholder = "Например, 6,83″ AMOLED, 120 Гц";
  valueInput.dataset.specValue = "";
  valueInput.value = Array.isArray(value) ? value.join(", ") : (typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? ""));
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "spec-remove";
  remove.dataset.removeSpec = "";
  remove.setAttribute("aria-label", "Удалить характеристику");
  remove.textContent = "×";
  row.append(keyInput, valueInput, remove);
  $("specsEditor").append(row);
}

function renderSpecsEditor(specs = {}) {
  $("specsEditor").replaceChildren();
  const entries = Object.entries(specs).filter(([key]) => !key.startsWith("_"));
  entries.forEach(([key, value]) => appendSpecRow(key, value));
  if (!entries.length) appendSpecRow();
}

function syncSpecsField(form) {
  const specs = Object.create(null);
  form.querySelectorAll(".spec-row").forEach((row) => {
    const key = row.querySelector("[data-spec-key]").value.trim();
    const value = row.querySelector("[data-spec-value]").value.trim();
    if (!key && !value) return;
    if (!key || !value) throw new Error("У каждой характеристики должны быть заполнены название и значение.");
    if (["__proto__", "prototype", "constructor"].includes(key)) throw new Error(`Недопустимое название характеристики: ${key}`);
    if (Object.hasOwn(specs, key)) throw new Error(`Характеристика «${key}» указана дважды.`);
    specs[key] = value;
  });
  const sourceUrl = trustedHttpUrl(form.elements.specSourceUrl.value);
  if (form.elements.specSourceUrl.value.trim() && !sourceUrl) throw new Error("Укажите корректную ссылку на источник (http или https).");
  if (sourceUrl) specs._source_url = sourceUrl;
  if (form.elements.specVerifiedAt.value) specs._verified_at = form.elements.specVerifiedAt.value;
  form.elements.specs.value = JSON.stringify(specs);
}

async function renderProduct() {
  const product = state.product;
  document.title = `${product.name} — Xiaomi WebBase`;
  $("productName").textContent = product.name;
  $("productCategory").textContent = product.category || "Без категории";
  $("productSubtitle").textContent = [product.brand, product.model, product.color, product.memory].filter(Boolean).join(" · ");
  $("productFields").innerHTML = [
    optionalField("Бренд", product.brand),
    optionalField("Категория", product.category),
    optionalField("Модель", product.model),
    optionalField("Артикул", product.sku),
    optionalField("Цвет", product.color),
    optionalField("Память", product.memory),
  ].join("");
  const total = product.stock.warehouse + product.stock.display;
  $("productStock").innerHTML = `
    <div><strong>${product.stock.warehouse}</strong><span>Основной склад</span></div>
    <div><strong>${product.stock.display}</strong><span>Витрина (ОВ)</span></div>
    ${product.stock.ldu ? `<div><strong>${product.stock.ldu}</strong><span>LDU</span></div>` : ""}
    <div class="stock-total"><strong>${total}</strong><span>Доступно всего</span></div>`;
  $("stockUpdated").textContent = product.stock.updated_at ? `Обновлено ${formatDate(product.stock.updated_at)}` : "";
  $("descriptionSection").hidden = !product.description;
  $("productDescription").textContent = product.description || "";
  const specs = Object.entries(product.specs || {}).filter(([key, value]) => !key.startsWith("_") && value !== null && value !== "");
  $("specsSection").hidden = specs.length === 0;
  $("productSpecs").innerHTML = specs.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(Array.isArray(value) ? value.join(", ") : value)}</dd></div>`).join("");
  const sourceUrl = trustedHttpUrl(product.specs?._source_url);
  const source = $("specsSource");
  source.hidden = !sourceUrl;
  source.href = sourceUrl || "#";
  $("specsVerified").textContent = product.specs?._verified_at ? `Данные проверены ${formatDate(`${product.specs._verified_at}T00:00:00`)}` : "";
  $("adminActions").hidden = !state.context.admin;
  $("addPhoto").disabled = product.images.length >= 3;
  $("addPhoto").textContent = `Добавить фотографию (${product.images.length}/3)`;
  await renderGallery();
  $("productView").hidden = false;
  $("pageStatus").hidden = true;
}

async function renderGallery() {
  const images = state.product.images;
  const selected = images.find((image) => image.id === state.selectedImageId) || state.product.primaryImage || images[0];
  state.selectedImageId = selected?.id || null;
  const main = $("mainImage");
  main.alt = state.product.name;
  const imageSource = $("imageSource");
  const sourceUrl = trustedHttpUrl(selected?.source_url);
  imageSource.hidden = !sourceUrl;
  imageSource.href = sourceUrl || "#";
  await setSignedImage(db, main, selected?.storage_path, state.product.category || "Товар");
  const gallery = $("gallery");
  if (!images.length) {
    gallery.innerHTML = '<span class="muted">Фотографий пока нет</span>';
    return;
  }
  gallery.innerHTML = images.map((image, index) => `<div class="gallery-item ${image.id === selected?.id ? "active" : ""}">
      <button class="gallery-select" type="button" data-image-id="${image.id}" aria-label="Фото ${index + 1}"><img src="${placeholderSvg("Фото")}" data-gallery-path="${escapeHtml(image.storage_path)}" alt="${escapeHtml(state.product.name)} — фото ${index + 1}"></button>
      ${state.context.admin ? `<span class="gallery-controls">
        <button type="button" data-image-action="left" data-image-id="${image.id}" title="Переместить влево">←</button>
        <button type="button" data-image-action="primary" data-image-id="${image.id}" title="Сделать главной">★</button>
        <button type="button" data-image-action="delete" data-image-id="${image.id}" title="Удалить">×</button>
        <button type="button" data-image-action="right" data-image-id="${image.id}" title="Переместить вправо">→</button>
      </span>` : ""}
    </div>`).join("");
  gallery.querySelectorAll("img[data-gallery-path]").forEach((image) => {
    setSignedImage(db, image, image.dataset.galleryPath, state.product.name);
  });
}

async function reload() {
  state.product = await getProduct(db, productId);
  if (!state.product) throw new Error("Товар не найден или скрыт.");
  await renderProduct();
}

function fillEditForm() {
  const form = $("productForm");
  for (const name of ["name", "brand", "category", "model", "sku", "color", "memory", "description"]) {
    form.elements[name].value = state.product[name] || "";
  }
  renderSpecsEditor(state.product.specs || {});
  form.elements.specSourceUrl.value = state.product.specs?._source_url || "";
  form.elements.specVerifiedAt.value = state.product.specs?._verified_at || "";
  form.elements.warehouse.value = state.product.stock.warehouse;
  form.elements.display.value = state.product.stock.display;
  form.elements.ldu.value = state.product.stock.ldu;
  state.dirty = false;
}

function closeDialog(dialog) {
  if (dialog === $("editDialog") && state.dirty && !confirm("Закрыть форму и потерять несохранённые изменения?")) return;
  dialog.close();
  state.dirty = false;
}

async function handleGalleryAction(button) {
  const image = state.product.images.find((item) => item.id === button.dataset.imageId);
  if (!image) return;
  const action = button.dataset.imageAction;
  if (action === "primary") {
    await setPrimaryImage(db, image);
    notify("Главная фотография обновлена.");
  } else if (action === "delete") {
    if (!confirm("Удалить эту фотографию из карточки и хранилища?")) return;
    await deleteProductImage(db, image);
    notify("Фотография удалена.");
  } else {
    const images = [...state.product.images];
    const index = images.findIndex((item) => item.id === image.id);
    const next = action === "left" ? index - 1 : index + 1;
    if (next < 0 || next >= images.length) return;
    [images[index], images[next]] = [images[next], images[index]];
    await reorderImages(db, productId, images);
  }
  await reload();
}

async function boot() {
  if (!db) throw new Error("Не удалось подключиться к Supabase.");
  state.context = await requireApprovedUser(db);
  if (!state.context) return;
  $("accountName").textContent = state.context.profile.display_name || state.context.profile.username || state.context.user.email;
  $("accountRole").textContent = state.context.admin ? "Администратор" : "Сотрудник";
  $("signOut").onclick = async () => { await db.signOut(); location.replace("index.html"); };
  await reload();

  $("editProduct").onclick = () => { fillEditForm(); $("editDialog").showModal(); };
  $("addPhoto").onclick = () => { $("imageForm").reset(); $("imagePreview").hidden = true; state.preparedImage = null; $("imageDialog").showModal(); };
  document.querySelectorAll("[data-close-dialog]").forEach((button) => button.onclick = () => closeDialog(button.closest("dialog")));
  $("productForm").addEventListener("input", () => { state.dirty = true; });
  $("addSpec").addEventListener("click", () => { appendSpecRow(); state.dirty = true; });
  $("specsEditor").addEventListener("click", (event) => {
    const remove = event.target.closest("[data-remove-spec]");
    if (!remove) return;
    remove.closest(".spec-row").remove();
    if (!$("specsEditor").children.length) appendSpecRow();
    state.dirty = true;
  });
  $("productForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.submitter;
    setBusy(button, true);
    try {
      syncSpecsField(event.currentTarget);
      await saveProduct(db, productId, readProductForm(event.currentTarget));
      state.dirty = false;
      $("editDialog").close();
      await reload();
      notify("Карточка и остатки сохранены.");
    } catch (error) {
      notify(errorMessage(error), true);
    } finally {
      setBusy(button, false);
    }
  });
  $("archiveProduct").onclick = async () => {
    if (!confirm("Скрыть товар из каталога? Данные, остатки и фотографии не удалятся.")) return;
    if (!confirm("Подтвердите скрытие карточки ещё раз.")) return;
    try {
      await archiveProduct(db, productId);
      location.replace("index.html");
    } catch (error) { notify(errorMessage(error), true); }
  };
  $("gallery").addEventListener("click", async (event) => {
    const action = event.target.closest("button[data-image-action]");
    if (action) {
      event.stopPropagation();
      try { await handleGalleryAction(action); } catch (error) { notify(errorMessage(error), true); }
      return;
    }
    const item = event.target.closest("button[data-image-id]");
    if (item) { state.selectedImageId = item.dataset.imageId; await renderGallery(); }
  });
  $("imageFile").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      state.preparedImage = await prepareImage(file);
      const preview = $("imagePreview");
      preview.hidden = false;
      preview.querySelector("img").src = URL.createObjectURL(state.preparedImage.blob);
      preview.querySelector("p").textContent = `${state.preparedImage.width} × ${state.preparedImage.height} · ${Math.round(state.preparedImage.blob.size / 1024)} КБ`;
    } catch (error) {
      event.target.value = "";
      notify(errorMessage(error), true);
    }
  });
  $("imageForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.preparedImage) return notify("Сначала выберите фотографию.", true);
    const button = event.submitter;
    setBusy(button, true, "Загружаю…");
    try {
      await uploadProductImage(db, productId, state.preparedImage, state.context.user.id, event.currentTarget.elements.isPrimary.checked);
      $("imageDialog").close();
      state.preparedImage = null;
      await reload();
      notify("Фотография добавлена.");
    } catch (error) {
      notify(errorMessage(error), true);
    } finally { setBusy(button, false); }
  });
  window.addEventListener("beforeunload", (event) => {
    if (!state.dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });
}

boot().catch((error) => {
  console.error(error);
  $("pageStatus").textContent = errorMessage(error);
  $("pageStatus").className = "message error";
});
