create or replace function public.webbase_network_search(p_query text default '',p_region text default 'moscow',p_offset int default 0,p_limit int default 24,p_demo boolean default false) returns jsonb language sql stable security invoker set search_path='' as $$
with query as materialized(select regexp_split_to_array(public.webbase_network_key(left(p_query,150)),'\s+') tokens,lower(left(p_query,150)) sku),active as(select id,report_date from public.webbase_network_imports where status='active'),
amounts as(select q.item_key,w.store_id,
 sum(q.quantity) filter(where w.kind='warehouse') warehouse,sum(q.quantity) filter(where w.kind='display') display
 from public.webbase_network_stock q join active a on a.id=q.import_id join public.webbase_network_warehouses w on w.key=q.warehouse_key join public.webbase_network_stores s on s.id=w.store_id
 where w.reviewed and not w.excluded and s.verified and (p_region='all' or s.region=p_region) group by q.item_key,w.store_id),
agg as(select k.item_key,coalesce(sum(greatest(a.warehouse,0)+greatest(a.display,0)),0) available from (select distinct q.item_key from public.webbase_network_stock q join active a on a.id=q.import_id) k left join amounts a on a.item_key=k.item_key group by k.item_key),
found as(select i.key,i.raw_name as name,i.product_id,i.is_demo,p.color,p.memory,p.category,p.network_origin,coalesce(a.available,0) available,
 coalesce((select storage_path from public.webbase_product_images where product_id=p.id order by is_primary desc,sort_order limit 1),p.image_path) image_path
 from agg a join public.webbase_network_items i on i.key=a.item_key left join public.webbase_products p on p.id=i.product_id cross join query
 where (p_demo or not i.is_demo) and (p_query='' or not exists(select 1 from unnest(query.tokens) token where strpos(i.key,token)=0) or lower(coalesce(p.sku,'')) like '%'||query.sku||'%' or lower(array_to_string(p.source_skus,' ')) like '%'||query.sku||'%')),
page as(select * from found order by is_demo,available desc,name,key offset greatest(p_offset,0) limit least(greatest(p_limit,1),48))
select jsonb_build_object('report_date',(select report_date from active),'count',(select count(*) from found),'items',coalesce((select jsonb_agg(to_jsonb(page)) from page),'[]'));
$$;

create or replace function public.webbase_network_status() returns jsonb language sql stable security invoker set search_path='' as $$
select jsonb_build_object('id',i.id,'report_date',i.report_date,'filename',i.filename,'summary',i.summary||jsonb_build_object('unknown_warehouses',(select count(*) from public.webbase_network_warehouses w where not w.reviewed and w.key in(select e->>'key' from jsonb_array_elements(i.columns)e)),'stores',(select count(distinct w.store_id) from public.webbase_network_warehouses w where w.reviewed and not w.excluded and w.key in(select e->>'key' from jsonb_array_elements(i.columns)e))),
'photos',count(*) filter(where j.photo_found),'descriptions',count(*) filter(where j.description_found),'pending',count(*) filter(where j.status='pending'),'working',count(*) filter(where j.status='working'),'review',count(*) filter(where j.status='review'),'errors',count(*) filter(where j.status='error'))
from public.webbase_network_imports i left join public.webbase_network_jobs j on j.import_id=i.id where i.status='active' and private.webbase_is_admin() group by i.id;
$$;
