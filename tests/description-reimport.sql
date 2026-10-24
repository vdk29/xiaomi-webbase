-- Verify that the actual import RPC preserves an existing description and sources.
-- Reuses one real product with unchanged stock; all writes/audit records roll back.
begin;
do $$
declare p public.webbase_products%rowtype; s public.webbase_stock%rowtype; result jsonb;
begin
 perform set_config('request.jwt.claim.sub',(select user_id::text from public.webbase_staff where active and role='admin' limit 1),true);
 select * into strict p from public.webbase_products where sku='Mi17TPROBL12GB256GB';
 select * into strict s from public.webbase_stock where product_id=p.id;
 if nullif(trim(p.description),'') is null then raise exception 'Expected published description'; end if;
 result:=public.webbase_apply_import('description-preservation-test.xlsx',jsonb_build_array(jsonb_build_object(
  'name',p.source_name,'source_key',p.external_id,'sku',p.sku,'source_skus',to_jsonb(p.source_skus),
  'category',p.category,'warehouse',s.warehouse,'display',s.display,'ldu',s.ldu)));
 if result->>'updated'<>'1' or result->>'created'<>'0' then raise exception 'Unexpected import result'; end if;
 if not exists(select 1 from public.webbase_products a where a.id=p.id and a.description=p.description and a.specs=p.specs) then
  raise exception 'Description or provenance overwritten';
 end if;
end $$;
set local role authenticated;
select count(*) as staff_visible_descriptions from public.webbase_products where active and nullif(trim(description),'') is not null;
reset role;
select 'PASS: descriptions and provenance survive the real import RPC' result;
rollback;
