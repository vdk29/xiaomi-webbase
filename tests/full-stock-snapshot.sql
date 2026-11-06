-- Run against the existing project. Every fixture and quantity change rolls back.
begin;
select set_config('request.jwt.claim.sub',(select user_id::text from public.webbase_staff where active and role='admin' limit 1),true);
set local role authenticated;
do $$
declare
 a uuid; b uuid; added uuid; result jsonb; payload jsonb; n integer; photos_before bigint;
 stock_before text; failed boolean; stock_after text;
begin
 if has_function_privilege('anon','public.webbase_apply_import(text,jsonb)','execute') then raise exception 'Anonymous import allowed'; end if;
 if (select prosecdef from pg_proc where oid='public.webbase_apply_import(text,jsonb)'::regprocedure) then raise exception 'Import bypasses RLS'; end if;
 select count(*) into photos_before from public.webbase_product_images;
 insert into public.webbase_products(external_id,sku,name,source_name,source_skus,category,description,specs)
 values('qa-snapshot-one','QA-SNAPSHOT-ONE','Manual name','Old source name',array['QA-SNAPSHOT-ONE','QA-OLD-ALIAS'],'Manual category','Keep description','{"keep":"specs"}') returning id into a;
 insert into public.webbase_products(external_id,sku,name,source_name,source_skus)
 values('qa-snapshot-absent','QA-SNAPSHOT-ABSENT','Absent test product','Absent test product',array['QA-SNAPSHOT-ABSENT']) returning id into b;
 insert into public.webbase_stock(product_id,warehouse,display,ldu) values(a,9,2,1),(b,7,3,1)
 on conflict(product_id) do update set warehouse=excluded.warehouse,display=excluded.display,ldu=excluded.ldu;
 payload:=jsonb_build_array(
 jsonb_build_object('source_key','new source name','name','New source name','sku','qa-snapshot-one','source_skus',jsonb_build_array('qa-snapshot-one'),'category','Auto category','warehouse',2,'display',1,'ldu',1),
 jsonb_build_object('source_key','qa-new-product','name','QA New product','sku','QA-SNAPSHOT-NEW','source_skus',jsonb_build_array('QA-SNAPSHOT-NEW'),'category','Auto category','warehouse',4,'display',0,'ldu',0));
 result:=public.webbase_apply_import('snapshot-fixture.xlsx',payload);
 if (result->>'created')::int<>1 or (result->>'updated')::int<>1 or (result->>'zeroed')::int<1 then raise exception 'Incorrect first import counts: %',result; end if;
 if (select warehouse from public.webbase_stock where product_id=a)<>2 then raise exception 'Stock added instead of replaced'; end if;
 if (select warehouse+display+ldu from public.webbase_stock where product_id=b)<>0 then raise exception 'Absent product kept old stock'; end if;
 if not exists(select 1 from public.webbase_products where id=a and name='Manual name' and category='Manual category' and description='Keep description' and specs='{"keep":"specs"}'::jsonb and 'QA-OLD-ALIAS'=any(source_skus)) then raise exception 'Manual fields or aliases lost'; end if;
 if (select count(*) from public.webbase_product_images)<>photos_before then raise exception 'Photos changed'; end if;
 select id into added from public.webbase_products where sku='QA-SNAPSHOT-NEW';
 result:=public.webbase_apply_import('snapshot-repeat.xlsx',payload);
 if (result->>'created')::int<>0 or (result->>'updated')::int<>2 or (select warehouse from public.webbase_stock where product_id=added)<>4 then raise exception 'Repeated import was not idempotent'; end if;
 select md5(string_agg(row_to_json(s)::text,'' order by product_id)) into stock_before from public.webbase_stock s;
 failed:=false;
 begin
  perform public.webbase_apply_import('snapshot-invalid.xlsx',jsonb_build_array(payload->0,(payload->1)||'{"warehouse":null}'::jsonb));
 exception when invalid_parameter_value then failed:=true;
 end;
 if not failed then raise exception 'Malformed report accepted'; end if;
 select md5(string_agg(row_to_json(s)::text,'' order by product_id)) into stock_after from public.webbase_stock s;
 if stock_before<>stock_after then raise exception 'Failed report changed stock'; end if;
 failed:=false;
 begin
  perform public.webbase_apply_import('snapshot-duplicate.xlsx',jsonb_build_array(payload->0,(payload->0)||'{"source_key":"another name","name":"Another name","warehouse":88}'::jsonb));
 exception when invalid_parameter_value then failed:=true;
 end;
 if not failed then raise exception 'Duplicate target overwrites stock'; end if;
 select md5(string_agg(row_to_json(s)::text,'' order by product_id)) into stock_after from public.webbase_stock s;
 if stock_before<>stock_after then raise exception 'Duplicate report changed stock'; end if;
 if exists(select 1 from public.webbase_catalog c join public.webbase_stock s on s.product_id=c.id where c.catalog_in_stock is distinct from(s.warehouse>0)) then raise exception 'Catalog counts display as sellable'; end if;
end $$;
-- A non-admin cannot use the import even if the UI is bypassed.
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000000',true);
do $$
begin
 begin
  perform public.webbase_apply_import('denied.xlsx','[{"warehouse":1}]');
  raise exception 'Unauthorized import accepted';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
select 'PASS: full replacement, missing zero, repeat, normalized SKU, manual fields/photos, rollback, duplicate rejection, RLS, warehouse-only availability' as result;
rollback;
