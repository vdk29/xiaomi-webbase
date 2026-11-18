-- 1C appends a unit to names; it must not break the physical model/colour gallery.
-- Sharing photos with an LDU device never merges its card, SKU, or stock.
-- Keep Pro, Max, 4G/5G and the full color phrase in the key; strip only RAM/storage.
create or replace function private.webbase_photo_variant_key(p_name text)
returns text language plpgsql immutable set search_path = '' as $$
declare n text; stripped text;
begin
 n := lower(trim(regexp_replace(replace(coalesce(p_name,''),chr(160),' '),'\s+',' ','g')));
 n := regexp_replace(n,'^\(ldu\)[[:space:]]*','','i');
 n := regexp_replace(n,',[[:space:]]*шт[.]?[[:space:]]*$','','i');
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

-- Preserve orphan registry keys. Only live records with changed keys need a refresh.
update public.webbase_product_images i
set variant_key=private.webbase_photo_variant_key(p.name)
from public.webbase_products p
where p.id=i.product_id and i.variant_key is distinct from private.webbase_photo_variant_key(p.name);
