import { $, escapeHtml, errorMessage, formatDate, placeholderSvg, setBusy } from "./js/utils.js";
import { requireApprovedUser } from "./js/auth.js";
import { archiveProduct, getProduct, readProductForm, saveProduct } from "./js/products.js";
import {
  deleteProductImage, prepareImage, reorderImages, setPrimaryImage, setSignedImage, uploadProductImage,
} from "./js/images.js";

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
  const specs = Object.entries(product.specs || {}).filter(([, value]) => value !== null && value !== "");
  $("specsSection").hidden = specs.length === 0;
  $("productSpecs").innerHTML = specs.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(Array.isArray(value) ? value.join(", ") : value)}</dd></div>`).join("");
  $("adminActions").hidden = !state.context.admin;
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
  form.elements.specs.value = Object.keys(state.product.specs || {}).length ? JSON.stringify(state.product.specs, null, 2) : "";
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
  $("productForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.submitter;
    setBusy(button, true);
    try {
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
