# Xiaomi WebBase — Supabase

Project ref: `dazniyfntumbljkocjoo`.

## Production objects

- `webbase_staff` — username, display name, role and active status.
- `webbase_products` — catalog and administrator-maintained fields.
- `webbase_stock` / `webbase_stock_history` — current stock and audit trail.
- `webbase_product_images` — private Storage paths and gallery metadata.
- `webbase_imports` — completed import audit records.
- private bucket `webbase-products` — 5 MB, JPG/PNG/WebP only.
- `webbase-create-staff` — authenticated admin-only Edge Function for staff lifecycle.

The migration in `supabase/migrations/20261023210000_complete_webbase.sql` is additive. It preserves existing product UUIDs and stock rows. `webbase_apply_import` applies all stock changes in one transaction and does not update descriptions, specs, images, manually changed names or non-empty categories.

## Security model

- `anon` has no table privileges for WebBase data.
- Active authenticated staff can read catalog, stock and private images.
- Only active administrators pass write RLS policies.
- Authorization helper functions live in the non-exposed `private` schema.
- Auth administration and the service-role key exist only inside the Edge Function.
- The legacy administrator can continue signing in with email; staff use case-insensitive usernames.

## Operational checks

After a deployment:

1. Run Supabase Security and Performance Advisers.
2. Confirm the `webbase-products` bucket remains private.
3. Compare product/stock counts and stock sums before and after migration.
4. Test employee creation with a temporary account, then delete the account.
5. Test an image on a non-critical product and remove it after verification if desired.
6. Enable leaked-password protection in Auth settings when the project plan supports it.
