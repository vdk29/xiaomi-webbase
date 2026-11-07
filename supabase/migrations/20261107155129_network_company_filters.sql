-- Legal entities are independent from physical stores. User-confirmed assignments take
-- priority over names; unlisted unmarked warehouses remain unclassified for review.
alter table public.webbase_network_warehouses add column company text check(company in ('smart_orange','mobility','mixtech'));
create function public.webbase_network_company(p_name text,p_entity text default null) returns text language sql immutable set search_path='' as $$
 select case
 when lower(coalesce(p_entity,'')||' '||p_name) ~ '(mobilidi|mobilibdi|mobility|мобилити)' then 'mobility'
 when lower(coalesce(p_entity,'')||' '||p_name) ~ '(smart[ _-]*orange|смарт[ -]*оранж)' then 'smart_orange'
 when lower(coalesce(p_entity,'')||' '||p_name) ~ '(mixtech|микстех|мехтех|мекстех)' then 'mixtech'
 when lower(p_name) ~ '(екатеринбург|мега екб|ростов|рязань|w-plaza)' then 'mixtech'
 when lower(p_name) ~ '(кол[ауо]мбус|авиапарк|каширская плаза|с[ао]л[ая]рис|кузьминки|измайловская плаза|тверская)' then 'mobility'
 when lower(p_name) ~ '(европолис|санкт-петербург|спб радуга|радуга спб|калейдоскоп|европейский|академический|город лефортово|охта молл|красный кит)' then 'smart_orange'
 else null end;
$$;
revoke all on function public.webbase_network_company(text,text) from public,anon;
grant execute on function public.webbase_network_company(text,text) to authenticated,service_role;
update public.webbase_network_warehouses set company=public.webbase_network_company(raw_name,legal_entity);
create function private.webbase_network_assign_company() returns trigger language plpgsql security invoker set search_path='' as $$begin
 if TG_OP='INSERT' then
  if new.company is null then new.company:=public.webbase_network_company(new.raw_name,new.legal_entity);end if;
 elsif new.company is not distinct from old.company then
  if old.company is not distinct from public.webbase_network_company(old.raw_name,old.legal_entity) then new.company:=public.webbase_network_company(new.raw_name,new.legal_entity);end if;
 end if;
 return new;
end;$$;
revoke all on function private.webbase_network_assign_company() from public,anon;
create trigger webbase_network_assign_company before insert or update of raw_name,legal_entity on public.webbase_network_warehouses for each row execute function private.webbase_network_assign_company();
create index webbase_network_warehouse_company_idx on public.webbase_network_warehouses(company,store_id) where reviewed and not excluded;
create or replace function public.webbase_network_search(p_query text,p_region text,p_offset int,p_limit int,p_demo boolean,p_company text) returns jsonb language sql stable security invoker set search_path='' as $$
with query as materialized(select regexp_split_to_array(public.webbase_network_key(left(p_query,150)),'\s+') tokens,lower(left(p_query,150)) sku),active as(select id,report_date from public.webbase_network_imports where status='active'),
amounts as(select q.item_key,w.store_id,
 sum(q.quantity) filter(where w.kind='warehouse') warehouse,sum(q.quantity) filter(where w.kind='display') display
 from public.webbase_network_stock q join active a on a.id=q.import_id join public.webbase_network_warehouses w on w.key=q.warehouse_key join public.webbase_network_stores s on s.id=w.store_id
 where w.company=p_company and w.reviewed and not w.excluded and s.verified and (p_region='all' or s.region=p_region) group by q.item_key,w.store_id),
agg as(select k.item_key,coalesce(sum(greatest(a.warehouse,0)+greatest(a.display,0)),0) available from (select m.item_key from public.webbase_network_snapshot_items m join active a on a.id=m.import_id) k left join amounts a on a.item_key=k.item_key group by k.item_key),
found as(select i.key,i.raw_name as name,i.product_id,p.active as product_active,i.is_demo,p.color,p.memory,p.category,p.network_origin,case when i.is_demo then 0 else coalesce(a.available,0) end available,
 coalesce((select storage_path from public.webbase_product_images where product_id=p.id order by is_primary desc,sort_order limit 1),p.image_path) image_path
 from agg a join public.webbase_network_items i on i.key=a.item_key left join public.webbase_products p on p.id=i.product_id cross join query
 where exists(select 1 from public.webbase_network_stock q join active a on a.id=q.import_id join public.webbase_network_warehouses w on w.key=q.warehouse_key join public.webbase_network_stores s on s.id=w.store_id where q.item_key=i.key and q.quantity<>0 and w.company=p_company and w.reviewed and not w.excluded and s.verified) and (p_demo or not i.is_demo) and (p_query='' or not exists(select 1 from unnest(query.tokens) token where strpos(i.key,token)=0) or lower(coalesce(p.sku,'')) like '%'||query.sku||'%' or lower(array_to_string(p.source_skus,' ')) like '%'||query.sku||'%')),
page as(select * from found order by is_demo,available desc,name,key offset greatest(p_offset,0) limit least(greatest(p_limit,1),48))
select jsonb_build_object('company',p_company,'report_date',(select report_date from active),'count',(select count(*) from found),'items',coalesce((select jsonb_agg(to_jsonb(page)) from page),'[]'));
$$;

create or replace function public.webbase_network_availability(p_product uuid,p_key text,p_region text,p_zeros boolean,p_sort text,p_company text) returns jsonb language sql stable security invoker set search_path='' as $$
with active as(select id,report_date,completed_at from public.webbase_network_imports where status='active'),
item as(select i.* from public.webbase_network_items i join public.webbase_network_snapshot_items m on m.item_key=i.key join active a on a.id=m.import_id where (p_product is not null and i.product_id=p_product) or (p_key is not null and i.key=p_key)),
amounts as(select w.store_id,sum(case when w.kind='warehouse' and not i.is_demo then q.quantity else 0 end)::int warehouse,sum(case when w.kind='display' and not i.is_demo then q.quantity else 0 end)::int display,sum(case when w.kind='defect' and not i.is_demo then q.quantity else 0 end)::int defect,
 sum(case when i.is_demo then q.quantity else 0 end)::int ldu,
 jsonb_agg(jsonb_build_object('warehouse',w.raw_name,'kind',w.kind,'entity',w.legal_entity,'quantity',q.quantity) order by w.raw_name) accounts
 from public.webbase_network_stock q join active a on q.import_id=a.id join item i on q.item_key=i.key join public.webbase_network_warehouses w on w.key=q.warehouse_key
 where w.company=p_company and w.reviewed and not w.excluded group by w.store_id),
rows as(select s.*,coalesce(a.warehouse,0) warehouse,coalesce(a.display,0) display,coalesce(a.defect,0) defect,coalesce(a.ldu,0) ldu,coalesce(a.accounts,'[]') accounts,
 greatest(coalesce(a.warehouse,0),0)+greatest(coalesce(a.display,0),0) available from public.webbase_network_stores s left join amounts a on a.store_id=s.id
 where exists(select 1 from public.webbase_network_warehouses w where w.store_id=s.id and w.company=p_company and w.reviewed and not w.excluded) and s.verified and (p_region='all' or s.region=p_region) and exists(select 1 from item)),
ordered as(select * from rows where p_zeros or available>0 or ldu>0 order by case when p_sort='name' then name end,
 case when p_sort='warehouse' then warehouse>0 when p_sort='present' then available>0 else true end desc,
 case when p_sort='quantity' then available else greatest(warehouse,0) end desc,name)
select jsonb_build_object('company',p_company,'report_date',(select report_date from active),'updated_at',(select completed_at from active),'is_demo',coalesce((select bool_or(is_demo) from item),false),'matched',exists(select 1 from item),
'stores',coalesce((select jsonb_agg(to_jsonb(ordered)||jsonb_build_object('total',warehouse+display)) from ordered),'[]'));
$$;

-- Preserve old clients without returning mixed-entity totals.
create or replace function public.webbase_network_search(p_query text default '',p_region text default 'moscow',p_offset int default 0,p_limit int default 24,p_demo boolean default false) returns jsonb language sql stable security invoker set search_path='' as $$
 select public.webbase_network_search(p_query,p_region,p_offset,p_limit,p_demo,'smart_orange');
$$;
create or replace function public.webbase_network_availability(p_product uuid default null,p_key text default null,p_region text default 'moscow',p_zeros boolean default false,p_sort text default 'warehouse') returns jsonb language sql stable security invoker set search_path='' as $$
 select public.webbase_network_availability(p_product,p_key,p_region,p_zeros,p_sort,'smart_orange');
$$;
revoke all on function public.webbase_network_search(text,text,int,int,boolean,text),public.webbase_network_availability(uuid,text,text,boolean,text,text) from public,anon;
grant execute on function public.webbase_network_search(text,text,int,int,boolean,text),public.webbase_network_availability(uuid,text,text,boolean,text,text) to authenticated,service_role;
