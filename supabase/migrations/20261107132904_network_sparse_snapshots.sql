-- Future reports retain membership separately, so zero cells need not expand into a dense matrix.
-- Existing snapshots and all their cells remain intact.
create table public.webbase_network_snapshot_items(import_id uuid not null references public.webbase_network_imports(id),item_key text not null references public.webbase_network_items(key),primary key(import_id,item_key));
alter table public.webbase_network_snapshot_items enable row level security;
revoke all on public.webbase_network_snapshot_items from anon;
grant select,insert,update,delete on public.webbase_network_snapshot_items to authenticated;
grant all on public.webbase_network_snapshot_items to service_role;
create policy staff_read on public.webbase_network_snapshot_items for select to authenticated using ((select private.webbase_is_staff()));
create policy admin_write on public.webbase_network_snapshot_items for all to authenticated using ((select private.webbase_is_admin())) with check ((select private.webbase_is_admin()));
insert into public.webbase_network_snapshot_items select distinct import_id,item_key from public.webbase_network_stock;
create or replace function public.webbase_network_commit(p_import uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare imp public.webbase_network_imports;row record;col record;p_id uuid;matches uuid[];created int:=0;linked int:=0;ambiguous int:=0;demo boolean;sum_total int;counts jsonb;reason text; catalog jsonb;
begin
 if not private.webbase_is_admin() then raise exception 'Administrator required' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtext('webbase_network_snapshot'));
 select * into imp from public.webbase_network_imports where id=p_import for update;
 if imp.id is null then raise exception 'Import missing';end if;
 if imp.status in ('active','archived') then return imp.summary||jsonb_build_object('repeated',true);end if;
 if (select count(*) from public.webbase_network_stage where import_id=p_import)<>imp.expected_items then raise exception 'Incomplete staged snapshot';end if;
 select sum((payload->>'total')::int) into sum_total from public.webbase_network_stage where import_id=p_import;
 if sum_total<>imp.expected_total then raise exception 'Snapshot total mismatch';end if;
 if exists(select 1 from public.webbase_network_imports where status='active' and report_date>imp.report_date) then raise exception 'A newer report is active';end if;
 for col in select value as j,ordinality-1 as idx from jsonb_array_elements(imp.columns) with ordinality loop
 if public.webbase_network_warehouse_key(col.j->>'raw_name')<>col.j->>'key' then raise exception 'Invalid warehouse key';end if;
 if (col.j->>'total')::int is null or (select sum((payload->'values'->>col.idx::int)::int) from public.webbase_network_stage where import_id=p_import)<>(col.j->>'total')::int then raise exception 'Warehouse total mismatch: %',col.j->>'raw_name';end if;
 insert into public.webbase_network_warehouses(key,raw_name) values(col.j->>'key',col.j->>'raw_name') on conflict(key) do nothing;
 end loop;
 -- Normalize the existing catalog once, never once per incoming product under RLS.
 select coalesce(jsonb_object_agg(k,ids),'{}') into catalog from (
 select (case when p.is_demo then '1:' else '0:' end)||public.webbase_network_key(v.name) k,jsonb_agg(distinct p.id) ids
 from public.webbase_products p cross join lateral(values(p.name),(p.source_name)) v(name) where v.name is not null group by 1
 ) lookup;
 for row in select key,payload as j from public.webbase_network_stage where import_id=p_import order by key loop
 demo:=row.j->>'raw_name' ~* '(^|[ (])ldu([ )-]|$)';
 select product_id into p_id from public.webbase_network_items where key=row.key;
 reason:=null;
 if p_id is null then
 select array_agg(value::uuid) into matches from jsonb_array_elements_text(coalesce(catalog->((case when demo then '1:' else '0:' end)||row.key),'[]'));

 if coalesce(cardinality(matches),0)=0 and row.j->>'raw_name' ~* '\(BHR[A-Z0-9]+\)' then
 select array_agg(id) into matches from public.webbase_products p where not p.network_origin and p.is_demo=demo and p.category=row.j->>'category'
 and upper(substring(p.name from '(?i)\((BHR[A-Z0-9]+)\)'))=upper(substring(row.j->>'raw_name' from '(?i)\((BHR[A-Z0-9]+)\)'))
 and (coalesce(row.j->>'memory','')='' or coalesce(p.memory,'')='' or public.webbase_network_key(p.memory)=public.webbase_network_key(row.j->>'memory'))
 and (coalesce(row.j->>'color','')='' or coalesce(p.color,'')='' or public.webbase_network_key(p.color)=public.webbase_network_key(row.j->>'color'));
 end if;
 if coalesce(cardinality(matches),0)=1 then p_id:=matches[1];linked:=linked+1;
 elsif coalesce(cardinality(matches),0)>1 then reason:='Неоднозначное совпадение названия';ambiguous:=ambiguous+1;
 else
 insert into public.webbase_products(external_id,sku,name,source_name,category,brand,model,memory,color,active,network_origin,is_demo,specs)
 values('network:'||md5(row.key),null,row.j->>'raw_name',row.j->>'raw_name',case when demo then 'Демонстрационные устройства' else row.j->>'category' end,row.j->>'brand',row.j->>'model',row.j->>'memory',row.j->>'color',true,true,demo,
 jsonb_strip_nulls(jsonb_build_object('_network_name_source',row.j->>'raw_name','Оперативная память (ГБ)',row.j->'ram','Встроенная память (ГБ)',row.j->'storage')))
 returning id into p_id;created:=created+1;
 insert into public.webbase_network_jobs(product_id,import_id) values(p_id,p_import) on conflict(product_id) do nothing;
 end if;
 else linked:=linked+1;end if;
 insert into public.webbase_network_items(key,raw_name,product_id,is_demo,review_reason,source_row)
 values(row.key,row.j->>'raw_name',p_id,demo,reason,(row.j->>'row')::int) on conflict(key) do update set raw_name=excluded.raw_name,source_row=excluded.source_row;
 end loop;
 insert into public.webbase_network_snapshot_items(import_id,item_key) select p_import,key from public.webbase_network_stage where import_id=p_import;
 insert into public.webbase_network_stock(import_id,item_key,warehouse_key,quantity)
 select p_import,t.key,c.value->>'key',(t.payload->'values'->>(c.ordinality-1)::int)::int
 from public.webbase_network_stage t cross join jsonb_array_elements(imp.columns) with ordinality c(value,ordinality) where t.import_id=p_import and (t.payload->'values'->>(c.ordinality-1)::int)::int<>0;
 counts:=jsonb_build_object('recognized',imp.expected_items,'created',created,'linked',linked,'ambiguous',ambiguous,'total',sum_total,'skipped',jsonb_array_length(imp.skipped),'negative',imp.negative_count,'warehouses',jsonb_array_length(imp.columns),'stores',(select count(distinct w.store_id) from public.webbase_network_warehouses w where w.reviewed and not w.excluded and w.key in(select value->>'key' from jsonb_array_elements(imp.columns))),'unknown_warehouses',(select count(*) from public.webbase_network_warehouses w where not w.reviewed and w.key in(select value->>'key' from jsonb_array_elements(imp.columns))));
 update public.webbase_network_imports set status='archived' where status='active';
 update public.webbase_network_imports set status='active',completed_at=now(),summary=counts where id=p_import;
 delete from public.webbase_network_stage where import_id=p_import;
 return counts;
end;$$;

create or replace function public.webbase_network_availability(p_product uuid default null,p_key text default null,p_region text default 'moscow',p_zeros boolean default false,p_sort text default 'warehouse') returns jsonb language sql stable security invoker set search_path='' as $$
with active as(select id,report_date,completed_at from public.webbase_network_imports where status='active'),
item as(select i.* from public.webbase_network_items i join public.webbase_network_snapshot_items m on m.item_key=i.key join active a on a.id=m.import_id where (p_product is not null and i.product_id=p_product) or (p_key is not null and i.key=p_key)),
amounts as(select w.store_id,sum(case when w.kind='warehouse' and not i.is_demo then q.quantity else 0 end)::int warehouse,sum(case when w.kind='display' and not i.is_demo then q.quantity else 0 end)::int display,sum(case when w.kind='defect' and not i.is_demo then q.quantity else 0 end)::int defect,
 sum(case when i.is_demo then q.quantity else 0 end)::int ldu,
 jsonb_agg(jsonb_build_object('warehouse',w.raw_name,'kind',w.kind,'entity',w.legal_entity,'quantity',q.quantity) order by w.raw_name) accounts
 from public.webbase_network_stock q join active a on q.import_id=a.id join item i on q.item_key=i.key join public.webbase_network_warehouses w on w.key=q.warehouse_key
 where w.reviewed and not w.excluded group by w.store_id),
rows as(select s.*,coalesce(a.warehouse,0) warehouse,coalesce(a.display,0) display,coalesce(a.defect,0) defect,coalesce(a.ldu,0) ldu,coalesce(a.accounts,'[]') accounts,
 greatest(coalesce(a.warehouse,0),0)+greatest(coalesce(a.display,0),0) available from public.webbase_network_stores s left join amounts a on a.store_id=s.id
 where s.verified and (p_region='all' or s.region=p_region) and exists(select 1 from item)),
ordered as(select * from rows where p_zeros or available>0 or ldu>0 order by case when p_sort='name' then name end,
 case when p_sort='warehouse' then warehouse>0 when p_sort='present' then available>0 else true end desc,
 case when p_sort='quantity' then available else greatest(warehouse,0) end desc,name)
select jsonb_build_object('report_date',(select report_date from active),'updated_at',(select completed_at from active),'is_demo',coalesce((select bool_or(is_demo) from item),false),'matched',exists(select 1 from item),
'stores',coalesce((select jsonb_agg(to_jsonb(ordered)||jsonb_build_object('total',warehouse+display)) from ordered),'[]'));
$$;
create or replace function public.webbase_network_search(p_query text default '',p_region text default 'moscow',p_offset int default 0,p_limit int default 24,p_demo boolean default false) returns jsonb language sql stable security invoker set search_path='' as $$
with query as materialized(select regexp_split_to_array(public.webbase_network_key(left(p_query,150)),'\s+') tokens,lower(left(p_query,150)) sku),active as(select id,report_date from public.webbase_network_imports where status='active'),
amounts as(select q.item_key,w.store_id,
 sum(q.quantity) filter(where w.kind='warehouse') warehouse,sum(q.quantity) filter(where w.kind='display') display
 from public.webbase_network_stock q join active a on a.id=q.import_id join public.webbase_network_warehouses w on w.key=q.warehouse_key join public.webbase_network_stores s on s.id=w.store_id
 where w.reviewed and not w.excluded and s.verified and (p_region='all' or s.region=p_region) group by q.item_key,w.store_id),
agg as(select k.item_key,coalesce(sum(greatest(a.warehouse,0)+greatest(a.display,0)),0) available from (select m.item_key from public.webbase_network_snapshot_items m join active a on a.id=m.import_id) k left join amounts a on a.item_key=k.item_key group by k.item_key),
found as(select i.key,i.raw_name as name,i.product_id,i.is_demo,p.color,p.memory,p.category,p.network_origin,coalesce(a.available,0) available,
 coalesce((select storage_path from public.webbase_product_images where product_id=p.id order by is_primary desc,sort_order limit 1),p.image_path) image_path
 from agg a join public.webbase_network_items i on i.key=a.item_key left join public.webbase_products p on p.id=i.product_id cross join query
 where (p_demo or not i.is_demo) and (p_query='' or not exists(select 1 from unnest(query.tokens) token where strpos(i.key,token)=0) or lower(coalesce(p.sku,'')) like '%'||query.sku||'%' or lower(array_to_string(p.source_skus,' ')) like '%'||query.sku||'%')),
page as(select * from found order by is_demo,available desc,name,key offset greatest(p_offset,0) limit least(greatest(p_limit,1),48))
select jsonb_build_object('report_date',(select report_date from active),'count',(select count(*) from found),'items',coalesce((select jsonb_agg(to_jsonb(page)) from page),'[]'));
$$;
