import test from "node:test";
import assert from "node:assert/strict";
import { compareCatalogProducts, orderedCategories } from "../js/catalog.js";

test("catalog starts with smartphones and follows the fixed category order", () => {
  const products = [
    { name: "Чехол", category: "Аксессуары и другое" },
    { name: "Наушники", category: "Наушники" },
    { name: "Часы", category: "Смарт-часы" },
    { name: "Планшет", category: "Планшеты" },
    { name: "Телефон Б", category: "Смартфоны" },
    { name: "Телефон А", category: "Смартфоны" },
  ].sort(compareCatalogProducts);

  assert.deepEqual(products.map((item) => item.name), ["Телефон А", "Телефон Б", "Планшет", "Часы", "Наушники", "Чехол"]);
});

test("category filter uses the same priority order", () => {
  const categories = orderedCategories([
    { category: "Пылесосы" },
    { category: "Аксессуары и другое" },
    { category: "Смартфоны" },
  ]);
  assert.deepEqual(categories.slice(0, 6), ["Смартфоны", "Планшеты", "Смарт-часы", "Наушники", "Фитнес-браслеты", "Телевизоры"]);
  assert.deepEqual(categories.slice(6), ["Аксессуары и другое", "Пылесосы"]);
});

test("search supports last four digits of every source SKU and keeps text search", async () => {
  const { matchesProductSearch } = await import("../js/catalog.js");
  const row = { name: "Смартфон Xiaomi", sku: "MAIN", source_skus: ["6941812777756", "ALT-98-76-X"] };
  assert.equal(matchesProductSearch(row, "7756"), true);
  assert.equal(matchesProductSearch(row, "9876"), true);
  assert.equal(matchesProductSearch(row, "xiaomi"), true);
  assert.equal(matchesProductSearch(row, "0000"), false);
  assert.equal(matchesProductSearch(row, ""), true);
});


test("four-digit suffix distinguishes a full-SKU ending from a middle substring", async () => {
  const { matchesSkuSuffix } = await import("../js/catalog.js");
  assert.equal(matchesSkuSuffix({sku:"6941812777756"}, "7756"), true);
  assert.equal(matchesSkuSuffix({sku:"6934177756016"}, "7756"), false);
});
