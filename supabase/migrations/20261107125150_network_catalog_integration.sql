-- Extend the existing local import only to adopt an exact, SKU-less network card.
-- No current local quantities are changed by this migration.
-- Full stock snapshots, admin-only and atomic. No stock is changed by this migration.
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
  v_seen uuid[] := '{}'::uuid[];
  v_zeroed integer := 0;
  v_created integer := 0;
  v_updated integer := 0;
begin
  if not (select private.webbase_is_admin()) then raise exception 'Admin only' using errcode = '42501'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 10000 then
    raise exception 'Invalid import payload' using errcode = '22023';
  end if;
  if length(coalesce(p_filename, '')) > 255 then raise exception 'Filename is too long' using errcode = '22023'; end if;

  -- Serialize full snapshots so concurrent imports cannot interleave their resets.
  perform pg_advisory_xact_lock(20261106, 19);

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(v_item) <> 'object' or jsonb_typeof(v_item->'source_skus') is distinct from 'array' then
      raise exception 'Invalid import item' using errcode = '22023';
    end if;
    v_source_key := nullif(replace(lower(regexp_replace(trim(v_item->>'source_key'), '\s+', ' ', 'g')), 'ё', 'е'), '');
    v_name := nullif(trim(v_item->>'name'), '');
    v_sku := nullif(trim(v_item->>'sku'), '');
    v_category := nullif(trim(v_item->>'category'), '');
    select coalesce(array_agg(distinct trim(value)), '{}'::text[]) into v_skus
      from jsonb_array_elements_text(v_item->'source_skus') where nullif(trim(value), '') is not null;
    if coalesce(v_item->>'warehouse','') !~ '^[0-9]+$'
      or coalesce(v_item->>'display','') !~ '^[0-9]+$'
      or coalesce(v_item->>'ldu','') !~ '^[0-9]+$' then
      raise exception 'Invalid stock quantity' using errcode = '22023';
    end if;
    v_warehouse := (v_item->>'warehouse')::integer;
    v_display := (v_item->>'display')::integer;
    v_ldu := (v_item->>'ldu')::integer;
    if v_source_key is null or v_name is null or length(v_name) > 240
      or cardinality(v_skus) = 0 or v_ldu > v_display
      or least(v_warehouse, v_display, v_ldu) < 0 then
      raise exception 'Invalid import item' using errcode = '22023';
    end if;

    select array_agg(id order by id) into v_matches
    from public.webbase_products p
    where (p.network_origin and not p.is_demo and nullif(p.sku,'') is null and public.webbase_network_key(p.name)=public.webbase_network_key(v_name))
       or replace(lower(regexp_replace(trim(p.external_id), '\s+', ' ', 'g')), 'ё', 'е') = v_source_key
       or exists (
         select 1
         from unnest(p.source_skus || regexp_split_to_array(coalesce(p.sku,''), '\s*[/;,]\s*')) old_sku
         join unnest(v_skus) incoming_sku
           on replace(lower(regexp_replace(trim(old_sku), '\s+', ' ', 'g')), 'ё', 'е')
            = replace(lower(regexp_replace(trim(incoming_sku), '\s+', ' ', 'g')), 'ё', 'е')
       );
    if cardinality(v_matches) > 1 then
      raise exception 'Неоднозначное сопоставление: %', v_name using errcode = 'P0001';
    end if;
    v_product_id := v_matches[1];
    if v_product_id = any(v_seen) then
      raise exception 'Несколько строк отчёта сопоставлены одной карточке: %', v_name using errcode = '22023';
    end if;

    if v_product_id is null then
      insert into public.webbase_products(external_id, sku, name, source_name, source_skus, category, last_imported_at, updated_at, updated_by)
      values (v_source_key, v_sku, v_name, v_name, v_skus, v_category, now(), now(), (select auth.uid()))
      returning id into v_product_id;
      v_created := v_created + 1;
    else
      update public.webbase_products set
        name = case when name = coalesce(source_name, name) then v_name else name end,
        source_name = v_name,
        source_skus = array(select distinct x from unnest(source_skus || v_skus) x order by x),
        sku = v_sku,
        category = coalesce(category, v_category),
        last_imported_at = now(),
        updated_at = now(),
        updated_by = (select auth.uid())
      where id = v_product_id;
      v_updated := v_updated + 1;
    end if;

    v_seen := array_append(v_seen, v_product_id);

    insert into public.webbase_stock(product_id, warehouse, display, ldu, updated_at, updated_by)
    values (v_product_id, v_warehouse, v_display, v_ldu, now(), (select auth.uid()))
    on conflict (product_id) do update set
      warehouse = excluded.warehouse,
      display = excluded.display,
      ldu = excluded.ldu,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by;
  end loop;

  -- A full 1C report is the current stock snapshot, not an additive update.
  -- Keep every product, photo and manual field; zero only quantities absent from it.
  update public.webbase_stock set warehouse = 0, display = 0, ldu = 0,
    updated_at = now(), updated_by = (select auth.uid())
  where not (product_id = any(v_seen)) and (warehouse <> 0 or display <> 0 or ldu <> 0);
  get diagnostics v_zeroed = row_count;

  insert into public.webbase_imports(filename, actor_id, status, recognized, skipped, needs_review)
  values (p_filename, (select auth.uid()), 'applied', jsonb_array_length(p_items), 0, 0);
  return jsonb_build_object('ok', true, 'created', v_created, 'updated', v_updated, 'zeroed', v_zeroed);
end;
$$;

revoke all on function public.webbase_apply_import(text,jsonb) from public, anon;
grant execute on function public.webbase_apply_import(text,jsonb) to authenticated;

-- Sellable availability uses only the main warehouse; retain display/LDU in storage.

create function public.webbase_network_status() returns jsonb language sql stable security invoker set search_path='' as $$
select to_jsonb(i)||jsonb_build_object('photos',count(*) filter(where j.photo_found),'descriptions',count(*) filter(where j.description_found),'pending',count(*) filter(where j.status='pending'),'working',count(*) filter(where j.status='working'),'review',count(*) filter(where j.status='review'),'errors',count(*) filter(where j.status='error'))
from public.webbase_network_imports i left join public.webbase_network_jobs j on j.import_id=i.id where i.status='active' and private.webbase_is_admin() group by i.id;
$$;
revoke all on function public.webbase_network_status() from public,anon;
grant execute on function public.webbase_network_status() to authenticated;
