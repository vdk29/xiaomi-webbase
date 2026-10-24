import { $, errorMessage, setBusy } from "./js/utils.js?v=20261024-8";
import { getAccessContext, safeNextUrl, signIn } from "./js/auth.js?v=20261024-8";
import { listProducts } from "./js/products.js?v=20261024-8";
import { initializeCatalog, populateCategories, renderCatalog } from "./js/catalog.js?v=20261024-7";
import { initializeCompatibility, renderCompatibility } from "./js/compatibility.js?v=20261024-10";
import { initializeEmployees, refreshEmployees } from "./js/employees.js?v=20261023-4";
import { initializeImporter } from "./js/importer.js?v=20261024-4";
import { initializeListingNavigation, syncListingLocation, restoreListingScroll } from './js/listing-navigation.js?v=20261024-10';

const db = window.WebBaseDB;
const state = {
  rows: [],
  staff: [],
  user: null,
  profile: null,
  admin: false,
  importPreview: null,
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
async function reloadProducts() {
  if (productsRequest) return productsRequest;
  productsRequest = loadCatalog().finally(() => { productsRequest = null; });
  return productsRequest;
}

async function loadCatalog() {
  $("catalogLoading").hidden = false;
  $("catalogError").hidden = true;
  $("retryCatalog").disabled = true;
  try {
    state.rows = await listProducts(db);
    populateCategories(state.rows);
    if (state.section === 'compatibility') renderCompatibility(db, state);
    else renderCatalog(db, state);
    restoreListingScroll();
    if (state.rows.sharedImagesUnavailable) {
      $("catalogErrorText").textContent = 'Товары загружены. Общие фотографии вариантов памяти временно недоступны; попробуйте обновить каталог.';
      $("catalogError").hidden = false;
    }
  } catch (error) {
    $("catalogErrorText").textContent = `${errorMessage(error)}${state.rows.length ? ' Показаны ранее загруженные данные; остатки могут быть неактуальны.' : ''}`;
    $("catalogError").hidden = false;
    throw error;
  } finally {
    $("catalogLoading").hidden = true;
    $("retryCatalog").disabled = false;
  }
}

function selectSection(name, { restore = false } = {}) {
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
  if (name === 'compatibility') renderCompatibility(db, state);
  if (name === 'catalog') renderCatalog(db, state);
  syncListingLocation(name, { resetScroll: !restore });
}

function renderAccount() {
  const label = state.profile?.display_name || state.profile?.username || state.user?.email || "";
  $("accountName").textContent = label;
  $("accountRole").textContent = state.admin ? "Администратор" : "Сотрудник";
  $("staffSectionNav").hidden = !state.admin;
  $("importSectionNav").hidden = !state.admin;
}

async function refreshSession() {
  const context = await getAccessContext(db);
  state.user = context.user;
  state.profile = context.profile;
  state.admin = context.admin;
  const approved = Boolean(context.user && context.profile?.active);
  $("sessionLoading").hidden = true;
  $("authPanel").hidden = approved;
  $("appShell").hidden = !approved;
  if (!context.user) return;
  if (!context.profile?.active) {
    $("authPanel").hidden = false;
    $("appShell").hidden = true;
    $("authStatus").textContent = "Учётная запись заблокирована или ещё не одобрена администратором.";
    await db.signOut().catch(() => {});
    return;
  }
  renderAccount();
  // A catalog transport failure does not mean the approved user is signed out.
  await reloadProducts().catch(() => {});
  selectSection(state.section, { restore: true });
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

  db.client.auth.onAuthStateChange(() => {
    window.setTimeout(() => refreshSession().catch((error) => notify(errorMessage(error), true)), 0);
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
});
