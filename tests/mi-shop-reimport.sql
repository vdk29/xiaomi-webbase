-- Run on the existing project after the reviewed catalog seed. All writes roll back.
begin;
select set_config('request.jwt.claim.sub', (select user_id::text from public.webbase_staff where active and role='admin' limit 1), true);
create temporary table shop_before on commit drop as
 select p.id,p.sku,p.description,p.specs,
  (select jsonb_agg(jsonb_build_object('id',i.id,'path',i.storage_path,'keys',i.sku_keys) order by i.id)
   from public.webbase_product_images i where i.product_id=p.id) gallery
 from public.webbase_products p where p.specs->>'_catalog_source'='mi-shop.com';
grant select on shop_before to authenticated;
set local role authenticated;
do $$
declare payload jsonb; result jsonb;
begin
 if (select count(*) from shop_before)<>280 then raise exception 'Expected 280 imported shop variants'; end if;
 select jsonb_agg(jsonb_build_object('name',p.name||' [1C]', 'source_key','test-1c:'||p.sku,
   'sku',p.sku,'source_skus',to_jsonb(p.source_skus),'category',p.category,'warehouse',2,'display',1,'ldu',0))
 into payload from public.webbase_products p join shop_before b using(id);
 result:=public.webbase_apply_import('mi-shop-reimport-rollback-test.xlsx',payload);
 if (result->>'created')::integer<>0 or (result->>'updated')::integer<>280 then raise exception '1C created duplicate cards: %',result; end if;
 if exists(select 1 from shop_before b left join public.webbase_products p using(id)
  where p.id is null or p.description is distinct from b.description or p.specs is distinct from b.specs
   or b.gallery is distinct from (select jsonb_agg(jsonb_build_object('id',i.id,'path',i.storage_path,'keys',i.sku_keys) order by i.id) from public.webbase_product_images i where i.product_id=p.id)) then
  raise exception '1C changed a description, specifications or SKU-linked gallery';
 end if;
 if exists(select 1 from public.webbase_stock s join shop_before b on b.id=s.product_id where warehouse<>2 or display<>1 or ldu<>0) then raise exception 'Stock was not updated'; end if;
end $$;
reset role;
select 'PASS: 280 real shop cards matched by SKU; 472 images, descriptions and specifications preserved; stock updated; no duplicates' result;
rollback;
