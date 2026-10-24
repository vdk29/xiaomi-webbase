-- Keep image records and Storage paths when a product UUID is replaced.
create or replace function private.webbase_sku_keys(p_sku text, p_sources text[])
returns text[] language sql immutable set search_path = '' as $$
 select coalesce(array_agg(distinct lower(trim(v))) filter(where trim(v) <> ''), '{}'::text[])
 from unnest(coalesce(p_sources,'{}'::text[]) || regexp_split_to_array(coalesce(p_sku,''), '\s*[/;,]\s*')) v;
$$;
revoke all on function private.webbase_sku_keys(text,text[]) from public,anon;
grant execute on function private.webbase_sku_keys(text,text[]) to authenticated,service_role;
alter table public.webbase_product_images add column sku_keys text[] not null default '{}';
alter table public.webbase_product_images add column source_url text;
update public.webbase_product_images i set sku_keys=private.webbase_sku_keys(p.sku,p.source_skus)
from public.webbase_products p where p.id=i.product_id;
alter table public.webbase_product_images alter column product_id drop not null;
alter table public.webbase_product_images drop constraint webbase_product_images_product_id_fkey;
alter table public.webbase_product_images add constraint webbase_product_images_product_id_fkey
foreign key(product_id) references public.webbase_products(id) on delete set null;
alter table public.webbase_product_images drop constraint webbase_product_images_path_check;
alter table public.webbase_product_images add constraint webbase_product_images_path_check
check(storage_path ~ '^products/[0-9a-f-]{36}/[0-9a-f-]+\.(webp|jpg|jpeg|png)$');
create index webbase_images_sku_keys_idx on public.webbase_product_images using gin(sku_keys);

create or replace function private.webbase_image_identity_guard()
returns trigger language plpgsql set search_path = '' as $$
declare keys text[];
begin
 if new.product_id is not null then
  select private.webbase_sku_keys(sku,source_skus) into keys
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
create trigger webbase_image_identity_guard before insert or update of product_id,sku_keys
on public.webbase_product_images for each row execute function private.webbase_image_identity_guard();

create or replace function private.webbase_restore_images()
returns trigger language plpgsql set search_path = '' as $$
declare keys text[]; image record; primary_exists boolean;
begin
 keys:=private.webbase_sku_keys(new.sku,new.source_skus);
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
create trigger webbase_restore_images after insert or update of sku,source_skus
on public.webbase_products for each row execute function private.webbase_restore_images();
grant usage on schema private to service_role;
