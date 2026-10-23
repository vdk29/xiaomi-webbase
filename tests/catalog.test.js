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
