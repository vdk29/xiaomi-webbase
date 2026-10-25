import test from "node:test";
import assert from "node:assert/strict";
import { analyze1CRows, classifyProduct } from "../js/importer.js";
import { normalizeText, parseQuantity, splitSkus } from "../js/utils.js";

const header = ["Артикул", "", "", "Номенклатура", "", "", "Склад", "ПФ", "ОВ", "Итого"];

test("quantities reject negatives and fractions", () => {
  assert.equal(parseQuantity(" 4 "), 4);
  assert.equal(parseQuantity("4,0"), 4);
  assert.equal(parseQuantity("-1"), null);
  assert.equal(parseQuantity("1.5"), null);
});

test("normalization is case-insensitive for Russian logins and search", () => {
  assert.equal(normalizeText("  Ёлка TEST  "), "елка test");
  assert.deepEqual(splitSkus("A-1 / B-2; C-3"), ["A-1", "B-2", "C-3"]);
});

test("televisions receive their own category", () => {
  assert.equal(classifyProduct("Телевизор Xiaomi TV A Pro 55 2026"), "Телевизоры");
});

test("1C import groups LDU and matches an existing product by SKU", () => {
  const rows = [
    header,
    ["SKU-1", "", "", "Смартфон Xiaomi 17T Pro", "", "", 4, 0, 2, 6],
    ["SKU-LDU (LDU)", "", "", "(LDU) Смартфон Xiaomi 17T Pro", "", "", 1, 0, 0, 1],
  ];
  const existing = [{ id: "existing", external_id: "old-name", sku: "SKU-1", source_skus: ["SKU-1"] }];
  const result = analyze1CRows(rows, existing);
  assert.equal(result.errors.length, 0);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].status, "update");
  assert.equal(result.items[0].warehouse, 4);
  assert.equal(result.items[0].display, 3);
  assert.equal(result.items[0].ldu, 1);
});

test("1C import blocks invalid totals and ambiguous SKU matches", () => {
  const invalid = analyze1CRows([header, ["SKU", "", "", "Планшет Xiaomi", "", "", 2, 0, 1, 9]], []);
  assert.equal(invalid.errors.length, 1);
  const rows = [header, ["SKU", "", "", "Планшет Xiaomi", "", "", 2, 0, 1, 3]];
  const existing = [
    { id: "one", external_id: "one", sku: "SKU", source_skus: ["SKU"] },
    { id: "two", external_id: "two", sku: "OTHER", source_skus: ["SKU"] },
  ];
  const ambiguous = analyze1CRows(rows, existing);
  assert.equal(ambiguous.ambiguous.length, 1);
});

test("home and smart-home categories stay separate from vacuum accessories", () => {
  const cases = [
    ["Щётка основная для робот-пылесоса Xiaomi S20", "Аксессуары для пылесосов"],
    ["Фильтр для пылесоса Xiaomi", "Аксессуары для пылесосов"],
    ["Робот-пылесос Xiaomi E5 Black", "Пылесосы"],
    ["Аэрогриль Xiaomi Smart Air Fryer 6,5L White", "Бытовая техника для дома"],
    ["Увлажнитель Xiaomi", "Бытовая техника для дома"],
    ["Очиститель воздуха Xiaomi", "Бытовая техника для дома"],
    ["Фен Mi Ionic Hair Dryer H300", "Бытовая техника для дома"],
    ["Датчик Mi Temperature and Humidity Monitor Pro", "Умный дом"],
    ["Умная лампочка Xiaomi", "Умный дом"],
    ["Камера Xiaomi Outdoor Camera BW300", "Видеонаблюдение"],
    ["Ремешок для часов Xiaomi", "Аксессуары и другое"],
  ];
  for (const [name, category] of cases) assert.equal(classifyProduct(name), category, name);
});

test("1C recognizes OV before defect stock in a two-row header", () => {
  const swapped = ["Номенклатура.Артикул", "", "", "Номенклатура, Ед. изм.", "", "", "Склад магазина", "Склад магазина ОВ", "Склад магазина Брак", "Итого"];
  const result = analyze1CRows([
    ["Остатки на складах"], [], swapped,
    ["", "", "", "", "", "", "Количество", "Количество", "Количество", "Количество"],
    ["SKU-1", "", "", "Смартфон тестовый, шт", "", "", 4, 2, 3, 9],
    ["SKU-LDU (LDU)", "", "", "(LDU) Смартфон тестовый, шт", "", "", 0, 1, 2, 3],
  ]);
  assert.equal(result.errors.length, 0);
  assert.deepEqual(result.columns, { warehouse: 6, display: 7, defect: 8, total: 9 });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].warehouse, 4);
  assert.equal(result.items[0].display, 3, "defective units must not become display stock");
  assert.equal(result.items[0].ldu, 1, "defective LDU units must not become available");
});

test("warehouse names containing ов inside a word are not display stock", () => {
  const row = [...header]; row[6] = "Склад Новый Город";
  const result = analyze1CRows([row, ["SKU", "", "", "Товар", "", "", 5, 1, 2, 8]]);
  assert.equal(result.errors.length, 0);
  assert.equal(result.items[0].warehouse, 5);
  assert.equal(result.items[0].display, 2);
});

test("changed column order still validates the total", () => {
  const row = [...header]; [row[7], row[8]] = [row[8], row[7]];
  const result = analyze1CRows([row, ["SKU", "", "", "Товар", "", "", 4, 2, 3, 8]]);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /не равно J/);
});

test("missing, duplicate and additional stock headers block import", () => {
  const missing = [...header]; missing[8] = "";
  assert.throws(() => analyze1CRows([missing]), /ОВ.*не найден/);
  const duplicate = [...header, "Другой склад"];
  assert.throws(() => analyze1CRows([duplicate]), /основной склад.*несколько/);
  const unknown = [...header, "Резерв"];
  assert.throws(() => analyze1CRows([unknown]), /неизвестные столбцы: K/);
});

test('import recognizes computing, surveillance and new household devices', () => {
  const cases = [
    ['Ноутбук Xiaomi RedmiBook', 'Компьютерная техника'],
    ['Монитор Xiaomi A27i', 'Компьютерная техника'],
    ['Wi-Fi роутер Xiaomi AX3000', 'Компьютерная техника'],
    ['Камера Xiaomi C500', 'Видеонаблюдение'],
    ['Видеорегистратор 70mai', 'Видеонаблюдение'],
    ['Холодильник Mijia 502L', 'Бытовая техника для дома'],
    ['Стиральная машина Xiaomi', 'Бытовая техника для дома'],
    ['Моющий пылесос Xiaomi W30 Pro', 'Пылесосы'],
    ['Портативная колонка Xiaomi Sound', 'Аудио'],
    ['Умная лампочка Xiaomi', 'Умный дом'],
  ];
  for (const [name, expected] of cases) assert.equal(classifyProduct(name), expected, name);
});
