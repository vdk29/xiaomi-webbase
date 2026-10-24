-- Share one stored gallery between memory variants. Never copy/delete Storage files.
-- Keep Pro, Max, 4G/5G and the full color phrase in the key; strip only RAM/storage.
create or replace function private.webbase_photo_variant_key(p_name text)
returns text language plpgsql immutable set search_path = '' as $$
declare n text; stripped text;
begin
 n := lower(trim(regexp_replace(replace(coalesce(p_name,''),chr(160),' '),'\s+',' ','g')));
 if n !~ '^(смартфон|планшет) ' then return null; end if;
 -- 12GB+256GB, 12/256 GB, 256ГБ, 1 TB, including spaces around separators.
 stripped := regexp_replace(n,'\m[0-9]+([.,][0-9]+)?\s*(gb|гб|tb|тб)?\s*[+/]\s*[0-9]+([.,][0-9]+)?\s*(gb|гб|tb|тб)\M',' ','g');
 stripped := regexp_replace(stripped,'\m[0-9]+([.,][0-9]+)?\s*(gb|гб|tb|тб)\M',' ','g');
 if stripped=n then return null; end if;
 stripped := trim(regexp_replace(stripped,'\s+',' ','g'));
 -- Unknown/missing colors are deliberately not guessed. Keep modifiers, e.g. Dark Black.
 if stripped !~ ' (black|white|blue|green|purple|violet|gray|grey|silver|gold|pink|orange|yellow|red|teal|titanium|черный|чёрный|белый|синий|голубой|зеленый|зелёный|фиолетовый|серый|серебристый|золотой|розовый|оранжевый|красный)$' then return null; end if;
 return stripped;
end; $$;
revoke all on function private.webbase_photo_variant_key(text) from public,anon;
grant execute on function private.webbase_photo_variant_key(text) to authenticated,service_role;

alter table public.webbase_product_images add column variant_key text;
update public.webbase_product_images i set variant_key=private.webbase_photo_variant_key(p.name)
from public.webbase_products p where p.id=i.product_id;
create index webbase_images_variant_key_idx on public.webbase_product_images(variant_key) where variant_key is not null;

create function private.webbase_image_variant_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
 if new.product_id is not null then
  select private.webbase_photo_variant_key(name) into new.variant_key from public.webbase_products where id=new.product_id;
 elsif tg_op='INSERT' then new.variant_key:=null;
 else new.variant_key:=old.variant_key;
 end if;
 return new;
end; $$;
create trigger webbase_image_variant_guard before insert or update of product_id,variant_key
on public.webbase_product_images for each row execute function private.webbase_image_variant_guard();

create function private.webbase_refresh_image_variant()
returns trigger language plpgsql set search_path = '' as $$
begin
 update public.webbase_product_images set variant_key=private.webbase_photo_variant_key(new.name) where product_id=new.id;
 return new;
end; $$;
create trigger webbase_refresh_image_variant after update of name on public.webbase_products
for each row when (old.name is distinct from new.name) execute function private.webbase_refresh_image_variant();

-- Invoker permissions and existing RLS apply. Own galleries always win.
-- Pick ONE donor gallery, never mix photos from several cards. Orphan galleries
-- retain their key, so reimport also works when the original SKU is not in the file.
create function public.webbase_shared_product_images(p_product_ids uuid[])
returns table(target_product_id uuid, image jsonb)
language sql stable security invoker set search_path = '' as $$
 select p.id, jsonb_build_object(
  'id',i.id,'storage_path',i.storage_path,'sort_order',i.sort_order,'is_primary',i.is_primary,
  'mime_type',i.mime_type,'byte_size',i.byte_size,'width',i.width,'height',i.height,
  'created_at',i.created_at,'original_name',i.original_name,'source_url',i.source_url,
  'inherited',true)
 from public.webbase_products p
 cross join lateral (
  select coalesce(i.product_id::text,split_part(i.storage_path,'/',2)) gallery
  from public.webbase_product_images i
  where i.variant_key=private.webbase_photo_variant_key(p.name)
   and (i.product_id is null or exists(select 1 from public.webbase_products d where d.id=i.product_id and d.active))
  group by coalesce(i.product_id::text,split_part(i.storage_path,'/',2))
  order by count(*) desc,min(i.created_at),coalesce(i.product_id::text,split_part(i.storage_path,'/',2)) limit 1
 ) donor
 cross join lateral (
  select i.* from public.webbase_product_images i
  where i.variant_key=private.webbase_photo_variant_key(p.name)
   and coalesce(i.product_id::text,split_part(i.storage_path,'/',2))=donor.gallery
  order by i.is_primary desc,i.sort_order,i.created_at,i.id limit 3
 ) i
 where p.id=any(p_product_ids) and p.active
  and not exists(select 1 from public.webbase_product_images own where own.product_id=p.id);
$$;
revoke all on function public.webbase_shared_product_images(uuid[]) from public,anon;
grant execute on function public.webbase_shared_product_images(uuid[]) to authenticated,service_role;
revoke all on function private.webbase_image_variant_guard() from public,anon;
revoke all on function private.webbase_refresh_image_variant() from public,anon;
