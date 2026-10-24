import { $, errorMessage, setBusy } from "./js/utils.js?v=20261024-8";
import { getAccessContext, safeNextUrl, signIn } from "./js/auth.js?v=20261024-11";
import { listProducts } from "./js/products.js?v=20261024-11";
import { initializeCatalog, populateCategories, renderCatalog } from "./js/catalog.js?v=20261024-11";
import { initializeCompatibility, renderCompatibility } from "./js/compatibility.js?v=20261024-11";
import { initializeEmployees, refreshEmployees } from "./js/employees.js?v=20261023-4";
import { initializeImporter } from "./js/importer.js?v=20261024-11";
import { initializeListingNavigation, syncListingLocation, restoreListingScroll } from './js/listing-navigation.js?v=20261024-10';

const db = window.WebBaseDB;
const state = {
  rows: [],
  staff: [],
  user: null,
  profile: null,
  admin: false,
  importPreview: null,
  catalogComplete: false,
  partialCatalog: false,
  stopImageObserver: null,
  stopCompatibilityObserver: null,
  section: new URLSearchParams(location.search).get('section') === 'compatibility' ? 'compatibility' : 'catalog',
};

function notify(message, isError = false) {
  const element = $("notice");
  element.textContent = message || "";
  element.className = message ? `toast ${isError ? "error" : "success"}` : "toast";
  if (message) window.setTimeout(() => {
    if (element.textContent === message) element.textContent = "";
  }, 6000);
}

let productsRequest = null;
let productsRequestUser = null;
async function reloadProducts() {
  if (productsRequest && productsRequestUser === state.user?.id) return productsRequest;
  productsRequestUser = state.user?.id;
  const request = loadCatalog();
  productsRequest = request;
  try { return await request; }
  finally { if (productsRequest === request) productsRequest = null; }
}

function renderCurrentCatalog({ populate = true } = {}) {
  if (populate) populateCategories(state.rows);
  if (state.section === 'compatibility') renderCompatibility(db, state);
  else if (state.section === 'catalog') renderCatalog(db, state);
}

function showPhotoWarning(rows) {
  if (state.rows !== rows || !rows.sharedImagesUnavailable) return;
  $("catalogErrorText").textContent = 'Товары загружены. Общие фотографии вариантов памяти временно недоступны; попробуйте обновить каталог.';
  $("catalogError").hidden = false;
}

async function loadCatalog() {
  const userId = state.user?.id;
  const progressive = !state.rows.length || state.partialCatalog;
  state.catalogComplete = false;
  $("excel").disabled = true;
  state.importPreview = null;
  $("excel").value = '';
  $("importPreview").replaceChildren();
  $("catalogLoading").hidden = false;
  $("catalogProgress").hidden = false;
  $("catalogProgress").textContent = 'Подключаюсь к каталогу…';
  $("catalogError").hidden = true;
  $("retryCatalog").disabled = true;
  try {
    const rows = await listProducts(db, {
      backgroundImages: true,
      onProgress: ({ loaded, rows }) => {
        if (state.user?.id !== userId) return;
        $("catalogProgress").textContent = `Загружено ${loaded} товаров. Продолжаю загрузку полного каталога…`;
        if (progressive && rows) {
          state.rows = rows;
          state.partialCatalog = true;
          renderCurrentCatalog({ populate: false });
        }
      },
      onImages: rows => {
        if (state.user?.id !== userId || state.rows !== rows) return;
        renderCurrentCatalog();
        showPhotoWarning(rows);
      },
    });
    if (state.user?.id !== userId) return;
    state.rows = rows;
    state.catalogComplete = true;
    state.partialCatalog = false;
    renderCurrentCatalog();
    restoreListingScroll();
    showPhotoWarning(rows);
  } catch (error) {
    if (state.user?.id !== userId) return;
    $("catalogErrorText").textContent = `${errorMessage(error)}${state.partialCatalog ? ' Загружена только часть каталога. Импорт доступен после полной загрузки.' : state.rows.length ? ' Показаны ранее загруженные данные; остатки могут быть неактуальны.' : ''}`;
    $("catalogError").hidden = false;
    throw error;
  } finally {
    if (state.user?.id === userId) {
      $("catalogLoading").hidden = true;
      $("catalogProgress").hidden = true;
      $("retryCatalog").disabled = false;
      $("excel").disabled = !state.catalogComplete;
    }
  }
}

function selectSection(name, { restore = false, render = true } = {}) {
  state.section = name;
  state.stopImageObserver?.();
  state.stopCompatibilityObserver?.();
  document.querySelectorAll("[data-section]").forEach((section) => {
    section.hidden = section.dataset.section !== name;
  });
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.classList.toggle("active", button.dataset.nav === name);
  });
  if (name === "staff" && state.admin) refreshEmployees(db, state, notify);
  if (render && name === 'compatibility') renderCompatibility(db, state);
  if (render && name === 'catalog') renderCatalog(db, state);
  syncListingLocation(name, { resetScroll: !restore });
}

function renderAccount() {
  const label = state.profile?.display_name || state.profile?.username || state.user?.email || "";
  $("accountName").textContent = label;
  $("accountRole").textContent = state.admin ? "Администратор" : "Сотрудник";
  $("staffSectionNav").hidden = !state.admin;
  $("importSectionNav").hidden = !state.admin;
}

let sessionRequest = null;
let sessionVersion = 0;
async function refreshSession() {
  if (sessionRequest) return sessionRequest;
  sessionRequest = checkSession().finally(() => { sessionRequest = null; });
  return sessionRequest;
}

async function checkSession() {
  const version = sessionVersion;
  const previousUser = state.user?.id;
  const context = await getAccessContext(db);
  if (version !== sessionVersion) return;
  state.user = context.user;
  state.profile = context.profile;
  state.admin = context.admin;
  const approved = Boolean(context.user && context.profile?.active);
  $("sessionLoading").hidden = true;
  $("authPanel").hidden = approved;
  $("appShell").hidden = !approved;
  if (!context.user) {
    state.rows = [];
    state.catalogComplete = false;
    state.partialCatalog = false;
    $("catalog").replaceChildren();
    $("compatibilityCatalog").replaceChildren();
    return;
  }
  if (!context.profile?.active) {
    $("authPanel").hidden = false;
    $("appShell").hidden = true;
    $("authStatus").textContent = "Учётная запись заблокирована или ещё не одобрена администратором.";
    await db.signOut().catch(() => {});
    return;
  }
  if (previousUser && previousUser !== context.user.id) {
    state.rows = [];
    state.catalogComplete = false;
    state.partialCatalog = false;
  }
  renderAccount();
  $("retrySession").hidden = true;
  if (previousUser === context.user.id && state.catalogComplete) return;
  selectSection(state.section, { restore: true, render: false });
  // A catalog transport failure does not mean the approved user is signed out.
  await reloadProducts().catch(() => {});
  syncListingLocation(state.section, { resetScroll: false });
  const next = safeNextUrl(new URLSearchParams(location.search).get("next"));
  if (next) location.replace(next);
}

async function boot() {
  if (!db) {
    $("sessionLoading").hidden = true;
    $("authPanel").hidden = false;
    $("authStatus").textContent = "Не удалось загрузить безопасное подключение к Supabase.";
    return;
  }
  initializeListingNavigation(() => state.section);
  initializeCatalog(db, state);
  initializeCompatibility(db, state);
  initializeEmployees(db, state, notify);
  initializeImporter(db, state, { notify, reloadProducts });

  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => selectSection(button.dataset.nav));
  });
  $("refresh").addEventListener("click", () => reloadProducts().catch((error) => notify(errorMessage(error), true)));
  $("retryCatalog").addEventListener("click", () => reloadProducts().catch(() => {}));
  $("retrySession").addEventListener('click', async () => {
    setBusy($("retrySession"), true, 'Подключаюсь…');
    try { await refreshSession(); }
    catch (error) { $("authStatus").textContent = errorMessage(error); }
    finally { setBusy($("retrySession"), false); }
  });
  $("signOut").addEventListener("click", () => db.signOut().catch((error) => notify(errorMessage(error), true)));
  $("authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.submitter;
    setBusy(button, true, "Вхожу…");
    $("authStatus").textContent = "";
    try {
      await signIn(db, $("login").value, $("password").value);
    } catch (error) {
      $("authStatus").textContent = errorMessage(error);
    } finally {
      setBusy(button, false);
    }
  });

  db.client.auth.onAuthStateChange(event => {
    if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;
    sessionVersion++;
    if (event === 'SIGNED_OUT') {
      state.user = null;
      state.rows = [];
      state.catalogComplete = false;
      state.partialCatalog = false;
      $("appShell").hidden = true;
      $("authPanel").hidden = false;
      $("catalog").replaceChildren();
      $("compatibilityCatalog").replaceChildren();
    }
    window.setTimeout(async () => {
      if (sessionRequest) await sessionRequest.catch(() => {});
      refreshSession().catch((error) => { $("retrySession").hidden = false; notify(errorMessage(error), true); });
    }, 0);
  });
  if (new URLSearchParams(location.search).has("blocked")) {
    $("authStatus").textContent = "Доступ к учётной записи отключён.";
  }
  await refreshSession();
}

boot().catch((error) => {
  console.error(error);
  $("sessionLoading").hidden = true;
  $("authPanel").hidden = false;
  $("authStatus").textContent = errorMessage(error);
  $("retrySession").hidden = false;
});
