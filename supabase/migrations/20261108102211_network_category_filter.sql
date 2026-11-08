-- Category filtering and category choices use the same authorized network inventory.
create or replace function public.webbase_network_search(p_query text,p_region text,p_offset int,p_limit int,p_demo boolean,p_company text,p_category text) returns jsonb language sql stable security invoker set search_path='' as $$
with query as materialized(select regexp_split_to_array(public.webbase_network_key(left(p_query,150)),'\s+') tokens,lower(left(p_query,150)) sku),active as(select id,report_date from public.webbase_network_imports where status='active'),
amounts as(select q.item_key,w.store_id,
 sum(q.quantity) filter(where w.kind='warehouse') warehouse,sum(q.quantity) filter(where w.kind='display') display
 from public.webbase_network_stock q join active a on a.id=q.import_id join public.webbase_network_warehouses w on w.key=q.warehouse_key join public.webbase_network_stores s on s.id=w.store_id
 where w.company=p_company and w.reviewed and not w.excluded and s.verified and (p_region='all' or s.region=p_region) group by q.item_key,w.store_id),
agg as(select k.item_key,coalesce(sum(greatest(a.warehouse,0)+greatest(a.display,0)),0) available from (select m.item_key from public.webbase_network_snapshot_items m join active a on a.id=m.import_id) k left join amounts a on a.item_key=k.item_key group by k.item_key),
inventory as materialized(select i.key,i.raw_name as name,i.product_id,p.active as product_active,i.is_demo,p.color,p.memory,coalesce(nullif(p.category,''),'Без категории') category,p.network_origin,case when i.is_demo then 0 else coalesce(a.available,0) end available,
 p.image_path,p.sku,p.source_skus
 from agg a join public.webbase_network_items i on i.key=a.item_key left join public.webbase_products p on p.id=i.product_id
 where exists(select 1 from public.webbase_network_stock q join active a on a.id=q.import_id join public.webbase_network_warehouses w on w.key=q.warehouse_key join public.webbase_network_stores s on s.id=w.store_id where q.item_key=i.key and q.quantity<>0 and w.company=p_company and w.reviewed and not w.excluded and s.verified) and (p_demo or not i.is_demo)),
found as(select inventory.* from inventory cross join query where (coalesce(p_category,'')='' or category=p_category) and (coalesce(p_query,'')='' or not exists(select 1 from unnest(query.tokens) token where strpos(key,token)=0) or lower(coalesce(inventory.sku,'')) like '%'||query.sku||'%' or lower(array_to_string(inventory.source_skus,' ')) like '%'||query.sku||'%')),
page as(select * from found order by is_demo,available desc,name,key offset greatest(p_offset,0) limit least(greatest(p_limit,1),48))
select jsonb_build_object('company',p_company,'category',coalesce(p_category,''),'categories',coalesce((select jsonb_agg(category order by category) from (select distinct category from inventory)c),'[]'),'report_date',(select report_date from active),'count',(select count(*) from found),'items',coalesce((select jsonb_agg((to_jsonb(page)-'sku'-'source_skus')||jsonb_build_object('image_path',coalesce((select storage_path from public.webbase_product_images where product_id=page.product_id order by is_primary desc,sort_order limit 1),page.image_path))) from page),'[]'));
$$;

-- Existing callers keep their signature and receive the unfiltered category page.
create or replace function public.webbase_network_search(p_query text,p_region text,p_offset int,p_limit int,p_demo boolean,p_company text) returns jsonb language sql stable security invoker set search_path='' as $$
 select public.webbase_network_search(p_query,p_region,p_offset,p_limit,p_demo,p_company,'');
$$;
revoke all on function public.webbase_network_search(text,text,int,int,boolean,text,text) from public,anon;
grant execute on function public.webbase_network_search(text,text,int,int,boolean,text,text) to authenticated,service_role;
notify pgrst,'reload schema';
