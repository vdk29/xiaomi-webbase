// Deliberately excludes user identity, credentials, search text and request headers.
export function catalogDiagnostic(error, { loaded = 0 } = {}) {
  const read = error?.catalogRead || {};
  return {
    appVersion: '20261025-15',
    timeUtc: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    endpoint: '/rest/v1/webbase_catalog',
    errorCode: String(error?.code || 'NETWORK_ERROR').replace(/[^a-z0-9_-]/gi, '').slice(0, 64),
    httpStatus: Number(error?.status || 0),
    offset: Number(read.offset || 0),
    pageSize: Number(read.pageSize || 0),
    loaded: Number(read.loaded ?? loaded),
    online: globalThis.navigator?.onLine ?? null,
    connectionType: globalThis.navigator?.connection?.effectiveType || null,
    browser: globalThis.navigator?.userAgent || null,
  };
}

export function downloadCatalogDiagnostic(diagnostic) {
  if (!diagnostic) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(diagnostic, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'xiaomi-connection-diagnostic.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
