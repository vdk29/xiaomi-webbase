-- Run against the existing schema. Test rows are rolled back, including audit rows.
begin;
do $$
declare original uuid; replacement uuid; image uuid; result jsonb;
begin
 perform set_config('request.jwt.claim.sub',(select user_id::text from public.webbase_staff where active and role='admin' limit 1),true);
 insert into public.webbase_products(name,sku,source_skus) values('__photo_reimport_test__','__TEST_PHOTO_998877','{__TEST_PHOTO_998877}') returning id into original;
 insert into public.webbase_product_images(product_id,storage_path,mime_type,is_primary)
 values(original,'products/'||original||'/'||gen_random_uuid()||'.webp','image/webp',true) returning id into image;
 insert into public.webbase_product_images(product_id,storage_path,mime_type)
 select original,'products/'||original||'/'||gen_random_uuid()||'.webp','image/webp' from generate_series(1,2);
 delete from public.webbase_products where id=original;
 if not exists(select 1 from public.webbase_product_images where id=image and product_id is null) then raise exception 'Photo lost after delete'; end if;
 insert into public.webbase_products(name,sku) values('__wrong_photo_test__','__WRONG_998877');
 if not exists(select 1 from public.webbase_product_images where id=image and product_id is null) then raise exception 'Matched by suffix instead of full SKU'; end if;
 result:=public.webbase_apply_import('photo-reimport-test.xlsx',jsonb_build_array(jsonb_build_object(
  'name','__photo_reimport_test__','source_key','__photo_reimport_test__','sku','__TEST_PHOTO_998877',
  'source_skus',jsonb_build_array('__TEST_PHOTO_998877'),'warehouse',2,'display',1,'ldu',0)));
 select id into replacement from public.webbase_products where sku='__TEST_PHOTO_998877';
 if replacement=original or replacement is null then raise exception 'New UUID expected'; end if;
 if not exists(select 1 from public.webbase_product_images where id=image and product_id=replacement and is_primary) then raise exception 'Photo not restored by import'; end if;
 if (select warehouse from public.webbase_stock where product_id=replacement)<>2 then raise exception 'Import stock failed'; end if;
 if (select count(*) from public.webbase_product_images where product_id=replacement)<>3 then raise exception 'Full gallery not restored'; end if;
 if (select count(*) from public.webbase_product_images where product_id=replacement and is_primary)<>1 then raise exception 'Primary photo not unique'; end if;
 begin
  insert into public.webbase_product_images(product_id,storage_path,mime_type) values(replacement,'products/'||replacement||'/'||gen_random_uuid()||'.webp','image/webp');
  raise exception 'Limit not enforced';
 exception when raise_exception then if sqlerrm='Limit not enforced' then raise; end if; end;
end $$;
select 'PASS: real import RPC restores photo after deletion, stock preserved, fourth image rejected' result;
rollback;
