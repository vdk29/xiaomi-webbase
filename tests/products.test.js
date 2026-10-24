import test from 'node:test';
import assert from 'node:assert/strict';
import { fillSharedImages, normalizeProduct } from '../js/products.js';

test('shared gallery fills only empty cards and leaves stock and own photos unchanged', async () => {
  const own = normalizeProduct({ id: 'own', webbase_product_images: [{ id: 'own-photo', sort_order: 0 }], webbase_stock: { warehouse: 7 } });
  const inherited = normalizeProduct({ id: 'new', webbase_stock: { warehouse: 2 } });
  const unmatched = normalizeProduct({ id: 'other' });
  const calls = [];
  const db = { client: { rpc: async (name, payload) => {
    calls.push([name, payload]);
    return { data: [
      { target_product_id: 'new', image: { id: 'side', sort_order: 1, storage_path: 'shared-side' } },
      { target_product_id: 'new', image: { id: 'main', is_primary: true, sort_order: 0, storage_path: 'shared-main' } },
    ] };
  } } };
  await fillSharedImages(db, [own, inherited, unmatched]);
  assert.deepEqual(calls, [['webbase_shared_product_images', { p_product_ids: ['new', 'other'] }]]);
  assert.equal(inherited.primaryImage.id, 'main');
  assert.deepEqual(inherited.images.map(image => image.id), ['main', 'side']);
  assert.ok(inherited.images.every(image => image.inherited));
  assert.equal(inherited.stock.warehouse, 2);
  assert.equal(own.images[0].id, 'own-photo');
  assert.equal(own.stock.warehouse, 7);
  assert.equal(unmatched.images.length, 0);
});

test('own galleries need no shared lookup; lookup errors are reported', async () => {
  const error = new Error('RLS unavailable');
  let calls = 0;
  const db = { client: { rpc: async () => { calls++; return { error }; } } };
  await fillSharedImages(db, [normalizeProduct({ id: 'own', webbase_product_images: [{ id: 'photo' }] })]);
  assert.equal(calls, 0);
  await assert.rejects(fillSharedImages(db, [normalizeProduct({ id: 'missing' })]), error);
});

test('shared lookup batches large catalogs below the Data API row limit', async () => {
  const sizes = [];
  const db = { client: { rpc: async (_, { p_product_ids }) => {
    sizes.push(p_product_ids.length);
    return { data: p_product_ids.flatMap(id => [0, 1, 2].map(sort_order => ({
      target_product_id: id, image: { id: `${id}-${sort_order}`, sort_order },
    }))) };
  } } };
  const products = Array.from({ length: 401 }, (_, id) => normalizeProduct({ id: String(id) }));
  await fillSharedImages(db, products);
  assert.deepEqual(sizes, [200, 200, 1]);
  assert.ok(products.every(product => product.images.length === 3));
});
