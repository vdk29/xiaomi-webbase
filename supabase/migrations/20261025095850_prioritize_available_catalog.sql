-- Live availability; no denormalized stock, no changes to products or quantities.
-- Underlying product/stock RLS is evaluated as the authenticated caller.
create or replace view public.webbase_catalog
with (security_invoker = true) as
select p.*, (coalesce(s.warehouse,0) + coalesce(s.display,0) > 0) as catalog_in_stock
from public.webbase_products p
left join public.webbase_stock s on s.product_id = p.id;
revoke all on public.webbase_catalog from public, anon;
grant select on public.webbase_catalog to authenticated;
notify pgrst, 'reload schema';
