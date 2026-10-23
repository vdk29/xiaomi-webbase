# Xiaomi WebBase — Supabase foundation

Project: `dazniyfntumbljkocjoo` (Supabase Free).
The project has **not** been switched over to remote persistence yet.

## Database ready
- `webbase_staff`: user_id, role (staff/admin), active (defaults false)
- `webbase_products`: catalog, SKU, variants, image_path
- `webbase_stock`: warehouse, display, LDU
- `webbase_stock_history`: changes audit
- `webbase_imports`: import metadata
- private Storage bucket `webbase-products`

RLS is enabled. Reads require a signed-in user whose `webbase_staff.active = true`.
Writes are admin-only. Do not enable anonymous read/write to solve authorization errors.

## Bootstrap the first admin
1. Create your account using Supabase Auth dashboard (or a controlled signup flow).
2. Copy your Auth user's UUID from the dashboard.
3. In SQL Editor, execute (replace the placeholder UUID with the real user UUID):
```sql
insert into public.webbase_staff (user_id, display_name, role, active)
values ('YOUR_AUTH_USER_UUID', 'Administrator', 'admin', true)
on conflict (user_id) do update
set role = 'admin', active = true;
```
Never commit passwords or service-role keys.

## Frontend integration
- `supabase-config.js` holds only the **public** project URL and publishable key.
- `supabase-client.js` provides auth, catalog read, and signed image URL helpers.
- To enable it, include a pinned `@supabase/supabase-js` browser SDK before these scripts.
- Existing `app.js` still reads/writes `localStorage`; **do not claim live sync yet**.
- Next work: login UI, approved staff session handling, migration of catalog search and writes to the adapter, safe preview and confirmation of Excel imports, stock audit, photo assignment.
- Do not upload old Excel data without validating headers, categories and quantities.
- Preserve the existing GitHub Pages deployment until the new flow is tested.
