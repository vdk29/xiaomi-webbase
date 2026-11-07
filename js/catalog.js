import {networkKey} from './network-identity.js?v=20261107-25';
import { $, debounce, escapeHtml, normalizeText, placeholderSvg, splitSkus } from "./utils.js?v=20261023-4";
import { observeCatalogImages } from "./images.js?v=20261107-25";

export const CATEGORY_ORDER = ["Смартфоны", "Планшеты", "Смарт-часы", "Наушники", "Фитнес-браслеты", "Телевизоры", "Пылесосы", "Бытовая техника для дома", "Умный дом", "Компьютерная техника", "Видеонаблюдение", "Аудио", "Аксессуары для пылесосов"];

function categoryRank(category) {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

export function compareCatalogProducts(a, b) {
  const available = row => Number(row.stock?.warehouse || 0) > 0;
  return Number(available(b)) - Number(available(a))
    || categoryRank(a.category) - categoryRank(b.category)
    || String(a.category || "").localeCompare(String(b.category || ""), "ru")
    || a.name.localeCompare(b.name, "ru");
}

export function orderedCategories(rows) {
  const present = new Set(rows.map((row) => row.category).filter(Boolean));
  const remaining = [...present]
    .filter((category) => !CATEGORY_ORDER.includes(category))
    .sort((a, b) => a.localeCompare(b, "ru"));
  return [...CATEGORY_ORDER, ...remaining];
}

export function initializeCatalog(db, state) {
  const controls = ["search", "category", "availability"];
  const renderDebounced = debounce(() => { state.catalogLimit=48; renderCatalog(db, state); }, 90);
  controls.forEach((id) => {
    const element = $(id);
    if (!element) return;
    element.addEventListener(id === "search" ? "input" : "change", renderDebounced);
  });
}

export function populateCategories(rows) {
  const select = $("category");
  const current = select.value;
  const categories = orderedCategories(rows);
  select.replaceChildren(new Option("Все категории", ""), ...categories.map((value) => new Option(value, value)));
  select.value = categories.includes(current) ? current : "";
}

export function matchesSkuSuffix(row, query) {
  const search = normalizeText(query);
  const skus = [...splitSkus(row.sku), ...(row.source_skus || [])];
  return /^\d{4}$/.test(search) && skus.some(sku => String(sku).replace(/\D/g, "").endsWith(search));
}

export function matchesProductSearch(row, query) {
  const search = normalizeText(query);
  if (!search) return true;
  const skus = [...splitSkus(row.sku), ...(row.source_skus || [])];
  if (matchesSkuSuffix(row, search)) return true;
  const text=[row.name,row.sku,...skus,row.model,row.memory,row.color,row.brand].join(" ");
  if(normalizeText(text).includes(search))return true;
  const canonical=networkKey(text);return networkKey(search).split(/\s+/).every(token=>canonical.includes(token));
}

function filterRows(rows) {
  const search = normalizeText($("search").value);
  const category = $("category").value;
  const availability = $("availability").value;
  const filtered = rows.filter((row) => {
    if (category && row.category !== category) return false;
    const total = row.stock.warehouse;
    if (availability === "available" && total <= 0) return false;
    if (availability === "without-photo" && row.images.length > 0) return false;
    return matchesProductSearch(row, search);
  });
  return filtered.sort((a, b) => Number(matchesSkuSuffix(b, search)) - Number(matchesSkuSuffix(a, search)) || compareCatalogProducts(a, b));
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
  const limit=state.catalogLimit||48;
  container.innerHTML = rows.slice(0,limit).map(row => renderProductCard(row)).join("")+(rows.length>limit?'<button class="button ghost catalog-more" type="button">Показать ещё</button>':'');
  const more=container.querySelector('.catalog-more');if(more)more.onclick=()=>{state.catalogLimit=limit+48;renderCatalog(db,state)};
  state.stopImageObserver = observeCatalogImages(db, container);
}

export function renderProductCard(row, extra = "", hrefSuffix = "") {
    const path = row.primaryImage?.storage_path || "";
    const detail = [row.color, row.memory].filter(Boolean).join(" · ");
    return `<a class="product-card" href="product.html?id=${encodeURIComponent(row.id)}${hrefSuffix}" aria-label="Открыть ${escapeHtml(row.name)}">
      <div class="product-card__media">
        <img loading="lazy" src="${placeholderSvg(row.category || "Товар")}" ${path ? `data-lazy-path="${escapeHtml(path)}"` : ""} alt="${escapeHtml(row.name)}">
        ${!path ? '<span class="no-photo">Нет фото</span>' : ""}
      </div>
      <div class="product-card__body">
        <span class="eyebrow">${escapeHtml(row.category || "Без категории")}</span>
        <h3>${escapeHtml(row.name)}</h3>
        <p class="product-meta">${escapeHtml(detail || `Артикул: ${row.sku || "—"}`)}</p>
        ${detail ? `<p class="product-sku">Артикул: ${escapeHtml(row.sku || "—")}</p>` : ""}
        ${row.network_origin?'<span class="network-origin">Есть в каталоге сети</span>':''}
        ${row.network_origin&&(!path||!row.spec_source)?'<small class="network-review-badge">Фото или характеристики требуют проверки</small>':''}
        ${saleStockMarkup(row.stock)}
        ${extra}
      </div>
    </a>`;

}

export function saleStockMarkup(stock) {
  const quantity = Number(stock?.warehouse || 0);
  return `<div class="sale-stock ${quantity > 0 ? 'sale-stock--available' : 'sale-stock--empty'}"><span class="sale-stock__label">Склад</span><strong>${quantity}<small> шт.</small></strong><span class="sale-stock__status"><i aria-hidden="true"></i>${quantity > 0 ? 'Могу продать' : 'Нет в наличии'}</span></div>`;
}
