import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source = fs.readFileSync(new URL('../supabase-client.js', import.meta.url), 'utf8');
function adapter(fetch, getSession = async () => ({ data: { session: null } })) {
  let options;
  const client = { auth: { getSession, onAuthStateChange: () => ({}) } };
  const window = { WEBBASE_SUPABASE: { url: 'https://test.invalid', publishableKey: 'test' },
    supabase: { createClient: (_, __, config) => { options = config; return client; } } };
  vm.runInNewContext(source, { window, fetch, Response, Headers, URL, AbortController, TextEncoder, console,
    setTimeout: (callback, ms) => setTimeout(callback, ms / 1000), clearTimeout });
  return { db: window.WebBaseDB, options };
}
test('auth timeout includes a stalled response body and never resends the request', async () => {
  let calls = 0;
  const { options } = adapter(async (_, { signal }) => {
    calls++;
    return { arrayBuffer: () => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')))) };
  });
  await assert.rejects(options.global.fetch('https://test.invalid/auth/v1/token'), /aborted/);
  assert.equal(calls, 1);
});
test('logout can return 204 and non-auth writes pass through untouched', async () => {
  const response = new Response(null, { status: 204 });
  const { options } = adapter(async () => response);
  assert.equal((await options.global.fetch('https://test.invalid/auth/v1/logout')).status, 204);
  assert.equal(await options.global.fetch('https://test.invalid/rest/v1/rpc/webbase_apply_import'), response);
  assert.equal(await options.global.fetch('https://test.invalid/storage/v1/object/webbase-products/upload.webp', {method:'POST'}),response);
});
test('a stuck SDK session lock cannot keep the access screen waiting indefinitely', async () => {
  const { db } = adapter(async () => {}, () => new Promise(() => {}));
  await assert.rejects(db.getSession(), { code: 'SESSION_TIMEOUT' });
});


test('a stalled image-signing body is aborted without aborting a product upload', async()=>{
  let calls=0;
  const {options}=adapter(async (_, {signal})=>{calls++;return {arrayBuffer:()=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error('signing aborted'))))}});
  await assert.rejects(options.global.fetch('https://test.invalid/storage/v1/object/sign/webbase-products',{method:'POST'}),/signing aborted/);
  assert.equal(calls,1);
});
