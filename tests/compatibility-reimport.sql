-- Real import RPC, metadata persistence and new consumables. All writes roll back.
begin;
do $$
declare p public.webbase_products%rowtype; s public.webbase_stock%rowtype; result jsonb;
begin
 perform set_config('request.jwt.claim.sub',(select user_id::text from public.webbase_staff where active and role='admin' limit 1),true);
 select * into strict p from public.webbase_products where sku='4640171485785';
 select * into strict s from public.webbase_stock where product_id=p.id;
 if p.specs->'_compatibility'->>'part_code' is distinct from 'B112-ZS' then raise exception 'Missing reviewed record'; end if;
 result:=public.webbase_apply_import('compatibility-test.xlsx',jsonb_build_array(jsonb_build_object(
  'name',p.source_name,'source_key',p.external_id,'sku',p.sku,'source_skus',to_jsonb(p.source_skus),
  'category',p.category,'warehouse',s.warehouse,'display',s.display,'ldu',s.ldu)));
 if result->>'updated'<>'1' or result->>'created'<>'0' then raise exception 'Unexpected existing-item result'; end if;
 if not exists(select 1 from public.webbase_products a where a.id=p.id and a.specs=p.specs and a.description=p.description) then
  raise exception 'Compatibility, sources or description overwritten by import';
 end if;
 result:=public.webbase_apply_import('new-consumable-test.xlsx',jsonb_build_array(jsonb_build_object(
  'name','Салфетка для пылесоса Xiaomi Robot Vacuum S20+ __COMPAT_TEST__',
  'source_key','__COMPAT_TEST__','sku','__COMPAT_TEST__','source_skus',jsonb_build_array('__COMPAT_TEST__'),
  'category','Аксессуары для пылесосов','warehouse',2,'display',0,'ldu',0)));
 if result->>'created'<>'1' then raise exception 'New consumable import failed'; end if;
 if not exists(select 1 from public.webbase_products a where a.sku='__COMPAT_TEST__' and a.category='Аксессуары для пылесосов'
  and not (a.specs ? '_compatibility')) then raise exception 'New accessory borrowed unverified metadata'; end if;
end $$;
set local role authenticated;
do $$ begin
 if not exists(select 1 from public.webbase_products where sku='4640171485785' and specs->'_compatibility'->>'part_code'='B112-ZS') then
  raise exception 'Compatibility not readable with existing RLS'; end if;
end $$;
reset role;
select 'PASS: import retains compatibility and sources; new consumable created without guessed cross-model data; existing RLS works' result;
rollback;
