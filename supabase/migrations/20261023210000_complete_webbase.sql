-- Xiaomi WebBase production-safe expansion.
-- Additive only: product rows, stock rows and storage objects are never deleted.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.webbase_is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.webbase_staff
    where user_id = (select auth.uid()) and active
  );
$$;

create or replace function private.webbase_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.webbase_staff
    where user_id = (select auth.uid()) and active and role = 'admin'
  );
$$;

revoke all on function private.webbase_is_staff() from public, anon;
revoke all on function private.webbase_is_admin() from public, anon;
grant execute on function private.webbase_is_staff() to authenticated;
grant execute on function private.webbase_is_admin() to authenticated;

alter table public.webbase_staff
  add column if not exists username text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists webbase_staff_username_lower_key
  on public.webbase_staff (lower(username)) where username is not null;

alter table public.webbase_staff drop constraint if exists webbase_staff_user_id_fkey;
alter table public.webbase_staff add constraint webbase_staff_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
alter table public.webbase_stock drop constraint if exists webbase_stock_updated_by_fkey;
alter table public.webbase_stock add constraint webbase_stock_updated_by_fkey
  foreign key (updated_by) references auth.users(id) on delete set null;
alter table public.webbase_stock_history drop constraint if exists webbase_stock_history_actor_id_fkey;
alter table public.webbase_stock_history add constraint webbase_stock_history_actor_id_fkey
  foreign key (actor_id) references auth.users(id) on delete set null;
alter table public.webbase_imports drop constraint if exists webbase_imports_actor_id_fkey;
alter table public.webbase_imports add constraint webbase_imports_actor_id_fkey
  foreign key (actor_id) references auth.users(id) on delete set null;

alter table public.webbase_products
  add column if not exists brand text,
  add column if not exists description text,
  add column if not exists specs jsonb not null default '{}'::jsonb,
  add column if not exists source_name text,
  add column if not exists source_skus text[] not null default '{}'::text[],
  add column if not exists last_imported_at timestamptz,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

update public.webbase_products
set source_name = coalesce(source_name, name),
    source_skus = case
      when cardinality(source_skus) > 0 then source_skus
      when nullif(trim(sku), '') is not null then regexp_split_to_array(trim(sku), '\s*/\s*')
      else '{}'::text[]
    end
where source_name is null or cardinality(source_skus) = 0;

create index if not exists webbase_products_source_skus_idx
  on public.webbase_products using gin (source_skus);
create index if not exists webbase_products_updated_by_idx
  on public.webbase_products (updated_by);
create index if not exists webbase_imports_actor_id_idx
  on public.webbase_imports (actor_id);
create index if not exists webbase_stock_updated_by_idx
  on public.webbase_stock (updated_by);
create index if not exists webbase_stock_history_actor_id_idx
  on public.webbase_stock_history (actor_id);
create index if not exists webbase_stock_history_product_id_idx
  on public.webbase_stock_history (product_id);

create table if not exists public.webbase_product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.webbase_products(id) on delete cascade,
  storage_path text not null unique,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_primary boolean not null default false,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  byte_size integer check (byte_size is null or (byte_size > 0 and byte_size <= 5242880)),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  original_name text,
  created_at timestamptz not null default now(),
  uploaded_by uuid references auth.users(id) on delete set null,
  constraint webbase_product_images_path_check check (
    storage_path ~ ('^products/' || product_id::text || '/[0-9a-f-]+\.(webp|jpg|jpeg|png)$')
  )
);

create index if not exists webbase_product_images_product_sort_idx
  on public.webbase_product_images (product_id, sort_order, created_at);
create index if not exists webbase_product_images_uploaded_by_idx
  on public.webbase_product_images (uploaded_by);
create unique index if not exists webbase_product_images_one_primary_idx
  on public.webbase_product_images (product_id) where is_primary;

alter table public.webbase_product_images enable row level security;

drop policy if exists webbase_product_images_read on public.webbase_product_images;
create policy webbase_product_images_read on public.webbase_product_images
for select to authenticated using ((select private.webbase_is_staff()));
drop policy if exists webbase_product_images_insert on public.webbase_product_images;
create policy webbase_product_images_insert on public.webbase_product_images
for insert to authenticated with check (
  (select private.webbase_is_admin())
  and uploaded_by = (select auth.uid())
);
drop policy if exists webbase_product_images_update on public.webbase_product_images;
create policy webbase_product_images_update on public.webbase_product_images
for update to authenticated
using ((select private.webbase_is_admin()))
with check ((select private.webbase_is_admin()));
drop policy if exists webbase_product_images_delete on public.webbase_product_images;
create policy webbase_product_images_delete on public.webbase_product_images
for delete to authenticated using ((select private.webbase_is_admin()));

create or replace function private.webbase_image_primary_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_primary then
    update public.webbase_product_images
    set is_primary = false
    where product_id = new.product_id and id <> new.id and is_primary;
  end if;
  return new;
end;
$$;

drop trigger if exists webbase_image_primary_guard on public.webbase_product_images;
create trigger webbase_image_primary_guard
before insert or update of is_primary on public.webbase_product_images
for each row execute function private.webbase_image_primary_guard();

create or replace function private.webbase_image_promote_after_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.is_primary then
    update public.webbase_product_images
    set is_primary = true
    where id = (
      select id from public.webbase_product_images
      where product_id = old.product_id
      order by sort_order, created_at
      limit 1
    );
  end if;
  return old;
end;
$$;

drop trigger if exists webbase_image_promote_after_delete on public.webbase_product_images;
create trigger webbase_image_promote_after_delete
after delete on public.webbase_product_images
for each row execute function private.webbase_image_promote_after_delete();

-- Point every existing RLS policy at non-exposed authorization helpers.
alter policy webbase_staff_read on public.webbase_staff
  using (user_id = (select auth.uid()) or (select private.webbase_is_admin()));
alter policy webbase_staff_insert on public.webbase_staff
  with check ((select private.webbase_is_admin()));
alter policy webbase_staff_update on public.webbase_staff
  using ((select private.webbase_is_admin())) with check ((select private.webbase_is_admin()));
alter policy webbase_products_read on public.webbase_products
  using ((select private.webbase_is_staff()));
alter policy webbase_products_insert on public.webbase_products
  with check ((select private.webbase_is_admin()));
alter policy webbase_products_update on public.webbase_products
  using ((select private.webbase_is_admin())) with check ((select private.webbase_is_admin()));
alter policy webbase_stock_read on public.webbase_stock
  using ((select private.webbase_is_staff()));
alter policy webbase_stock_insert on public.webbase_stock
  with check ((select private.webbase_is_admin()));
alter policy webbase_stock_update on public.webbase_stock
  using ((select private.webbase_is_admin())) with check ((select private.webbase_is_admin()));
alter policy webbase_history_read on public.webbase_stock_history
  using ((select private.webbase_is_staff()));
alter policy webbase_history_insert on public.webbase_stock_history
  with check ((select private.webbase_is_admin()) and actor_id = (select auth.uid()));
alter policy webbase_imports_read on public.webbase_imports
  using ((select private.webbase_is_staff()));
alter policy webbase_imports_insert on public.webbase_imports
  with check ((select private.webbase_is_admin()) and actor_id = (select auth.uid()));
alter policy webbase_imports_update on public.webbase_imports
  using ((select private.webbase_is_admin())) with check ((select private.webbase_is_admin()));
alter policy webbase_storage_read on storage.objects
  using (bucket_id = 'webbase-products' and (select private.webbase_is_staff()));
alter policy webbase_storage_insert on storage.objects
  with check (
    bucket_id = 'webbase-products'
    and (select private.webbase_is_admin())
    and (storage.foldername(name))[1] = 'products'
    and (storage.foldername(name))[2] ~ '^[0-9a-f-]{36}$'
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
  );
alter policy webbase_storage_update on storage.objects
  using (bucket_id = 'webbase-products' and (select private.webbase_is_admin()))
  with check (
    bucket_id = 'webbase-products'
    and (select private.webbase_is_admin())
    and (storage.foldername(name))[1] = 'products'
    and (storage.foldername(name))[2] ~ '^[0-9a-f-]{36}$'
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
  );
alter policy webbase_storage_delete on storage.objects
  using (bucket_id = 'webbase-products' and (select private.webbase_is_admin()));

drop function if exists public.webbase_is_staff();
drop function if exists public.webbase_is_admin();

revoke all on public.webbase_staff, public.webbase_products, public.webbase_stock,
  public.webbase_stock_history, public.webbase_imports, public.webbase_product_images from anon;
revoke all on public.webbase_staff, public.webbase_products, public.webbase_stock,
  public.webbase_stock_history, public.webbase_imports, public.webbase_product_images from authenticated;
grant select on public.webbase_staff to authenticated;
grant select, insert, update on public.webbase_products to authenticated;
grant select, insert, update on public.webbase_stock to authenticated;
grant select, insert on public.webbase_stock_history to authenticated;
grant select, insert, update on public.webbase_imports to authenticated;
grant select, insert, update, delete on public.webbase_product_images to authenticated;

create or replace function public.webbase_update_product(
  p_product_id uuid,
  p_patch jsonb,
  p_warehouse integer,
  p_display integer,
  p_ldu integer
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_name text := nullif(trim(p_patch->>'name'), '');
  v_sku text := nullif(trim(p_patch->>'sku'), '');
begin
  if not (select private.webbase_is_admin()) then raise exception 'Admin only' using errcode = '42501'; end if;
  if v_name is null or length(v_name) > 240 then raise exception 'Invalid product name' using errcode = '22023'; end if;
  if least(p_warehouse, p_display, p_ldu) < 0 then raise exception 'Stock cannot be negative' using errcode = '22023'; end if;
  if jsonb_typeof(coalesce(p_patch->'specs', '{}'::jsonb)) <> 'object' then raise exception 'Specs must be an object' using errcode = '22023'; end if;
  if v_sku is not null and exists (
    select 1 from public.webbase_products
    where id <> p_product_id and lower(trim(sku)) = lower(v_sku)
  ) then raise exception 'Артикул уже используется другой карточкой' using errcode = '23505'; end if;

  update public.webbase_products set
    name = v_name,
    sku = v_sku,
    category = nullif(trim(p_patch->>'category'), ''),
    brand = nullif(trim(p_patch->>'brand'), ''),
    model = nullif(trim(p_patch->>'model'), ''),
    memory = nullif(trim(p_patch->>'memory'), ''),
    color = nullif(trim(p_patch->>'color'), ''),
    description = nullif(trim(p_patch->>'description'), ''),
    specs = coalesce(p_patch->'specs', '{}'::jsonb),
    updated_at = now(),
    updated_by = (select auth.uid())
  where id = p_product_id and active;
  if not found then raise exception 'Product not found' using errcode = 'P0002'; end if;

  insert into public.webbase_stock(product_id, warehouse, display, ldu, updated_at, updated_by)
  values (p_product_id, p_warehouse, p_display, p_ldu, now(), (select auth.uid()))
  on conflict (product_id) do update set
    warehouse = excluded.warehouse,
    display = excluded.display,
    ldu = excluded.ldu,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by;
  return jsonb_build_object('ok', true, 'product_id', p_product_id);
end;
$$;

create or replace function public.webbase_archive_product(p_product_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not (select private.webbase_is_admin()) then raise exception 'Admin only' using errcode = '42501'; end if;
  update public.webbase_products
  set active = false, updated_at = now(), updated_by = (select auth.uid())
  where id = p_product_id;
  if not found then raise exception 'Product not found' using errcode = 'P0002'; end if;
end;
$$;

create or replace function public.webbase_apply_import(p_filename text, p_items jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_item jsonb;
  v_product_id uuid;
  v_matches uuid[];
  v_source_key text;
  v_name text;
  v_sku text;
  v_skus text[];
  v_category text;
  v_warehouse integer;
  v_display integer;
  v_ldu integer;
  v_created integer := 0;
  v_updated integer := 0;
begin
  if not (select private.webbase_is_admin()) then raise exception 'Admin only' using errcode = '42501'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 10000 then
    raise exception 'Invalid import payload' using errcode = '22023';
  end if;
  if length(coalesce(p_filename, '')) > 255 then raise exception 'Filename is too long' using errcode = '22023'; end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_source_key := nullif(trim(v_item->>'source_key'), '');
    v_name := nullif(trim(v_item->>'name'), '');
    v_sku := nullif(trim(v_item->>'sku'), '');
    v_category := nullif(trim(v_item->>'category'), '');
    select coalesce(array_agg(value), '{}'::text[]) into v_skus
      from jsonb_array_elements_text(coalesce(v_item->'source_skus', '[]'::jsonb));
    v_warehouse := (v_item->>'warehouse')::integer;
    v_display := (v_item->>'display')::integer;
    v_ldu := (v_item->>'ldu')::integer;
    if v_source_key is null or v_name is null or length(v_name) > 240
      or least(v_warehouse, v_display, v_ldu) < 0 then
      raise exception 'Invalid import item' using errcode = '22023';
    end if;

    select array_agg(id order by id) into v_matches
    from public.webbase_products
    where external_id = v_source_key
       or (cardinality(v_skus) > 0 and source_skus && v_skus)
       or (v_sku is not null and lower(trim(sku)) = lower(v_sku));
    if cardinality(v_matches) > 1 then
      raise exception 'Неоднозначное сопоставление: %', v_name using errcode = 'P0001';
    end if;
    v_product_id := v_matches[1];

    if v_product_id is null then
      insert into public.webbase_products(external_id, sku, name, source_name, source_skus, category, last_imported_at, updated_at, updated_by)
      values (v_source_key, v_sku, v_name, v_name, v_skus, v_category, now(), now(), (select auth.uid()))
      returning id into v_product_id;
      v_created := v_created + 1;
    else
      update public.webbase_products set
        name = case when name = coalesce(source_name, name) then v_name else name end,
        source_name = v_name,
        source_skus = v_skus,
        sku = v_sku,
        category = coalesce(category, v_category),
        last_imported_at = now(),
        updated_at = now(),
        updated_by = (select auth.uid())
      where id = v_product_id;
      v_updated := v_updated + 1;
    end if;

    insert into public.webbase_stock(product_id, warehouse, display, ldu, updated_at, updated_by)
    values (v_product_id, v_warehouse, v_display, v_ldu, now(), (select auth.uid()))
    on conflict (product_id) do update set
      warehouse = excluded.warehouse,
      display = excluded.display,
      ldu = excluded.ldu,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by;
  end loop;

  insert into public.webbase_imports(filename, actor_id, status, recognized, skipped, needs_review)
  values (p_filename, (select auth.uid()), 'applied', jsonb_array_length(p_items), 0, 0);
  return jsonb_build_object('ok', true, 'created', v_created, 'updated', v_updated);
end;
$$;

revoke all on function public.webbase_update_product(uuid,jsonb,integer,integer,integer) from public, anon;
revoke all on function public.webbase_archive_product(uuid) from public, anon;
revoke all on function public.webbase_apply_import(text,jsonb) from public, anon;
grant execute on function public.webbase_update_product(uuid,jsonb,integer,integer,integer) to authenticated;
grant execute on function public.webbase_archive_product(uuid) to authenticated;
grant execute on function public.webbase_apply_import(text,jsonb) to authenticated;

update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg','image/png','image/webp']::text[]
where id = 'webbase-products';

