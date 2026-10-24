import test from 'node:test';
import assert from 'node:assert/strict';
import { readWithRetry } from '../js/network.js';
import { errorMessage } from '../js/utils.js';

test('an interrupted 200 response returned as a fetch error retries the read', async () => {
  let calls = 0;
  const result = await readWithRetry(async () => ++calls === 1
    ? { data: null, status: 200, error: { message: 'TypeError: Failed to fetch', code: '' } }
    : { data: ['product'] }, { delayMs: 0 });
  assert.equal(calls, 2);
  assert.deepEqual(result.data, ['product']);
});

test('a hung read is aborted and bounded even if its promise ignores cancellation', async () => {
  let signal;
  await assert.rejects(readWithRetry(s => { signal = s; return new Promise(() => {}); },
    { attempts: 1, timeoutMs: 10 }), { code: 'READ_TIMEOUT' });
  assert.equal(signal.aborted, true);
});

test('authentication, permission and validation errors are never retried', async () => {
  for (const status of [400, 401, 403]) {
    let calls = 0;
    const error = { message: 'permission denied', code: '42501' };
    await assert.rejects(readWithRetry(async () => { calls++; return { status, error }; }, { delayMs: 0 }), error);
    assert.equal(calls, 1);
  }
});

test('server errors retry only to the configured limit, and network messages are readable', async () => {
  let calls = 0;
  await assert.rejects(readWithRetry(async () => { calls++; return { status: 503, error: { message: 'Unavailable' } }; },
    { attempts: 2, delayMs: 0 }));
  assert.equal(calls, 2);
  assert.match(errorMessage({ message: 'TypeError: Failed to fetch' }), /Соединение с сервером прервалось/);
});
