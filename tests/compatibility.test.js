import test from 'node:test';
import assert from 'node:assert/strict';
import { accessoryKind, getCompatibility, compatibilityMatch, compatibilityDetailsMarkup } from '../js/compatibility.js';
import { COMPATIBILITY_BY_SKU } from '../js/compatibility-data.js';
const brush = sku => ({ ...COMPATIBILITY_BY_SKU[sku], category: 'Аксессуары для пылесосов' });

test('automatic selection includes newly imported consumables and straps but not devices', () => {
  for (const name of ['Щетка для пылесоса Dreame L10', 'Фильтр для робот-пылесоса Xiaomi S20', 'Салфетка для пылесоса S20+', 'Мешок для пылесоса X20+', 'Насадка для пылесоса P30']) {
    assert.equal(accessoryKind({ name }), 'vacuum', name);
  }
  assert.equal(accessoryKind({ name: 'Ремешок новый для часов 20 mm' }), 'strap');
  assert.equal(accessoryKind({ name: 'Чехол для Xiaomi 17T' }), 'other');
  assert.equal(accessoryKind({ name: 'Робот-пылесос Xiaomi S20+' }), null);
  assert.equal(accessoryKind({ name: 'Смарт-часы Xiaomi Watch 5' }), null);
  assert.equal(accessoryKind({ name: 'SIM в book НСК СФ' }), null);
});

test('S20 and S20+ and X20/Pro/Max are distinct, including model aliases', () => {
  const plain = brush('4640171485785'), plus = brush('4640171485822');
  assert.equal(compatibilityMatch(plain, 'S20'), 'direct');
  assert.equal(compatibilityMatch(plus, 'S20'), null);
  assert.equal(compatibilityMatch(plain, 'S20+'), null);
  assert.equal(compatibilityMatch(plus, 'S20+'), 'direct');
  assert.equal(compatibilityMatch(plus, 'S20 plus'), 'direct');
  assert.equal(compatibilityMatch(plus, 'X20', true), null);
  assert.equal(compatibilityMatch(plus, 'X20 Pro', true), 'conditional');
  assert.equal(compatibilityMatch(plus, 'X20 Max', true), 'conditional');
  assert.equal(compatibilityMatch(plain, 'основная S20'), 'direct');
});

test('extended models require explicit inclusion and remain conditional by part code', () => {
  const main = brush('4640171485785');
  assert.equal(compatibilityMatch(main, 'E10'), null);
  assert.equal(compatibilityMatch(main, 'E10', true), 'conditional');
  assert.equal(compatibilityMatch(main, 'S10', true), null);
  assert.equal(compatibilityMatch(brush('4640171485792'), 'S10', true), 'conditional');
  assert.equal(compatibilityMatch(brush('4640171485822'), 'X10', true), null);
  assert.equal(compatibilityMatch(brush('4640171485839'), 'X10', true), 'conditional');
  assert.match(compatibilityDetailsMarkup(main), /B112-ZS/);
  assert.match(compatibilityDetailsMarkup(main), /Соответствие складского артикула/);
});

test('unknown imported SKUs get only declared models and never inherit another brush family', () => {
  const unknown = { sku: 'NEW-SKU', name: 'Щетка основная для пылесоса Xiaomi S20+' };
  assert.deepEqual(getCompatibility(unknown).conditional_models, []);
  assert.equal(compatibilityMatch(unknown, 'S20+'), 'direct');
  assert.equal(compatibilityMatch(unknown, 'S20'), null);
  assert.equal(compatibilityMatch(unknown, 'X20+', true), null);
  const reused = { sku: '4640171485785', name: 'Щетка для пылесоса E5' };
  assert.deepEqual(getCompatibility(reused).conditional_models, []);
});

test('band Pro/Active versions and strap width do not become unconditional matches', () => {
  const band = { ...COMPATIBILITY_BY_SKU['4640171463554'] };
  assert.equal(compatibilityMatch(band, 'Mi Band 9'), 'direct');
  assert.equal(compatibilityMatch(band, 'Smart Band 9 Pro', true), null);
  assert.equal(compatibilityMatch(band, 'Smart Band 9 Active', true), null);
  const width = { name: 'Ремешок для часов 20 mm', sku: 'NEW-20' };
  assert.equal(compatibilityMatch(width, '20 мм'), 'direct');
  assert.equal(compatibilityMatch(width, 'GTS 4', true), null);
});

test('compatibility markup escapes content and rejects unsafe source links', () => {
  const product = { name: 'Щетка для пылесоса TEST', sku: 'SAFE', specs: { _compatibility: {
    name: 'Щетка для пылесоса TEST', sku: 'SAFE', declared_models: ['<script>bad</script>'],
    sources: [{ url: 'javascript:alert(1)', title: 'bad' }, { url: 'https://example.com', title: '<test>' }],
  } } };
  const html = compatibilityDetailsMarkup(product);
  assert.doesNotMatch(html, /<script>|javascript:/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /rel="noopener noreferrer"/);
});
