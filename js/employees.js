import { $, escapeHtml, formatDate, setBusy, errorMessage } from "./utils.js?v=20261023-3";

async function invoke(db, body) {
  const { data, error } = await db.client.functions.invoke("webbase-create-staff", { body });
  if (error) throw new Error(data?.message || error.message);
  if (!data?.ok) throw new Error(data?.message || "Операция не выполнена.");
  return data;
}

export async function loadEmployees(db) {
  const data = await invoke(db, { action: "list" });
  return data.staff || [];
}

export function initializeEmployees(db, state, notify) {
  $("staffForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.submitter;
    setBusy(button, true, "Создаю…");
    try {
      const form = new FormData(event.currentTarget);
      await invoke(db, {
        action: "create",
        username: form.get("username"),
        displayName: form.get("displayName"),
        password: form.get("password"),
        role: form.get("role"),
      });
      event.currentTarget.reset();
      notify("Сотрудник создан. Передайте временный пароль лично.");
      await refreshEmployees(db, state, notify);
    } catch (error) {
      notify(errorMessage(error), true);
    } finally {
      setBusy(button, false);
    }
  });

  $("staffList").addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const user = state.staff.find((item) => item.userId === button.dataset.userId);
    if (!user) return;
    const action = button.dataset.action;
    let body = { action, userId: user.userId };
    if (action === "password") {
      const password = prompt(`Новый временный пароль для ${user.username || user.displayName}:`);
      if (password === null) return;
      body = { ...body, password };
    } else if (action === "role") {
      body = { ...body, role: user.role === "admin" ? "staff" : "admin" };
      if (!confirm(`Изменить роль на «${body.role === "admin" ? "Администратор" : "Сотрудник"}»?`)) return;
    } else if (action === "delete") {
      if (!confirm(`Безвозвратно удалить учётную запись «${user.username || user.displayName}»? Товары и история останутся.`)) return;
      if (!confirm("Подтвердите удаление ещё раз. Это действие нельзя отменить.")) return;
    } else if (!confirm(`${action === "block" ? "Заблокировать" : "Разблокировать"} сотрудника?`)) return;

    setBusy(button, true);
    try {
      await invoke(db, body);
      notify("Учётная запись обновлена.");
      await refreshEmployees(db, state, notify);
    } catch (error) {
      notify(errorMessage(error), true);
    } finally {
      setBusy(button, false);
    }
  });
}

export async function refreshEmployees(db, state, notify) {
  try {
    state.staff = await loadEmployees(db);
    renderEmployees(state);
  } catch (error) {
    notify(errorMessage(error), true);
  }
}

export function renderEmployees(state) {
  const container = $("staffList");
  container.innerHTML = state.staff.map((user) => {
    const isSelf = user.userId === state.user.id;
    const status = user.active ? "Активен" : "Заблокирован";
    return `<article class="staff-card">
      <div class="staff-card__main">
        <span class="status ${user.active ? "status--ok" : "status--blocked"}">${status}</span>
        <h3>${escapeHtml(user.displayName || user.username || "Сотрудник")}</h3>
        <p><code>${escapeHtml(user.username || user.email || "email-вход")}</code></p>
        <p class="muted">${user.role === "admin" ? "Администратор" : "Сотрудник"} · создан ${formatDate(user.createdAt)}</p>
        ${user.lastSignInAt ? `<p class="muted">Последний вход: ${formatDate(user.lastSignInAt)}</p>` : ""}
      </div>
      <div class="staff-actions">
        <button class="button ghost small" data-action="password" data-user-id="${user.userId}">Сменить пароль</button>
        <button class="button ghost small" data-action="role" data-user-id="${user.userId}" ${isSelf ? "disabled" : ""}>${user.role === "admin" ? "Сделать сотрудником" : "Сделать администратором"}</button>
        <button class="button ghost small" data-action="${user.active ? "block" : "unblock"}" data-user-id="${user.userId}" ${isSelf ? "disabled" : ""}>${user.active ? "Заблокировать" : "Разблокировать"}</button>
        <button class="button danger small" data-action="delete" data-user-id="${user.userId}" ${isSelf ? "disabled" : ""}>Удалить</button>
      </div>
    </article>`;
  }).join("");
}
