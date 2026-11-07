import {networkKey} from './network-identity.js?v=20261107-25';
import { $, escapeHtml, normalizeText, parseQuantity, setBusy, splitSkus } from "./utils.js?v=20261023-4";

export function classifyProduct(name) {
  const value = normalizeText(name);
  if (/^(щетк|насадк|фильтр|мешк|моп|салфетк|запасн|аксессуар).*пылесос/.test(value)) return "Аксессуары для пылесосов";
  if (/^(умная камера|наружная видеокамера|умный дверной звонок|камера|видеокамера|ip-камера|видеорегистратор|видеодомофон|комплект видеонаблюдения)(?:\s|$)/.test(value)) return "Видеонаблюдение";
  if (/^(игровая компьютерная мышь|игровая мышь|компьютерная мышь|беспроводная мышь|усилитель wi-fi сигнала|планшет для рисования|ноутбук|монитор|мини-пк|компьютер|клавиатура|мышь|роутер|маршрутизатор|wi-fi роутер|wi-fi усилитель|усилитель wi-fi|принтер|фотопринтер|сканер|графический планшет)(?:\s|$)/.test(value)) return "Компьютерная техника";
  if (/^(колонка|портативная колонка|умные аудиоочки|bluetooth колонка|саундбар|акустическая система|микрофон)(?:\s|$)/.test(value)) return "Аудио";
  if (/^(настольная лампа|потолочная лампа|беспроводная светодиодная лампа|беспроводная кнопка|трекер для поиска вещей|smart-tv приставка|проектор|датчик|умная лампа|умная лампочка|умная розетка|умный выключатель|умный хаб|шлюз|умная колонка)(?:\s|$)/.test(value)) return "Умный дом";
  if (/^(индукционная плита|осушитель воздуха|термопот|умная кормушка|умная поилка|выпрямитель для волос|умный чайник|массажер|электрическая зубная щетка|умные весы|электрочайник|очиститель для воды|триммер|умный кухонный комбайн|электрический стеклянный чайник|холодильник|стиральная машина|сушильная машина|посудомоечная машина|микроволновая печь|мультиварка|рисоварка|блендер|кофемолка|электрогриль|плита|утюг|отпариватель|аэрогриль|увлажнитель|очиститель воздуха|освежитель|фен|электробритва|обогреватель|настольный обогреватель|умный вентилятор|вентилятор|умный диспенсер|диспенсер|чайник|кофемашина|тостер)\s/.test(value)) return "Бытовая техника для дома";
  if (/^(смартфон|мобильный телефон)\s/.test(value)) return "Смартфоны";
  if (/^планшет\s/.test(value)) return "Планшеты";
  if (/^(смарт-часы|умные часы|часы)\s/.test(value)) return "Смарт-часы";
  if (/^(фитнес-браслет|браслет)\s/.test(value)) return "Фитнес-браслеты";
  if (/^(наушники|гарнитура|беспроводные открытые наушники|беспроводные наушники)\s/.test(value)) return "Наушники";
  if (/^телевизор\s/.test(value)) return "Телевизоры";
  if (/^(ручной пылесос|моющий пылесос|вертикальный пылесос|пылесос|робот-пылесос)\s/.test(value)) return "Пылесосы";
  if (/^(sim|сим-карта|сим карта)\b/.test(value)) return "SIM-карты";
  return "Аксессуары и другое";
}

const cleanName = (value) => String(value ?? "")
  .replace(/^\s*\((?:ldu|лду)\)\s*/i, "")
  .replace(/,\s*шт\s*\.?\s*$/i, "")
  .replace(/\s+/g, " ")
  .trim();

const isDemo = (row) => /\(\s*(?:ldu|лду)\s*\)/i.test(`${row[0] ?? ""} ${row[3] ?? ""}`);
const isDefective = (row) => /\(\s*(?:пф|pf)\s*\)/i.test(`${row[0] ?? ""} ${row[3] ?? ""}`);

const columnLetter = (index) => {
  let result = "";
  for (let value = index + 1; value > 0; value = Math.floor((value - 1) / 26)) {
    result = String.fromCharCode(65 + (value - 1) % 26) + result;
  }
  return result;
};

export function detect1CColumns(header) {
  const found = { warehouse: [], display: [], defect: [], total: [] };
  const unknown = [];
  const token = (text, word) => new RegExp(`(?:^|[^а-яa-z0-9])(?:${word})(?:$|[^а-яa-z0-9])`, "u").test(text);
  header.forEach((value, index) => {
    if (index < 6) return; // A–F contain the merged article and product name fields.
    const title = normalizeText(value);
    if (!title) return;
    if (/^итог(?:о)?(?:\s|$)/u.test(title)) found.total.push(index);
    else if (title.includes("брак") || token(title, "пф|pf")) found.defect.push(index);
    else if (token(title, "ов")) found.display.push(index);
    else if (title.includes("склад")) found.warehouse.push(index);
    else unknown.push(index);
  });
  const labels = { warehouse: "основной склад", display: "ОВ (витрина)", defect: "брак / ПФ", total: "итого" };
  const invalid = Object.keys(found).filter(key => found[key].length !== 1);
  if (invalid.length || unknown.length) {
    const details = invalid.map(key => `«${labels[key]}»${found[key].length > 1 ? " — несколько столбцов" : " — не найден"}`);
    if (unknown.length) details.push(`неизвестные столбцы: ${unknown.map(index => columnLetter(index)).join(", ")}`);
    throw new Error(`Не удалось определить колонки остатков: ${details.join("; ")}. Импорт отменён.`);
  }
  return Object.fromEntries(Object.entries(found).map(([key, indices]) => [key, indices[0]]));
}

export function analyze1CRows(rows, existingProducts = []) {
  const header = rows.findIndex((row) => normalizeText(row[0]).includes("артикул")
    && normalizeText(row[3]).includes("номенклатура"));
  if (header < 0) throw new Error("Не найдены заголовки отчёта 1С (A: артикул, D: номенклатура).");
  const columns = detect1CColumns(rows[header]);

  const grouped = new Map();
  const errors = [];
  let excluded = 0;
  for (let index = header + 1; index < rows.length; index += 1) {
    const row = rows[index];
    const rawSku = String(row[0] ?? "").trim();
    const rawName = String(row[3] ?? "").trim();
    if (!rawName || !rawSku || normalizeText(rawSku) === "итого") continue;
    if (isDefective(row)) {
      excluded += 1;
      continue;
    }
    const name = cleanName(rawName);
    const sku = rawSku.replace(/\s*\(\s*(?:ldu|лду)\s*\)?\s*$/i, "").trim();
    const warehouse = parseQuantity(row[columns.warehouse]);
    const defect = parseQuantity(row[columns.defect]);
    const displayValue = parseQuantity(row[columns.display]);
    const total = parseQuantity(row[columns.total]);
    if ([warehouse, defect, displayValue, total].some((value) => value === null)) {
      errors.push(`Строка ${index + 1}: некорректное количество — ${name}`);
      continue;
    }
    if (warehouse + defect + displayValue !== total) {
      errors.push(`Строка ${index + 1}: ${columnLetter(columns.warehouse)} + ${columnLetter(columns.defect)} + ${columnLetter(columns.display)} не равно ${columnLetter(columns.total)} — ${name}`);
      continue;
    }
    const demo = isDemo(row);
    const key = normalizeText(name);
    if (!grouped.has(key)) {
      grouped.set(key, {
        source_key: key,
        name,
        category: classifyProduct(name),
        source_skus: new Set(),
        warehouse: 0,
        display: 0,
        ldu: 0,
      });
    }
    const item = grouped.get(key);
    item.source_skus.add(sku);
    item.warehouse += demo ? 0 : warehouse;
    item.display += demo ? warehouse + displayValue : displayValue;
    item.ldu += demo ? warehouse + displayValue : 0;
  }

  const bySku = new Map();
  for (const product of existingProducts) {
    const skus = new Set([...(product.source_skus || []), ...splitSkus(product.sku)]);
    skus.forEach((sku) => {
      const key = normalizeText(sku);
      if (!bySku.has(key)) bySku.set(key, []);
      bySku.get(key).push(product);
    });
  }
  const items = [...grouped.values()].map((item) => {
    const sourceSkus = [...item.source_skus];
    const matches = new Map();
    sourceSkus.forEach((sku) => (bySku.get(normalizeText(sku)) || []).forEach((product) => matches.set(product.id, product)));
    const externalMatch = existingProducts.find((product) => normalizeText(product.external_id) === item.source_key);
    if (externalMatch) matches.set(externalMatch.id, externalMatch);
    if (!matches.size) for (const product of existingProducts) {
      if (product.network_origin && product.active!==false && !product.is_demo && !product.sku && networkKey(product.name)===networkKey(item.name)) matches.set(product.id,product);
    }
    const status = matches.size > 1 ? "ambiguous" : matches.size === 1 ? "update" : "new";
    return {
      ...item,
      source_skus: sourceSkus,
      sku: sourceSkus.join(" / "),
      status,
      matchedProductId: matches.size === 1 ? [...matches.keys()][0] : null,
    };
  });
  const targets = new Map();
  const reportSkus = new Map();
  for (const item of items) {
    if (item.matchedProductId) {
      if (targets.has(item.matchedProductId)) errors.push(`Несколько строк отчёта совпали с одной карточкой: ${item.name}. Объедините или уточните названия.`);
      targets.set(item.matchedProductId, item);
    }
    for (const sku of item.source_skus) {
      const key = normalizeText(sku);
      if (reportSkus.has(key) && reportSkus.get(key) !== item) errors.push(`Артикул ${sku} повторяется у разных товаров. Импорт отменён.`);
      reportSkus.set(key, item);
    }
  }
  const zeroedProducts = existingProducts.filter(product => !targets.has(product.id)
    && ['warehouse', 'display', 'ldu'].some(key => Number(product.stock?.[key] || 0) > 0));
  return { items, errors, excluded, columns, zeroedProducts, ambiguous: items.filter((item) => item.status === "ambiguous") };
}

export function initializeImporter(db, state, { notify, reloadProducts }) {
  let fileReadVersion = 0;
  let applying = false;
  $("excel").addEventListener("change", async () => {
    const version = ++fileReadVersion;
    state.importPreview = null;
    const file = $("excel").files?.[0];
    if (!file) return $("importPreview").replaceChildren();
    try {
      if (state.catalogComplete === false) throw new Error('Дождитесь полной загрузки каталога перед импортом.');
      $("importPreview").textContent = 'Читаю Excel…';
      const module=await import('./unified-import.js?v=20261107-28');
      const parsed=await module.parseUnifiedFile(file);
      if (version !== fileReadVersion) return;
      if(parsed.type==='network') {
        const {data:warehouses,error}=await db.client.from('webbase_network_warehouses')
          .select('key,kind,company,reviewed,excluded,webbase_network_stores(is_local)');
        if(error)throw error;
        const local=module.localNetworkPreview(parsed.report,warehouses);
        if(version!==fileReadVersion)return;
        state.importPreview={type:'network',report:parsed.report,local};
      } else {
        if(state.catalogComplete===false)throw Error('Дождитесь полной загрузки каталога перед импортом.');
        state.importPreview={...analyze1CRows(parsed.rows,state.rows),filename:file.name,showAll:false};
      }
      renderImportPreview(state.importPreview);
    } catch (error) {
      if (version !== fileReadVersion) return;
      state.importPreview = null;
      $("importPreview").innerHTML = `<p class="message error">${escapeHtml(error.message)}</p>`;
    }
  });

  $("importPreview").addEventListener("click", async (event) => {
    const showAllButton = event.target.closest("button[data-import-show-all]");
    if (showAllButton && state.importPreview) {
      state.importPreview.showAll = true;
      renderImportPreview(state.importPreview);
      return;
    }
    const button = event.target.closest("button[data-import]");
    if (!button || !state.importPreview || applying) return;
    if (state.catalogComplete === false) return notify('Каталог загружен не полностью. Обновите его перед импортом.', true);
    const preview = state.importPreview;
    if(preview.type==='network') {
      if(!confirm('Обновить остатки всей сети и Европолиса из общего отчёта? Локальные остатки заменятся складом и ОВ Европолиса, без брака. Фото и ручные поля сохранятся.'))return;
      applying=true;$("excel").disabled=true;setBusy(button,true,'Обновляю сеть и Европолис…');
      try {
        const module=await import('./unified-import.js?v=20261107-28');
        const result=await module.applyUnifiedReport(db,preview.report,text=>button.textContent=text);
        const network=await import('./network-stock.js?v=20261107-26');network.clearNetworkCache();
        state.importPreview=null;$("excel").value='';$("importPreview").replaceChildren();
        await reloadProducts();
        notify(result.repeated?'Этот отчёт уже применён к сети и Европолису. Дубликаты не созданы.':`Обновлены сеть и Европолис. Могу продать: ${result.local.warehouse}, на ОВ: ${result.local.display}. Брак в локальные остатки не включён.`);
      } catch(error) {notify(error.message,true);}
      finally {applying=false;$("excel").disabled=!state.catalogComplete;setBusy(button,false);}
      return;
    }
    if (!preview.items.length || preview.errors.length || preview.ambiguous.length) return notify('Исправьте ошибки отчёта перед импортом.', true);
    if (!confirm(`Синхронизировать остатки с полным отчётом (${preview.items.length} товаров)? Товары, которых нет в файле, получат нулевой остаток. Фото и ручные поля сохранятся.`)) return;
    applying = true;
    $("excel").disabled = true;
    setBusy(button, true, "Импортирую…");
    try {
      const { data, error } = await db.client.rpc("webbase_apply_import", {
        p_filename: state.importPreview.filename,
        p_items: state.importPreview.items.map(({ status, matchedProductId, ...item }) => item),
      });
      if (error) throw error;
      notify(`Импорт завершён: обновлено ${data.updated}, создано ${data.created}, обнулено ${data.zeroed || 0}.`);
      state.importPreview = null;
      $("excel").value = "";
      $("importPreview").replaceChildren();
      await reloadProducts();
    } catch (error) {
      notify(error.message, true);
    } finally {
      applying = false;
      $("excel").disabled = !state.catalogComplete;
      setBusy(button, false);
    }
  });
}

function renderImportPreview(preview) {
  if(preview.type==='network') {
    const {report,local}=preview;
    $("importPreview").innerHTML=`<h3>Общий отчёт: сеть и Европолис</h3><p class="muted">Отчёт от ${escapeHtml(report.report_date)} · ${report.items.length} позиций · ${report.columns.length} учётных складов.</p>
      <div class="import-summary"><span><strong>${local.warehouse}</strong> могу продать</span><span><strong>${local.display}</strong> на ОВ</span><span><strong>${local.warehouse+local.display}</strong> всего в Европолисе</span></div>
      <p class="muted">Европолис: ${local.columns.map(escapeHtml).join('; ')}. LDU на витрине: ${local.ldu}. Брак в локальные остатки не включается.</p>
      <p>Остатки всей сети обновятся с прежним разделением на склад, ОВ и брак.</p>
      <p class="message warning"><strong>Полная синхронизация.</strong> Локальные остатки из отчёта заменят прежние, а не прибавятся к ним. Товары Европолиса, отсутствующие в этом файле, получат ноль. Фотографии, описания и ручные поля сохранятся.</p>
      <button class="button primary" data-import>Обновить сеть и Европолис</button>`;
    return;
  }
  const updates = preview.items.filter((item) => item.status === "update").length;
  const created = preview.items.filter((item) => item.status === "new").length;
  const blocked = preview.errors.length > 0 || preview.ambiguous.length > 0 || preview.items.length === 0;
  const visibleItems = preview.showAll ? preview.items : preview.items.slice(0, 100);
  const hiddenItems = preview.items.length - visibleItems.length;
  $("importPreview").innerHTML = `
    <div class="import-summary">
      <span><strong>${preview.items.length}</strong> карточек</span>
      <span><strong>${updates}</strong> обновятся</span>
      <span><strong>${created}</strong> новых</span>
      <span><strong>${preview.excluded}</strong> ПФ исключено</span>
      <span><strong>${preview.zeroedProducts.length}</strong> с остатками отсутствуют в файле</span>
    </div>
    <p class="muted">Распознано: склад — ${columnLetter(preview.columns.warehouse)}, ОВ — ${columnLetter(preview.columns.display)}, брак / ПФ — ${columnLetter(preview.columns.defect)}, итог — ${columnLetter(preview.columns.total)}.</p>
    ${preview.errors.length ? `<div class="message error"><strong>Ошибки в Excel:</strong><br>${preview.errors.slice(0, 12).map(escapeHtml).join("<br>")}</div>` : ""}
    ${preview.ambiguous.length ? `<div class="message warning"><strong>Нужна ручная проверка:</strong> несколько карточек совпали по артикулам: ${preview.ambiguous.slice(0, 8).map((item) => escapeHtml(item.name)).join(", ")}.</div>` : ""}
    <div class="table-wrap"><table><thead><tr><th>Действие</th><th>Артикул</th><th>Товар</th><th>Склад</th><th>ОВ</th><th>LDU</th></tr></thead><tbody>
      ${visibleItems.map((item) => `<tr><td><span class="status ${item.status === "new" ? "status--new" : item.status === "update" ? "status--ok" : "status--blocked"}">${item.status === "new" ? "Новый" : item.status === "update" ? "Обновление" : "Проверить"}</span></td><td>${escapeHtml(item.sku)}</td><td>${escapeHtml(item.name)}</td><td>${item.warehouse}</td><td>${item.display}</td><td>${item.ldu}</td></tr>`).join("")}
    </tbody></table></div>
    ${hiddenItems > 0 ? `<p class="muted">Показаны первые ${visibleItems.length} из ${preview.items.length} товаров.</p><button class="button secondary" type="button" data-import-show-all>Показать все ${preview.items.length}</button>` : ""}
    <p class="message warning"><strong>Полная синхронизация остатков.</strong> Загружайте полный отчёт магазина: у товаров, отсутствующих в этом файле, остатки станут нулевыми. Количества из файла заменят прежние, а не прибавятся к ним.</p>
    <p class="muted">Импорт меняет источник номенклатуры и остатки. Описание, характеристики, выбранная вручную категория и фотографии не перезаписываются.</p>
    <button class="button primary" data-import ${blocked ? "disabled" : ""}>Применить импорт</button>`;
}
