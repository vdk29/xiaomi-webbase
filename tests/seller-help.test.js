import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildSellerHelp, sellerHelpMarkup, sellerProfile, phoneMemory } from '../js/seller-help.js';
import { SELLER_PROFILES } from '../js/seller-help-data.js';

const phones = JSON.parse(fs.readFileSync(new URL('./fixtures/seller-phones.json', import.meta.url)));
const phone = (name, overrides = {}) => ({name, category:'Смартфоны', ...overrides});

test('all 62 current variants map to eight distinct reviewed families and retain their own configuration', () => {
  assert.equal(phones.length, 62);
  assert.equal(new Set(phones.map(product => sellerProfile(product)?.id)).size, 8);
  for (const product of phones) {
    const help = buildSellerHelp(product);
    assert.ok(help.profile, product.name);
    assert.ok(help.memory, product.name);
    assert.equal(help.cards.length, 6);
    assert.match(help.cards.find(card => card.id === 'memory').fact, new RegExp(`${help.memory.storage} ГБ`));
    const before = JSON.stringify(product);
    const markup = sellerHelpMarkup(product);
    assert.match(markup, /role="tablist"/);
    assert.equal((markup.match(/role="tab" /g)||[]).length, 6);
    assert.ok(markup.includes('Что сказать клиенту'));
    assert.ok(markup.includes('Источники ·'));
    assert.equal(JSON.stringify(product), before);
  }
});

test('family matching cannot conflate brands, Pro/Max/Ultra, 4G/5G or future names', () => {
  for (const name of ['Xiaomi 17', 'REDMI 17 Pro', 'REDMI Note 17 5G', 'REDMI Note 17 Pro', 'Xiaomi 17T Ultra', 'POCO F9', 'Xiaomi 18 Pro', '17']) {
    assert.equal(sellerProfile(phone(`Смартфон ${name} 12GB+256GB Black`)), null, name);
  }
  assert.equal(sellerProfile(phone('Смартфон Xiaomi 17T Pro 12GB+256GB Black')).id, 'xiaomi-17t-pro');
  assert.equal(sellerProfile(phone('Смартфон REDMI 17 4/128GB синий', {model:'17'})).id, 'redmi-17');
});

test('variant memory uses SKU name before stale family fields and supports Cyrillic and TB', () => {
  assert.deepEqual(phoneMemory(phone('Смартфон Xiaomi 17T 12GB+512GB Blue', {memory:'16/1024 ГБ'})), {ram:12,storage:512});
  assert.deepEqual(phoneMemory(phone('Смартфон X 8/256ГБ синий')), {ram:8,storage:256});
  assert.deepEqual(phoneMemory(phone('Смартфон X 16GB+1TB Black')), {ram:16,storage:1024});
  assert.deepEqual(phoneMemory(phone('Смартфон X', {memory:'6/128 ГБ'})), {ram:6,storage:128});
  assert.equal(phoneMemory(phone('Смартфон X')), null);
});

test('regional battery differences stay explicit and missing specs never fabricate a market', () => {
  const name='Смартфон REDMI Note 17 Pro Max 5G 8GB+512GB Black';
  for (const value of ['9210 мА·ч (глобальная версия)', '10000', '10 000']) {
    const data=buildSellerHelp(phone(name,{specs:{'Аккумулятор':value}}));
    assert.match(data.cards[0].fact, value.startsWith('9210') ? /9210/ : /10000/);
    assert.match(data.cards[0].fact, /сверьте регион/);
  }
  assert.match(buildSellerHelp(phone(name)).cards[0].fact, /9210 \/ 10000.*зависит от рынка/);
  assert.match(sellerHelpMarkup(phone(name)), /Версия UK: батарея/);
  assert.match(buildSellerHelp(phone(name,{specs:{'Аккумулятор':'99999'}})).cards[0].fact, /9210 \/ 10000/);
});

test('phones without old descriptions get help; other categories retain their description flow', () => {
  const empty=phone('Смартфон Xiaomi 17T 12GB+512GB Blue', {specs:{},description:''});
  assert.equal(buildSellerHelp(empty).cards.length, 6);
  for (const category of ['Планшеты','Телевизоры','Аксессуары и другое','']) {
    assert.equal(sellerHelpMarkup({...empty,category}), '');
  }
  const unknown=sellerHelpMarkup(phone('Смартфон Новая модель'));
  assert.match(unknown, /ещё нет проверенного сценария/);
  assert.doesNotMatch(unknown, /Snapdragon|7500|AMOLED|120 Гц/);
});

test('seller help escapes product content, rejects unsafe links, and leaves stored descriptions untouched', () => {
  const product=phone('<img src=x onerror=alert(1)>', {color:'<svg onload=alert(1)>', description:'Оригинал', specs:{_source_url:'javascript:alert(1)'}});
  const markup=sellerHelpMarkup(product);
  assert.doesNotMatch(markup, /<img|<svg|href="javascript:/);
  assert.match(sellerHelpMarkup({...product,specs:{_source_url:'https://example.com/?a=1&b=2'}}), /a=1&amp;b=2/);
  assert.equal(product.description, 'Оригинал');
  assert.ok(SELLER_PROFILES.every(profile => new URL(profile.source).hostname==='www.mi.com'));
});

test('reimported stock, alias and description changes cannot change a family or erase help', () => {
  for (const product of phones) {
    const before=buildSellerHelp(product);
    const after=buildSellerHelp({...product, description:'', sku:'new-alias',stock:{warehouse:0,display:3}});
    assert.equal(before.profile.id, after.profile.id);
    assert.deepEqual(before.cards, after.cards);
  }
});


test('consultation stays compact: one phrase per topic with no case studies or long introduction', () => {
  for (const product of phones) {
    const help=buildSellerHelp(product);
    assert.ok(help.cards.every(card => card.say.length < 310));
    const markup=sellerHelpMarkup(product);
    assert.equal((markup.match(/role="tabpanel"/g)||[]).length, 6);
    assert.equal((markup.match(/tabindex="0" hidden/g)||[]).length, 5);
    assert.doesNotMatch(markup, /Сначала спросите|Если клиент сомневается|Завершите рекомендацией|Покажите|seller-intro/);
  }
});
