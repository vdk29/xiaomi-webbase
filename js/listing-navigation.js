const FILTERS = {
  q: 'search', category: 'category', availability: 'availability',
  model: 'compatibilitySearch', kind: 'compatibilityKind', conditional: 'compatibilityConditional',
};
let pendingScroll = null;

export function listingScroll(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(10000000, Math.round(number))) : 0;
}

export function productReturnUrl(productHref) {
  const product = new URL(productHref);
  const index = new URL('index.html', product);
  const fallback = product.searchParams.get('from') === 'compatibility' ? 'index.html?section=compatibility' : 'index.html';
  const raw = product.searchParams.get('returnTo');
  if (!raw) return fallback;
  try {
    const target = new URL(raw, product);
    if (target.origin !== index.origin || ![index.pathname, new URL('.', index).pathname].includes(target.pathname)) return fallback;
    const clean = new URLSearchParams();
    if (target.searchParams.get('section') === 'compatibility') clean.set('section', 'compatibility');
    for (const key of Object.keys(FILTERS)) {
      const value = target.searchParams.get(key);
      if (value) clean.set(key, value.slice(0, 500));
    }
    if (target.searchParams.has('scroll')) clean.set('scroll', String(listingScroll(target.searchParams.get('scroll'))));
    return `index.html${clean.size ? `?${clean}` : ''}`;
  } catch { return fallback; }
}

export function syncListingLocation(section, { resetScroll = true } = {}) {
  const url = new URL(location.href);
  if (section === 'compatibility') url.searchParams.set('section', section);
  else url.searchParams.delete('section');
  for (const [key, id] of Object.entries(FILTERS)) {
    const field = document.getElementById(id);
    const value = field.type === 'checkbox' ? (field.checked ? '1' : '') : field.value;
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  const snapshot = { ...history.state };
  if (resetScroll) {
    pendingScroll = null;
    url.searchParams.delete('scroll');
    delete snapshot.webbaseListingScroll;
  }
  history.replaceState(snapshot, '', url);
}

export function restoreListingScroll() {
  if (pendingScroll === null) return;
  const top = pendingScroll;
  pendingScroll = null;
  // Wait until fetched cards and the selected section have their final layout.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, top);
    root.style.scrollBehavior = previous;
  }));
}

export function initializeListingNavigation(getSection) {
  const params = new URLSearchParams(location.search);
  for (const [key, id] of Object.entries(FILTERS)) {
    const field = document.getElementById(id);
    const value = params.get(key) || '';
    if (field.type === 'checkbox') field.checked = value === '1';
    else {
      // Categories are normally populated only after the authenticated catalog read.
      if (id === 'category' && value && ![...field.options].some(option => option.value === value)) field.add(new Option(value, value));
      field.value = value;
    }
    field.addEventListener(field.type === 'search' ? 'input' : 'change', () => syncListingLocation(getSection()));
  }
  pendingScroll = listingScroll(params.get('scroll') ?? history.state?.webbaseListingScroll ?? 0);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const rememberProductOrigin = event => {
    const anchor = event.target.closest?.('a.product-card');
    if (!anchor) return;
    syncListingLocation(getSection(), { resetScroll: false });
    const listing = new URL(location.href);
    listing.searchParams.set('scroll', String(listingScroll(window.scrollY)));
    history.replaceState({ ...history.state, webbaseListingScroll: listingScroll(window.scrollY) }, '', listing);
    const product = new URL(anchor.href);
    product.searchParams.set('returnTo', `index.html${listing.search}`);
    anchor.href = product.href;
  };
  // Covers clicks, keyboard activation, Ctrl/Cmd-click and context-menu opening.
  for (const event of ['pointerdown', 'click', 'contextmenu']) document.addEventListener(event, rememberProductOrigin, true);
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      pendingScroll = listingScroll(new URLSearchParams(location.search).get('scroll') ?? history.state?.webbaseListingScroll ?? 0);
      restoreListingScroll();
    }
  });
}
