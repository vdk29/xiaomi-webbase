import { $, errorMessage, setBusy } from "./js/utils.js?v=20261023-4";
import { getAccessContext, safeNextUrl, signIn } from "./js/auth.js?v=20261023-4";
import { listProducts } from "./js/products.js?v=20261023-4";
import { initializeCatalog, populateCategories, renderCatalog } from "./js/catalog.js?v=20261023-5";
import { initializeEmployees, refreshEmployees } from "./js/employees.js?v=20261023-4";
import { initializeImporter } from "./js/importer.js?v=20261023-4";

const db = window.WebBaseDB;
const state = {
  rows: [],
  staff: [],
  user: null,
  profile: null,
  admin: false,
  importPreview: null,
  stopImageObserver: null,
};

function notify(message, isError = false) {
  const element = $("notice");
  element.textContent = message || "";
  element.className = message ? `toast ${isError ? "error" : "success"}` : "toast";
  if (message) window.setTimeout(() => {
    if (element.textContent === message) element.textContent = "";
  }, 6000);
}

async function reloadProducts() {
  $("catalogLoading").hidden = false;
  try {
    state.rows = await listProducts(db);
    populateCategories(state.rows);
    renderCatalog(db, state);
  } finally {
    $("catalogLoading").hidden = true;
  }
}

function selectSection(name) {
  document.querySelectorAll("[data-section]").forEach((section) => {
    section.hidden = section.dataset.section !== name;
  });
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.classList.toggle("active", button.dataset.nav === name);
  });
  if (name === "staff" && state.admin) refreshEmployees(db, state, notify);
}

function renderAccount() {
  const label = state.profile?.display_name || state.profile?.username || state.user?.email || "";
  $("accountName").textContent = label;
  $("accountRole").textContent = state.admin ? "Администратор" : "Сотрудник";
  $("adminNav").hidden = !state.admin;
  $("staffSectionNav").hidden = !state.admin;
  $("importSectionNav").hidden = !state.admin;
}

async function refreshSession() {
  const context = await getAccessContext(db);
  state.user = context.user;
  state.profile = context.profile;
  state.admin = context.admin;
  const approved = Boolean(context.user && context.profile?.active);
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
  await reloadProducts();
  const next = safeNextUrl(new URLSearchParams(location.search).get("next"));
  if (next) location.replace(next);
}

async function boot() {
  if (!db) {
    $("authStatus").textContent = "Не удалось загрузить безопасное подключение к Supabase.";
    return;
  }
  initializeCatalog(db, state);
  initializeEmployees(db, state, notify);
  initializeImporter(db, state, { notify, reloadProducts });

  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => selectSection(button.dataset.nav));
  });
  $("refresh").addEventListener("click", () => reloadProducts().catch((error) => notify(errorMessage(error), true)));
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
  $("authStatus").textContent = errorMessage(error);
});
