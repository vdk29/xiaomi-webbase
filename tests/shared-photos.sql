-- Integration checks against the existing project; all fixtures/imports roll back.
begin;
do $$
declare donor uuid; target uuid; other uuid; photo uuid; own_photo uuid; result jsonb; count_images integer;
begin
 perform set_config('request.jwt.claim.sub',(select user_id::text from public.webbase_staff where active and role='admin' limit 1),true);
 if private.webbase_photo_variant_key('Смартфон Xiaomi 17T Pro 12GB+256GB Black') is distinct from
    private.webbase_photo_variant_key('Смартфон Xiaomi 17T Pro Black 16/1024 GB') then raise exception 'Memory format mismatch'; end if;
 if private.webbase_photo_variant_key('Смартфон Xiaomi 17T Pro 1ТБ Black') is distinct from
    private.webbase_photo_variant_key('Смартфон Xiaomi 17T Pro 1024GB Black') then raise exception 'TB mismatch'; end if;
 if private.webbase_photo_variant_key('Смартфон Xiaomi 17T Pro 256GB') is not null or
    private.webbase_photo_variant_key('Смартфон Xiaomi 17T Pro Black') is not null or
    private.webbase_photo_variant_key('Ремешок Xiaomi 17T Pro 256GB Black') is not null then raise exception 'Unsafe missing identity'; end if;
 insert into public.webbase_products(name,sku) values('Смартфон Xiaomi __GalleryQA__17T Pro 12GB+256GB Black','__GALLERY_DONOR__') returning id into donor;
 insert into public.webbase_product_images(product_id,storage_path,mime_type,is_primary)
 values(donor,'products/'||donor||'/'||gen_random_uuid()||'.webp','image/webp',true) returning id into photo;
 insert into public.webbase_product_images(product_id,storage_path,mime_type,sort_order)
 select donor,'products/'||donor||'/'||gen_random_uuid()||'.webp','image/webp',s from generate_series(1,2) s;
 result:=public.webbase_apply_import('shared-gallery-test.xlsx',jsonb_build_array(jsonb_build_object(
  'name','Смартфон Xiaomi __GalleryQA__17T Pro 16GB+1024GB Black','source_key','__GALLERY_TARGET__',
  'sku','__GALLERY_TARGET__','source_skus',jsonb_build_array('__GALLERY_TARGET__'),'category','Смартфоны',
  'warehouse',2,'display',1,'ldu',0)));
 select id into target from public.webbase_products where sku='__GALLERY_TARGET__';
 if result->>'created'<>'1' then raise exception 'Import did not create variant'; end if;
 select count(*) into count_images from public.webbase_shared_product_images(array[target]);
 if count_images<>3 then raise exception 'Imported variant missing full gallery: %',count_images; end if;
 if not exists(select 1 from public.webbase_shared_product_images(array[target]) where image->>'id'=photo::text) then raise exception 'Wrong gallery'; end if;
 if exists(select 1 from public.webbase_product_images where product_id=target) then raise exception 'Unnecessary duplicate photo records'; end if;
 if exists(select 1 from public.webbase_shared_product_images(array[donor])) then raise exception 'Own gallery overridden'; end if;
 -- Different color, model, brand, network version and color modifier must not match.
 for result in select jsonb_build_object('name',n) from unnest(array[
  'Смартфон Xiaomi __GalleryQA__17T Pro 256GB White',
  'Смартфон Xiaomi __GalleryQA__17T 256GB Black',
  'Смартфон Xiaomi __GalleryQA__17T Pro Max 256GB Black',
  'Смартфон REDMI __GalleryQA__17T Pro 256GB Black',
  'Смартфон Xiaomi __GalleryQA__17T Pro 5G 256GB Black',
  'Смартфон Xiaomi __GalleryQA__17T Pro 256GB Dark Black']) n
 loop
  insert into public.webbase_products(name,sku) values(result->>'name','__GALLERY_OTHER__'||gen_random_uuid()) returning id into other;
  if exists(select 1 from public.webbase_shared_product_images(array[other])) then raise exception 'Wrong identity matched: %',result; end if;
 end loop;
 -- A second donor must never mix galleries.
 insert into public.webbase_products(name,sku) values('Смартфон Xiaomi __GalleryQA__17T Pro 8GB+512GB Black','__GALLERY_DONOR_2__') returning id into other;
 insert into public.webbase_product_images(product_id,storage_path,mime_type)
 values(other,'products/'||other||'/'||gen_random_uuid()||'.webp','image/webp');
 if (select count(*) from public.webbase_shared_product_images(array[target]))<>3 then raise exception 'Mixed donor galleries'; end if;
 -- A manually uploaded own photo immediately wins, without touching the donor.
 insert into public.webbase_product_images(product_id,storage_path,mime_type,is_primary)
 values(target,'products/'||target||'/'||gen_random_uuid()||'.webp','image/webp',true) returning id into own_photo;
 if exists(select 1 from public.webbase_shared_product_images(array[target])) then raise exception 'Manual image overridden'; end if;
 delete from public.webbase_product_images where id=own_photo;
 -- Archive donors: no inheritance from an archived product.
 update public.webbase_products set active=false where id in(donor,other);
 if exists(select 1 from public.webbase_shared_product_images(array[target])) then raise exception 'Archived donor used'; end if;
 update public.webbase_products set active=true where id in(donor,other);
 -- Original SKU removed: key survives orphaning, new memory variant still resolves.
 delete from public.webbase_products where id=donor;
 if not exists(select 1 from public.webbase_shared_product_images(array[target]) where image->>'id'=photo::text) then raise exception 'Orphan gallery lost'; end if;
 -- Recreated original SKU restores its own photos, preserving the same shared files.
 insert into public.webbase_products(name,sku) values('Смартфон Xiaomi __GalleryQA__17T Pro 12GB+256GB Black','__GALLERY_DONOR__') returning id into donor;
 if not exists(select 1 from public.webbase_product_images where id=photo and product_id=donor) then raise exception 'SKU restoration broken'; end if;
 update public.webbase_products set name='Смартфон Xiaomi __GalleryQA__17T Pro 12GB+256GB Blue' where id=donor;
 if exists(select 1 from public.webbase_shared_product_images(array[target]) where image->>'id'=photo::text) then raise exception 'Stale color key'; end if;
end $$;
-- Actual authenticated role uses the RLS-protected API, without SECURITY DEFINER.
set local role authenticated;
do $$ begin
 if not exists(select 1 from public.webbase_shared_product_images(array(select id from public.webbase_products where sku='__GALLERY_TARGET__'))) then
  raise exception 'Staff cannot read matching gallery through RLS';
 end if;
 perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000000',true);
 if exists(select 1 from public.webbase_shared_product_images(array(select id from public.webbase_products))) then raise exception 'Non-staff access'; end if;
end $$;
reset role;
select 'PASS: import, model/color separation, own photos, gallery limit, orphan/SKU restore, rename, staff RLS' result;
rollback;
