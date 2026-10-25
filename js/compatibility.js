import { $, debounce, escapeHtml, normalizeText } from './utils.js?v=20261023-4';
import { COMPATIBILITY_BY_SKU } from './compatibility-data.js?v=20261024-7';
import { renderProductCard, matchesProductSearch } from './catalog.js?v=20261025-14';
import { observeCatalogImages } from './images.js?v=20261025-14';

export function accessoryKind(product) {
  const name = normalizeText(product.name);
  if (product.category === 'Аксессуары для пылесосов'
    || (/^(щ[её]тк|фильтр|салфет|тряп|моп|меш[ое]к|пылесборник|насадк|комплект|крышка)/.test(name)
      && /пылесос|vacuum|roborock|dreame/.test(name))) return 'vacuum';
  if (/^ремеш(?:ок|ки|ка)\s/.test(name)) return 'strap';
  if (/^(чехол|стекло защитное|защитный материал|зарядное устройство|дата-кабель|кабель |сзу |азу |адаптер-переходник|беспроводная зарядная|карта памяти|фотобумага|фильтр |насадка )/.test(name)) return 'other';
  return null;
}

function titleModels(product, kind) {
  const name = product.name || '';
  if (kind === 'vacuum') {
    const numbered = [...name.matchAll(/\b(?:Robot\s+)?Vacuum\s+(\d+(?:\s*(?:Pro|Max))?)(?![A-Za-z0-9])/gi)];
    const lettered = [...name.matchAll(/\b([SXE]\d+C?(?:\s*(?:\+|Pro|Max))?)(?![A-Za-z0-9])/gi)];
    return [...lettered, ...numbered].map(match => `Xiaomi Robot Vacuum ${match[1].replace(/\s*\+/, '+')}`);
  }
  if (kind === 'strap') {
    const group = name.match(/(?:Mi|Smart) Band\s+(\d+(?:\/\d+)*)(?:\s+(Pro|Active))?/i);
    if (group) return group[1].split('/').map(n => `Xiaomi Smart Band ${n}${group[2] ? ` ${group[2]}` : ''}`);
  }
  if (/^(Чехол|Стекло)/i.test(name)) {
    const model = name.split(/\sдля\s/i)[1]?.split(/\s(?:Full|SHOCK|Silicone|cиликон|силикон|Clear|Ice|Book|Eco|Carbon|Froasted|Air Cushion|2\.5D|гибридное|черн|прозрач|лаванда|синий|зелен|\()/i)[0];
    return model ? model.split('/').map(model => model.trim()).filter(Boolean) : [];
  }
  return [];
}

export function getCompatibility(product) {
  const kind = accessoryKind(product);
  if (!kind) return null;
  const saved = product.specs?._compatibility;
  const reviewed = saved && saved.sku === product.sku && normalizeText(saved.name) === normalizeText(product.name)
    ? saved : COMPATIBILITY_BY_SKU[product.sku];
  if (reviewed && normalizeText(reviewed.name) === normalizeText(product.name)) return reviewed;
  const width = kind === 'strap' ? product.name.match(/(20|22)\s*(?:mm|мм)/i)?.[1] : null;
  return { kind, declared_models: titleModels(product, kind), verified_models: [], conditional_models: [], sources: [],
    fit: width ? `Стандартное прямое крепление ${width} мм — необходимо сверить коннектор` : '',
    note: 'Назначение указано по наименованию товара. Совместимость с другими моделями пока не проверена.' };
}

function cleanSearch(value) {
  return normalizeText(value).replace(/ё/g, 'е').replace(/([sxe]\d+)\s*plus\b/g, '$1+').replace(/\s*\+\s*/g, '+')
    .replace(/(\d+)\s*mm\b/g, '$1 мм')
    .replace(/(?:xiaomi\s+)?(?:smart|mi)\s+band/g, 'band').replace(/\s+/g, ' ').trim();
}

function queryModel(query) {
  const numbered = query.match(/\b(?:robot\s+)?vacuum\s+(\d+)(?:\s*(pro|max))?(?![a-z0-9])/);
  if (numbered) return { key: `vacuum${numbered[1]}${numbered[2] || ''}`, rest: query.replace(numbered[0], '').replace(/\bxiaomi\b/g, '').trim(), type: 'vacuum' };
  const vacuum = query.match(/\b([sxe]\d+c?)(?:\s*(\+|pro|max))?(?![a-z0-9+])/i);
  if (vacuum) return { key: `${vacuum[1]}${vacuum[2] || ''}`.replace(/\s/g, ''), rest: query.replace(vacuum[0], '').replace(/\b(xiaomi|mi|robot|vacuum)\b/g, '').trim(), type: 'vacuum' };
  const band = query.match(/\bband\s*(\d+)(?:\s*(pro|active))?\b/);
  if (band) return { key: `band${band[1]}${band[2] || ''}`, rest: query.replace(band[0], '').trim(), type: 'band' };
  const watch = query.match(/\b(gts|gtr)\s*(\d+|mini)(?:\s*(mini|pro))?\b/);
  if (watch) return { key: `${watch[1]}${watch[2]}${watch[3] || ''}`, rest: query.replace(watch[0], '').replace(/\bamazfit\b/g, '').trim(), type: 'watch' };
  return null;
}

export function compatibilityMatch(product, query) {
  const data = getCompatibility(product);
  if (!data) return null;
  const q = cleanSearch(query);
  if (!q) return 'listed';
  const model = queryModel(q);
  const direct = [...(data.declared_models || []), ...(data.verified_models || [])];
  const candidate = models => models.some(value => {
    const normalized = cleanSearch(value);
    return model ? queryModel(normalized)?.key === model.key : normalized.includes(q);
  });
  if (model) {
    if (model.rest && !cleanSearch(product.name).includes(model.rest)) return null;
    if (candidate(direct)) return 'direct';
    return candidate(data.conditional_models || []) ? 'conditional' : null;
  }
  if (matchesProductSearch(product, query) || candidate(direct) || cleanSearch(data.fit || '').includes(q)) return 'direct';
  return candidate(data.conditional_models || []) ? 'conditional' : null;
}

const modelList = models => `<ul class="compatibility-models">${models.map(model => `<li>${escapeHtml(model)}</li>`).join('')}</ul>`;
export function compatibilityDetailsMarkup(product) {
  const data = getCompatibility(product);
  if (!data) return '';
  const direct = [...new Set([...(data.declared_models || []), ...(data.verified_models || [])])];
  const sources = (data.sources || []).filter(source => {
    try { return ['https:', 'http:'].includes(new URL(source.url).protocol); } catch { return false; }
  });
  return `${direct.length ? `<h3>${data.verified_models?.length ? 'Совместимость семейства подтверждена' : 'Указано в номенклатуре'}</h3>${modelList(direct)}` : ''}
    ${data.fit ? `<p><strong>${escapeHtml(data.fit)}</strong></p>` : ''}
    ${data.conditional_models?.length ? `<div class="compatibility-condition"><h3>Другие модели — при совпадении крепления или кода детали</h3><p>${escapeHtml(data.condition || '')}</p>${data.part_code ? `<p>Код детали Xiaomi: <strong>${escapeHtml(data.part_code)}</strong></p>` : ''}${modelList(data.conditional_models)}</div>` : ''}
    ${data.note ? `<p class="muted">${escapeHtml(data.note)}</p>` : ''}
    ${sources.length ? `<div class="compatibility-sources"><h3>Источники</h3>${sources.map(source => `<a class="source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title)} ↗</a>`).join('')}${data.checked_at ? `<p class="muted">Проверено ${escapeHtml(data.checked_at)}</p>` : ''}</div>` : ''}`;
}

export function renderCompatibility(db, state) {
  state.stopCompatibilityObserver?.();
  const query = $('compatibilitySearch').value;
  const kind = $('compatibilityKind').value;
  const accessories = state.rows.filter(row => accessoryKind(row));
  const matches = accessories.map(row => ({ row, match: compatibilityMatch(row, query) }))
    .filter(({ row, match }) => match && (!kind || accessoryKind(row) === kind))
    .sort((a, b) => ({ vacuum: 0, strap: 1, other: 2 }[accessoryKind(a.row)] - { vacuum: 0, strap: 1, other: 2 }[accessoryKind(b.row)]) || a.row.name.localeCompare(b.row.name, 'ru'));
  $('compatibilityCount').textContent = `${matches.length} из ${accessories.length}`;
  const container = $('compatibilityCatalog');
  container.innerHTML = matches.length ? matches.map(({ row, match }) => {
    const data = getCompatibility(row);
    const summary = data.declared_models?.join(', ') || data.fit || 'Откройте карточку для проверки совместимости';
    const extra = `<div class="compatibility-summary"><strong>${match === 'conditional' ? 'Нужно сверить маркировку / крепление' : 'Назначение'}</strong><p>${escapeHtml(match === 'conditional' ? data.condition : summary)}</p>${data.conditional_models?.length ? '<span class="muted">Есть дополнительные модели с условием — в карточке</span>' : ''}</div>`;
    return renderProductCard(row, extra, '&from=compatibility');
  }).join('') : '<div class="empty-state"><h3>Подходящие аксессуары не найдены</h3><p>Проверьте название модели или измените тип аксессуара.</p></div>';
  state.stopCompatibilityObserver = observeCatalogImages(db, container);
}

export function initializeCompatibility(db, state) {
  const render = debounce(() => renderCompatibility(db, state), 90);
  $('compatibilitySearch').addEventListener('input', render);
  $('compatibilityKind').addEventListener('change', render);
}
