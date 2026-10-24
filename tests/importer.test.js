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
    ["Камера Xiaomi Outdoor Camera BW300", "Умный дом"],
    ["Ремешок для часов Xiaomi", "Аксессуары и другое"],
  ];
  for (const [name, category] of cases) assert.equal(classifyProduct(name), category, name);
});
