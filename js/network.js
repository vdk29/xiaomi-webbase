// Retry read operations only. Never wrap imports, uploads or staff mutations.
export function isTransientReadError(error) {
  const status = Number(error?.status || 0);
  return error?.code === 'READ_TIMEOUT' || status === 429 || (status >= 500 && status <= 599)
    || /failed to fetch|networkerror|network request failed|load failed|err_connection|econnreset|connection reset/i.test(error?.message || '');
}

export async function readWithRetry(operation, { attempts = 3, timeoutMs = 8000, delayMs = 400 } = {}) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = new AbortController();
    let timer;
    try {
      const deadline = new Promise((_, reject) => {
        timer = setTimeout(() => {
          const error = Object.assign(new Error('Не удалось дождаться ответа сервера.'), { code: 'READ_TIMEOUT' });
          reject(error);
          controller.abort();
        }, timeoutMs);
      });
      const result = await Promise.race([Promise.resolve().then(() => operation(controller.signal)), deadline]);
      if (result?.error) {
        if (result.status) result.error.status = result.status;
        throw result.error;
      }
      return result;
    } catch (error) {
      if (attempt + 1 >= attempts || !isTransientReadError(error)) throw error;
    } finally { clearTimeout(timer); }
    await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
  }
}

export function abortableRead(query, signal) {
  return typeof query.abortSignal === 'function' ? query.abortSignal(signal) : query;
}
