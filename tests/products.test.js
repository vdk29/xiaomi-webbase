import test from 'node:test';
import assert from 'node:assert/strict';
import { fillSharedImages, normalizeProduct, listProducts, CATALOG_SELECT } from '../js/products.js';

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

test('catalog pages retry independently and a failed photo lookup does not discard products', async () => {
  const ranges = [];
  const data = Array.from({ length: 51 }, (_, id) => ({ id: String(id), name: `Смартфон Xiaomi Test ${id} 8GB+256GB Black`, compatibility: id === 0 ? { kind: 'vacuum' } : null }));
  let firstPageCalls = 0;
  const db = { config: { url: 'test', bucket: 'test' }, client: {
    from: () => {
      const query = { select: selection => { assert.equal(selection, CATALOG_SELECT); return query; }, eq: () => query, order: () => query,
        range: async (from, to) => {
          ranges.push([from, to]);
          if (from === 0 && ++firstPageCalls === 1) return { error: { message: 'Failed to fetch' } };
          return { data: data.slice(from, to + 1) };
        } };
      return query;
    },
    rpc: async () => ({ error: { message: 'Missing permission', code: '42501' }, status: 403 }),
  } };
  const rows = await listProducts(db);
  assert.deepEqual(ranges, [[0, 49], [0, 49], [50, 99]]);
  assert.equal(rows.length, 51);
  assert.equal(new Set(rows.map(row => row.id)).size, 51);
  assert.equal(rows[0].specs._compatibility.kind, 'vacuum');
  assert.equal(rows.sharedImagesUnavailable, true);
  assert.doesNotMatch(CATALOG_SELECT, /description|original_name|byte_size/);
});

test('first page is delivered early, accessory photo lookups are skipped, and photo work can run in background', async () => {
  const pages = [];
  const data = Array.from({ length: 51 }, (_, id) => ({ id: String(id), name: `Чехол ${id}` }));
  let rpcCalls = 0; let release;
  const db = { config: { url: 'test', bucket: 'test' }, client: {
    from: () => { const q = { select: () => q, eq: () => q, order: () => q,
      range: async (from, to) => ({ data: data.slice(from, to + 1) }) }; return q; },
    rpc: () => { rpcCalls++; return new Promise(resolve => { release = resolve; }); },
  } };
  const accessories = await listProducts(db, { onProgress: p => pages.push(p) });
  assert.equal(accessories.length, 51);
  assert.equal(pages[0].rows.length, 50);
  assert.equal(pages[1].loaded, 51);
  assert.equal(rpcCalls, 0);
  data[50].name = 'Смартфон Xiaomi Test 8GB+512GB Black';
  let hydrated;
  const rows = await listProducts(db, { backgroundImages: true, onImages: rows => { hydrated = rows; } });
  assert.equal(rows.length, 51);
  assert.equal(hydrated, undefined);
  assert.equal(rpcCalls, 1);
  release({ data: [] });
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(hydrated, rows);
});
