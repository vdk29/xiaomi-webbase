import test from 'node:test';
import assert from 'node:assert/strict';
import { productReturnUrl, listingScroll } from '../js/listing-navigation.js';

const base = 'https://vdk29.github.io/xiaomi-webbase/product.html?id=abc';
test('product return preserves the selected category, search, stock and scroll', () => {
  const listing = 'index.html?category=Смартфоны&q=Black&availability=available&scroll=1234';
  const url = new URL(base);
  url.searchParams.set('returnTo', listing);
  const target = new URL(productReturnUrl(url.href), base);
  assert.equal(target.pathname, '/xiaomi-webbase/index.html');
  assert.equal(target.searchParams.get('category'), 'Смартфоны');
  assert.equal(target.searchParams.get('q'), 'Black');
  assert.equal(target.searchParams.get('availability'), 'available');
  assert.equal(target.searchParams.get('scroll'), '1234');
});

test('compatibility section and its separate filters also survive return', () => {
  const url = new URL(base);
  url.searchParams.set('returnTo', 'index.html?section=compatibility&model=S20%2B&kind=vacuum&conditional=1');
  const params = new URL(productReturnUrl(url.href), base).searchParams;
  assert.equal(params.get('section'), 'compatibility');
  assert.equal(params.get('model'), 'S20+');
  assert.equal(params.get('kind'), 'vacuum');
  assert.equal(params.has('conditional'), false);
});

test('return links cannot redirect offsite, outside this project, or carry auth redirects', () => {
  for (const returnTo of ['https://evil.example/index.html', '//evil.example/index.html', 'javascript:alert(1)', '/different/index.html', 'product.html?id=wrong']) {
    const url = new URL(base);
    url.searchParams.set('returnTo', returnTo);
    assert.equal(productReturnUrl(url.href), 'index.html');
  }
  const url = new URL(base);
  url.searchParams.set('returnTo', 'index.html?category=Наушники&next=https://evil.example&scroll=-1');
  const params = new URL(productReturnUrl(url.href), base).searchParams;
  assert.equal(params.has('next'), false);
  assert.equal(params.get('scroll'), '0');
  assert.equal(productReturnUrl(base + '&from=compatibility'), 'index.html?section=compatibility');
  assert.equal(listingScroll('NaN'), 0);
});
