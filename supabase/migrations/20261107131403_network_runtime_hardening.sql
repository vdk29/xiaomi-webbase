-- Keep persistent internal photo identity when a later local 1C import supplies a SKU.
-- SKU-less network cards use the same persistent photo registry with a namespaced internal key.
create or replace function private.webbase_image_identity_guard()
returns trigger language plpgsql set search_path = '' as $$
declare keys text[];
begin
 if new.product_id is not null then
  select case when network_origin then private.webbase_sku_keys(sku,source_skus)||array['network:'||md5(public.webbase_network_key(name))] else private.webbase_sku_keys(sku,source_skus) end into keys
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
 if new.network_origin then keys:=keys||array['network:'||md5(public.webbase_network_key(new.name))];end if;
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

create function private.webbase_network_refresh_photo_identity() returns trigger language plpgsql security invoker set search_path='' as $$begin
 if new.network_origin then update public.webbase_product_images set sku_keys=private.webbase_sku_keys(new.sku,new.source_skus)||array['network:'||md5(public.webbase_network_key(new.name))] where product_id=new.id;end if;return new;end;$$;
revoke all on function private.webbase_network_refresh_photo_identity() from public,anon;
create trigger webbase_network_refresh_photo_identity after update of sku,source_skus on public.webbase_products for each row when(new.network_origin) execute function private.webbase_network_refresh_photo_identity();
create or replace function public.webbase_network_photo_key(value text) returns text language sql immutable set search_path='' as $$select trim(regexp_replace(regexp_replace(regexp_replace(public.webbase_network_key(value),'(^| )ldu([ )-]|$)',' ','g'),'\m[0-9]+/[0-9]+gb\M',' ','g'),'\s+',' ','g'));$$;
reindex index public.webbase_network_photo_key_idx;
create or replace function public.webbase_network_search(p_query text default '',p_region text default 'moscow',p_offset int default 0,p_limit int default 24,p_demo boolean default false) returns jsonb language sql stable security invoker set search_path='' as $$
with query as materialized(select regexp_split_to_array(public.webbase_network_key(left(p_query,150)),'\s+') tokens,lower(left(p_query,150)) sku),active as(select id,report_date from public.webbase_network_imports where status='active'),
agg as(select q.item_key,sum(greatest(q.quantity,0)) filter(where w.kind in('warehouse','display') and w.reviewed and not w.excluded and (p_region='all' or s.region=p_region)) as available
 from public.webbase_network_stock q join active a on a.id=q.import_id join public.webbase_network_warehouses w on w.key=q.warehouse_key left join public.webbase_network_stores s on s.id=w.store_id group by q.item_key),
found as(select i.key,i.raw_name as name,i.product_id,i.is_demo,p.color,p.memory,p.category,p.network_origin,coalesce(a.available,0) available,
 (select storage_path from public.webbase_product_images where product_id=p.id order by is_primary desc,sort_order limit 1) image_path
 from agg a join public.webbase_network_items i on i.key=a.item_key left join public.webbase_products p on p.id=i.product_id cross join query
 where (p_demo or not i.is_demo) and (p_query='' or not exists(select 1 from unnest(query.tokens) token where strpos(i.key,token)=0) or lower(coalesce(p.sku,'')) like '%'||query.sku||'%' or lower(array_to_string(p.source_skus,' ')) like '%'||query.sku||'%')),
page as(select * from found order by is_demo,available desc,name,key offset greatest(p_offset,0) limit least(greatest(p_limit,1),48))
select jsonb_build_object('report_date',(select report_date from active),'count',(select count(*) from found),'items',coalesce((select jsonb_agg(to_jsonb(page)) from page),'[]'));
$$;

create temporary table webbase_net_responses_backup as table net._http_response;
create temporary table webbase_net_queue_backup as select id,method::text as method,url,headers,body,timeout_milliseconds from net.http_request_queue;
drop extension pg_net;
create extension pg_net with schema extensions;
insert into net._http_response select * from pg_temp.webbase_net_responses_backup;
insert into net.http_request_queue select id,method::net.http_method,url,headers,body,timeout_milliseconds from pg_temp.webbase_net_queue_backup;
select setval('net.http_request_queue_id_seq',greatest(coalesce((select max(id) from net.http_request_queue),0),coalesce((select max(id) from net._http_response),0),1));
revoke all on schema net from public,anon,authenticated;
revoke all on all functions in schema net from public,anon,authenticated;
