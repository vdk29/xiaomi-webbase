import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const allowedOrigins = new Set([
  "https://vdk29.github.io",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);

const corsHeaders = (req: Request) => {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://vdk29.github.io",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
  };
};

const reply = (req: Request, status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders(req) });

const canonicalUsername = (value: unknown) => String(value ?? "").trim().toLocaleLowerCase("ru-RU");
const usernameToEmail = (username: string) => {
  const bytes = new TextEncoder().encode(username);
  return `staff-${Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("")}@users.webbase.invalid`;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders(req) });
  if (req.method !== "POST") return reply(req, 405, { ok: false, message: "Method not allowed" });
  const origin = req.headers.get("origin");
  if (origin && !allowedOrigins.has(origin)) return reply(req, 403, { ok: false, message: "Origin not allowed" });

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !serviceKey || !publishableKey) return reply(req, 500, { ok: false, message: "Server configuration error" });
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return reply(req, 401, { ok: false, message: "Требуется вход" });

  const authClient = createClient(url, publishableKey, { auth: { persistSession: false } });
  const { data: { user }, error: userError } = await authClient.auth.getUser(token);
  if (userError || !user) return reply(req, 401, { ok: false, message: "Сессия недействительна" });
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: caller, error: callerError } = await admin
    .from("webbase_staff").select("role,active").eq("user_id", user.id).maybeSingle();
  if (callerError || caller?.role !== "admin" || !caller.active) {
    return reply(req, 403, { ok: false, message: "Доступ только для администратора" });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return reply(req, 400, { ok: false, message: "Некорректный JSON" }); }
  const action = String(body.action || "create");
  const targetId = String(body.userId || "");
  if (["block", "role", "delete"].includes(action) && targetId === user.id) {
    return reply(req, 400, { ok: false, message: "Нельзя изменить собственный доступ этой операцией" });
  }

  try {
    if (action === "list") {
      const { data: staff, error } = await admin.from("webbase_staff")
        .select("user_id,username,display_name,role,active,created_at")
        .order("created_at");
      if (error) throw error;
      const { data: authData, error: authError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (authError) throw authError;
      const users = new Map(authData.users.map((item) => [item.id, item]));
      return reply(req, 200, {
        ok: true,
        staff: staff.map((item) => {
          const authUser = users.get(item.user_id);
          const synthetic = authUser?.email?.endsWith("@users.webbase.invalid");
          return {
            userId: item.user_id,
            username: item.username,
            displayName: item.display_name,
            email: synthetic ? null : authUser?.email,
            role: item.role,
            active: item.active,
            createdAt: item.created_at,
            lastSignInAt: authUser?.last_sign_in_at || null,
          };
        }),
      });
    }

    if (action === "create") {
      const username = canonicalUsername(body.username);
      const displayName = String(body.displayName || "").trim();
      const password = String(body.password || "");
      const role = body.role === "admin" ? "admin" : "staff";
      if (!/^[\p{L}\p{N}_-]{2,32}$/u.test(username)) return reply(req, 400, { ok: false, message: "Логин: 2–32 буквы, цифры, _ или -" });
      if (displayName.length < 2 || displayName.length > 80) return reply(req, 400, { ok: false, message: "Укажите имя сотрудника" });
      if (password.length < 8 || password.length > 72) return reply(req, 400, { ok: false, message: "Пароль должен содержать 8–72 символа" });
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: usernameToEmail(username), password, email_confirm: true,
        app_metadata: { webbase_role: role }, user_metadata: { username, display_name: displayName },
      });
      if (createError || !created.user) return reply(req, 409, { ok: false, message: "Логин уже занят или пароль не прошёл проверку" });
      const { error: insertError } = await admin.from("webbase_staff").insert({
        user_id: created.user.id, username, display_name: displayName, role, active: true,
      });
      if (insertError) {
        await admin.auth.admin.deleteUser(created.user.id);
        throw insertError;
      }
      return reply(req, 200, { ok: true, created: true, username });
    }

    if (!/^[0-9a-f-]{36}$/i.test(targetId)) return reply(req, 400, { ok: false, message: "Некорректный пользователь" });
    if (action === "password") {
      const password = String(body.password || "");
      if (password.length < 8 || password.length > 72) return reply(req, 400, { ok: false, message: "Пароль должен содержать 8–72 символа" });
      const { error } = await admin.auth.admin.updateUserById(targetId, { password });
      if (error) throw error;
    } else if (action === "block" || action === "unblock") {
      const active = action === "unblock";
      const { error: profileError } = await admin.from("webbase_staff").update({ active, updated_at: new Date().toISOString() }).eq("user_id", targetId);
      if (profileError) throw profileError;
      const { error: authError } = await admin.auth.admin.updateUserById(targetId, { ban_duration: active ? "none" : "876000h" });
      if (authError) {
        await admin.from("webbase_staff").update({ active: !active }).eq("user_id", targetId);
        throw authError;
      }
    } else if (action === "role") {
      const role = body.role === "admin" ? "admin" : "staff";
      const { error: profileError } = await admin.from("webbase_staff").update({ role, updated_at: new Date().toISOString() }).eq("user_id", targetId);
      if (profileError) throw profileError;
      const { error: authError } = await admin.auth.admin.updateUserById(targetId, { app_metadata: { webbase_role: role } });
      if (authError) throw authError;
    } else if (action === "delete") {
      const { error } = await admin.auth.admin.deleteUser(targetId);
      if (error) throw error;
    } else {
      return reply(req, 400, { ok: false, message: "Неизвестная операция" });
    }
    return reply(req, 200, { ok: true });
  } catch (error) {
    console.error("webbase staff operation failed", action, error);
    return reply(req, 500, { ok: false, message: "Операция не выполнена. Проверьте данные и повторите." });
  }
});

