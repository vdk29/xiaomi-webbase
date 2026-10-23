import { $, debounce, escapeHtml, normalizeText, placeholderSvg } from "./utils.js?v=20261023-4";
import { observeCatalogImages } from "./images.js?v=20261023-4";

export function initializeCatalog(db, state) {
  const controls = ["search", "category", "availability", "sort"];
  const renderDebounced = debounce(() => renderCatalog(db, state), 90);
  controls.forEach((id) => {
    const element = $(id);
    if (!element) return;
    element.addEventListener(id === "search" ? "input" : "change", renderDebounced);
  });
}

export function populateCategories(rows) {
  const select = $("category");
  const current = select.value;
  const priorityCategories = ["Смартфоны", "Планшеты", "Смарт-часы", "Наушники", "Фитнес-браслеты", "Телевизоры"];
  const categories = [...new Set([...priorityCategories, ...rows.map((row) => row.category).filter(Boolean)])]
    .sort((a, b) => a.localeCompare(b, "ru"));
  select.replaceChildren(new Option("Все категории", ""), ...categories.map((value) => new Option(value, value)));
  select.value = categories.includes(current) ? current : "";
}

function filterRows(rows) {
  const search = normalizeText($("search").value);
  const category = $("category").value;
  const availability = $("availability").value;
  const sort = $("sort").value;
  const filtered = rows.filter((row) => {
    if (category && row.category !== category) return false;
    const total = row.stock.warehouse + row.stock.display;
    if (availability === "available" && total <= 0) return false;
    if (availability === "display" && row.stock.display <= 0) return false;
    if (availability === "without-photo" && row.images.length > 0) return false;
    return !search || normalizeText([
      row.name, row.sku, row.model, row.memory, row.color, row.brand,
    ].join(" ")).includes(search);
  });
  return filtered.sort((a, b) => {
    if (sort === "stock-desc") {
      return (b.stock.warehouse + b.stock.display) - (a.stock.warehouse + a.stock.display)
        || a.name.localeCompare(b.name, "ru");
    }
    if (sort === "stock-asc") {
      return (a.stock.warehouse + a.stock.display) - (b.stock.warehouse + b.stock.display)
        || a.name.localeCompare(b.name, "ru");
    }
    if (sort === "name-desc") return b.name.localeCompare(a.name, "ru");
    return a.name.localeCompare(b.name, "ru");
  });
}

export function renderCatalog(db, state) {
  state.stopImageObserver?.();
  const rows = filterRows(state.rows);
  $("count").textContent = `${rows.length} из ${state.rows.length}`;
  const container = $("catalog");
  if (!rows.length) {
    container.innerHTML = `<div class="empty-state"><span class="empty-icon">mi</span><h3>Товары не найдены</h3><p>Измените запрос или фильтры.</p></div>`;
    return;
  }
  container.innerHTML = rows.map((row) => {
    const total = row.stock.warehouse + row.stock.display;
    const path = row.primaryImage?.storage_path || "";
    const detail = [row.color, row.memory].filter(Boolean).join(" · ");
    return `<a class="product-card" href="product.html?id=${encodeURIComponent(row.id)}" aria-label="Открыть ${escapeHtml(row.name)}">
      <div class="product-card__media">
        <img loading="lazy" src="${placeholderSvg(row.category || "Товар")}" ${path ? `data-lazy-path="${escapeHtml(path)}"` : ""} alt="${escapeHtml(row.name)}">
        ${!path ? '<span class="no-photo">Нет фото</span>' : ""}
      </div>
      <div class="product-card__body">
        <span class="eyebrow">${escapeHtml(row.category || "Без категории")}</span>
        <h3>${escapeHtml(row.name)}</h3>
        <p class="product-meta">${escapeHtml(detail || `Артикул: ${row.sku || "—"}`)}</p>
        ${detail ? `<p class="product-sku">Артикул: ${escapeHtml(row.sku || "—")}</p>` : ""}
        <div class="stock-grid compact">
          <div><strong>${row.stock.warehouse}</strong><span>Склад</span></div>
          <div><strong>${row.stock.display}</strong><span>ОВ</span></div>
          <div class="stock-total"><strong>${total}</strong><span>Всего</span></div>
        </div>
      </div>
    </a>`;
  }).join("");
  state.stopImageObserver = observeCatalogImages(db, container);
}
