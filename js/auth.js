import { errorMessage } from "./utils.js?v=20261024-8";
import { readWithRetry, abortableRead } from './network.js?v=20261024-8';

export async function getAccessContext(db) {
  const session = await db.getSession();
  if (!session?.user) return { session: null, user: null, profile: null, admin: false };

  const { data: profile, error } = await readWithRetry(signal => abortableRead(db.client
    .from("webbase_staff")
    .select("user_id,username,display_name,role,active,created_at")
    .eq("user_id", session.user.id)
    .maybeSingle(), signal));
  if (error) throw error;
  return {
    session,
    user: session.user,
    profile,
    admin: profile?.active === true && profile?.role === "admin",
  };
}

export async function signIn(db, login, password) {
  try {
    return await db.signIn(login, password);
  } catch (error) {
    throw new Error(errorMessage(error));
  }
}

export async function requireApprovedUser(db, { admin = false } = {}) {
  const context = await getAccessContext(db);
  if (!context.user) {
    const next = encodeURIComponent(location.pathname + location.search);
    location.replace(`index.html?next=${next}`);
    return null;
  }
  if (!context.profile?.active) {
    await db.signOut().catch(() => {});
    location.replace("index.html?blocked=1");
    return null;
  }
  if (admin && !context.admin) throw new Error("Недостаточно прав.");
  return context;
}

export function safeNextUrl(raw) {
  if (!raw) return null;
  try {
    const url = new URL(raw, location.href);
    return url.origin === location.origin ? `${url.pathname}${url.search}` : null;
  } catch {
    return null;
  }
}
