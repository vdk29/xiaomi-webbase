export const $ = (id) => document.getElementById(id);

export const normalizeText = (value) => String(value ?? "")
  .trim()
  .toLocaleLowerCase("ru-RU")
  .replace(/ё/g, "е")
  .replace(/\s+/g, " ");

export const escapeHtml = (value) => String(value ?? "").replace(
  /[&<>"']/g,
  (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
);

export const parseQuantity = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const normalized = String(value).replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(?:\.0+)?$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
};

export const splitSkus = (value) => String(value ?? "")
  .split(/\s*\/\s*|\s*[;,]\s*/)
  .map((item) => item.trim())
  .filter(Boolean);

export const debounce = (callback, delay = 120) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(...args), delay);
  };
};

export const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const setBusy = (element, busy, busyText = "Сохраняю…") => {
  if (!element) return;
  if (busy) {
    element.dataset.originalText = element.textContent;
    element.textContent = busyText;
    element.disabled = true;
  } else {
    element.textContent = element.dataset.originalText || element.textContent;
    element.disabled = false;
  }
};

export const errorMessage = (error, fallback = "Не удалось выполнить операцию") => {
  const raw = error?.message || fallback;
  if (error?.code === 'READ_TIMEOUT' || /failed to fetch|networkerror|network request failed|load failed|err_connection|econnreset|connection reset/i.test(raw)) return 'Соединение с сервером прервалось. Проверьте подключение и повторите загрузку.';
  if (/invalid login credentials/i.test(raw)) return "Неверный логин или пароль.";
  if (/user is banned/i.test(raw)) return "Учётная запись заблокирована.";
  if (/jwt expired/i.test(raw)) return "Сессия истекла. Войдите снова.";
  return raw;
};

export const placeholderSvg = (label = "mi") => {
  const safeLabel = String(label).slice(0, 20).replace(/[&<>"']/g, "");
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><rect width="640" height="480" fill="#f7f7f8"/><rect x="270" y="190" width="100" height="100" rx="24" fill="#ff6900"/><text x="320" y="255" text-anchor="middle" font-family="Arial" font-size="42" font-weight="700" fill="white">mi</text><text x="320" y="335" text-anchor="middle" font-family="Arial" font-size="20" fill="#8b8f97">${safeLabel}</text></svg>`)}`;
};
