-- SKU-less network cards use the same persistent photo registry with a namespaced internal key.
create or replace function private.webbase_image_identity_guard()
returns trigger language plpgsql set search_path = '' as $$
declare keys text[];
begin
 if new.product_id is not null then
  select case when network_origin and cardinality(private.webbase_sku_keys(sku,source_skus))=0 then array['network:'||md5(public.webbase_network_key(name))] else private.webbase_sku_keys(sku,source_skus) end into keys
  from public.webbase_products where id=new.product_id for update;
  if cardinality(keys)=0 then raise exception 'У товара должен быть артикул для сохранения фотографий'; end if;
  new.sku_keys := keys;
  if tg_op='INSERT' or new.product_id is distinct from old.product_id then
   if (select count(*) from public.webbase_product_images where product_id=new.product_id and id<>new.id)>=3 then
    raise exception 'У товара может быть не более 3 фотографий';
   end if;
  end if;
 end if;
 return new;
end; $$;
create or replace function private.webbase_restore_images()
returns trigger language plpgsql set search_path = '' as $$
declare keys text[]; image record; primary_exists boolean;
begin
 keys:=private.webbase_sku_keys(new.sku,new.source_skus);
 if cardinality(keys)=0 and new.network_origin then keys:=array['network:'||md5(public.webbase_network_key(new.name))];end if;
 if cardinality(keys)=0 then return new; end if;
 -- Never guess when multiple cards claim the same complete SKU.
 if exists(select 1 from public.webbase_products p where p.id<>new.id
  and private.webbase_sku_keys(p.sku,p.source_skus) && keys) then return new; end if;
 for image in select id from public.webbase_product_images
  where product_id is null and sku_keys && keys order by is_primary desc,sort_order,created_at for update
 loop
  exit when (select count(*) from public.webbase_product_images where product_id=new.id)>=3;
  select exists(select 1 from public.webbase_product_images where product_id=new.id and is_primary) into primary_exists;
  update public.webbase_product_images set product_id=new.id,is_primary=not primary_exists where id=image.id;
 end loop;
 return new;
end; $$;
