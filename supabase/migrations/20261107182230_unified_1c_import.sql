-- One validated report can publish the network and Europolis in a single transaction.
-- Raw defect quantities remain available to the network; local quantities exclude them.
alter table public.webbase_network_imports add column local_synced_at timestamptz, add column local_summary jsonb;
-- Exact factory-code adoption also applies to cards created by earlier network reports.
create or replace function public.webbase_network_commit(p_import uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare imp public.webbase_network_imports;row record;col record;p_id uuid;matches uuid[];created int:=0;linked int:=0;ambiguous int:=0;demo boolean;sum_total int;counts jsonb;reason text; catalog jsonb;sku_lookup jsonb;
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
 select coalesce(jsonb_object_agg(k,ids),'{}') into sku_lookup from (
 select (case when p.is_demo then '1:' else '0:' end)||lower(trim(code)) k,jsonb_agg(distinct p.id) ids
 from public.webbase_products p cross join lateral unnest(coalesce(p.source_skus,'{}')||array[p.sku]) code
 where p.active and nullif(trim(code),'') is not null group by 1) lookup;
 for row in select key,payload as j from public.webbase_network_stage where import_id=p_import order by key loop
 demo:=row.j->>'raw_name' ~* '(^|[ (])ldu([ )-]|$)';
 select product_id into p_id from public.webbase_network_items where key=row.key;
 reason:=null;
 if p_id is null then
 if jsonb_typeof(coalesce(row.j->'source_skus','[]'))<>'array' then raise exception 'Invalid source SKUs';end if;
 select array_agg(distinct id::uuid) into matches from jsonb_array_elements_text(coalesce(row.j->'source_skus','[]')) code
 cross join lateral jsonb_array_elements_text(coalesce(sku_lookup->((case when demo then '1:' else '0:' end)||lower(trim(code))),'[]')) id;
 if coalesce(cardinality(matches),0)=0 then
 select array_agg(value::uuid) into matches from jsonb_array_elements_text(coalesce(catalog->((case when demo then '1:' else '0:' end)||row.key),'[]'));
 end if;

 if coalesce(cardinality(matches),0)=0 and row.j->>'raw_name' ~* '\(BHR[A-Z0-9]+\)' then
 select array_agg(id) into matches from public.webbase_products p where p.active and p.is_demo=demo and p.category=row.j->>'category'
 and upper(substring(p.name from '(?i)\((BHR[A-Z0-9]+)\)'))=upper(substring(row.j->>'raw_name' from '(?i)\((BHR[A-Z0-9]+)\)'))
 and (coalesce(row.j->>'memory','')='' or coalesce(p.memory,'')='' or public.webbase_network_key(p.memory)=public.webbase_network_key(row.j->>'memory'))
 and (coalesce(row.j->>'color','')='' or coalesce(p.color,'')='' or public.webbase_network_key(p.color)=public.webbase_network_key(row.j->>'color'));
 end if;
 if coalesce(cardinality(matches),0)=1 then p_id:=matches[1];linked:=linked+1;
 elsif coalesce(cardinality(matches),0)>1 then reason:='Неоднозначное совпадение названия';ambiguous:=ambiguous+1;
 else
 insert into public.webbase_products(external_id,sku,source_skus,name,source_name,category,brand,model,memory,color,active,network_origin,is_demo,specs)
 values('network:'||md5(row.key),nullif((select string_agg(value,' / ') from jsonb_array_elements_text(coalesce(row.j->'source_skus','[]'))),''),array(select value from jsonb_array_elements_text(coalesce(row.j->'source_skus','[]'))),row.j->>'raw_name',row.j->>'raw_name',case when demo then 'Демонстрационные устройства' else row.j->>'category' end,row.j->>'brand',row.j->>'model',row.j->>'memory',row.j->>'color',true,true,demo,
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

create function public.webbase_network_retail_name(p_name text) returns text language sql immutable set search_path='' as $$
 select trim(regexp_replace(regexp_replace(p_name,'(?i)(^|[ (])ldu([ )-]|$)',' ','g'),'\s+',' ','g'));
$$;
revoke all on function public.webbase_network_retail_name(text) from public,anon;
grant execute on function public.webbase_network_retail_name(text) to authenticated,service_role;

create function public.webbase_unified_commit(p_import uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare imp public.webbase_network_imports; local_store text; keys text[]; net jsonb; row record; target uuid; candidates uuid[]; seen uuid[]:='{}'; written int:=0; zeroed int:=0; created int:=0; summary jsonb;
begin
 if not private.webbase_is_admin() then raise exception 'Administrator required' using errcode='42501';end if;
 -- Match lock ordering to the network publisher; serialize against the legacy local importer too.
 perform pg_advisory_xact_lock(hashtext('webbase_network_snapshot'));
 perform pg_advisory_xact_lock(20261106,19);
 select * into imp from public.webbase_network_imports where id=p_import for update;
 if imp.id is null then raise exception 'Import missing';end if;
 if imp.status='archived' then raise exception 'Этот отчёт уже заменён более свежим. Загрузите актуальный файл.';end if;
 if imp.local_synced_at is not null then return jsonb_build_object('network',imp.summary,'local',imp.local_summary,'repeated',true);end if;
 if (select count(*) from public.webbase_network_stores where is_local and verified)<>1 then raise exception 'Не определён единственный магазин Европолис';end if;
 select id into local_store from public.webbase_network_stores where is_local and verified;
 select array_agg(w.key) into keys from public.webbase_network_warehouses w
 where w.store_id=local_store and w.company='smart_orange' and w.reviewed and not w.excluded and w.kind in ('warehouse','display')
 and exists(select 1 from jsonb_array_elements(imp.columns)c where c->>'key'=w.key);
 if not exists(select 1 from public.webbase_network_warehouses where key=any(keys) and kind='warehouse')
 or not exists(select 1 from public.webbase_network_warehouses where key=any(keys) and kind='display') then
 raise exception 'В отчёте не найдены склад и ОВ Европолиса Smart Orange. Локальные остатки не изменены.';end if;
 net:=public.webbase_network_commit(p_import);
 if exists(select 1 from public.webbase_network_stock q join public.webbase_network_items i on i.key=q.item_key where q.import_id=p_import and q.warehouse_key=any(keys) and q.quantity<>0 and i.product_id is null) then
 raise exception 'Есть несопоставленные товары Европолиса. Исправьте связи до общей синхронизации.';end if;
 for row in
 with local_rows as (
 select i.*,p.name as product_name,p.brand,p.model,p.memory,p.color,p.category,
 sum(q.quantity) filter(where w.kind='warehouse') wh,sum(q.quantity) filter(where w.kind='display') ov
 from public.webbase_network_stock q join public.webbase_network_items i on i.key=q.item_key join public.webbase_products p on p.id=i.product_id
 join public.webbase_network_warehouses w on w.key=q.warehouse_key
 where q.import_id=p_import and w.key=any(keys) and i.raw_name !~* '\(\s*(пф|pf)\s*\)' and coalesce(p.sku,'') !~* '\(\s*(пф|pf)\s*\)' group by i.key,p.id
 ), grouped as (
 select public.webbase_network_key(public.webbase_network_retail_name(raw_name)) retail_key,
 min(public.webbase_network_retail_name(raw_name)) name,
 array_agg(distinct product_id) filter(where not is_demo) ids,
 greatest(coalesce(sum(coalesce(wh,0)) filter(where not is_demo),0),0)::int warehouse,
 greatest(coalesce(sum(coalesce(ov,0)) filter(where not is_demo),0),0)::int regular_display,
 greatest(coalesce(sum(coalesce(wh,0)+coalesce(ov,0)) filter(where is_demo),0),0)::int ldu
 from local_rows group by 1)
 select * from grouped where warehouse>0 or regular_display>0 or ldu>0
 loop
  target:=null;
  if cardinality(row.ids)>1 then raise exception 'Несколько карточек соответствуют локальному товару: %',row.name;end if;
  if cardinality(row.ids)=1 then target:=row.ids[1];
  else
   select array_agg(id) into candidates from public.webbase_products p where p.active and not p.is_demo
   and (public.webbase_network_key(p.name)=row.retail_key or public.webbase_network_key(p.source_name)=row.retail_key);
   if cardinality(candidates)>1 then raise exception 'Неоднозначная карточка для LDU: %',row.name;end if;
   if cardinality(candidates)=1 then target:=candidates[1];else
    insert into public.webbase_products(external_id,name,source_name,category,network_origin,is_demo)
    values('network:'||md5(row.retail_key),row.name,row.name,case when row.name ~* '^смартфон' then 'Смартфоны' when row.name ~* '^планшет' then 'Планшеты' when row.name ~* '^(смарт-часы|часы)' then 'Смарт-часы' when row.name ~* '^наушники' then 'Наушники' else 'Аксессуары и другое' end,true,false) returning id into target;
    insert into public.webbase_network_jobs(product_id,import_id) values(target,p_import) on conflict do nothing;
    created:=created+1;
   end if;
  end if;
  if target=any(seen) then raise exception 'Разные позиции совпали с одной локальной карточкой: %',row.name;end if;
  seen:=array_append(seen,target);
  insert into public.webbase_stock(product_id,warehouse,display,ldu,updated_at,updated_by)
  values(target,row.warehouse,row.regular_display+row.ldu,row.ldu,now(),auth.uid())
  on conflict(product_id) do update set warehouse=excluded.warehouse,display=excluded.display,ldu=excluded.ldu,updated_at=excluded.updated_at,updated_by=excluded.updated_by;
  written:=written+1;
 end loop;
 update public.webbase_stock set warehouse=0,display=0,ldu=0,updated_at=now(),updated_by=auth.uid()
 where not(product_id=any(seen)) and (warehouse<>0 or display<>0 or ldu<>0);
 get diagnostics zeroed=row_count;
 summary:=jsonb_build_object('updated',written,'created',created,'zeroed',zeroed,'warehouse',(select coalesce(sum(warehouse),0) from public.webbase_stock),'display',(select coalesce(sum(display),0) from public.webbase_stock),'ldu',(select coalesce(sum(ldu),0) from public.webbase_stock));
 insert into public.webbase_imports(filename,actor_id,status,recognized,skipped,needs_review) values(imp.filename,auth.uid(),'applied',written,0,0);
 update public.webbase_network_imports set local_synced_at=now(),local_summary=summary where id=p_import;
 return jsonb_build_object('network',net,'local',summary,'repeated',false);
end;$$;
revoke all on function public.webbase_unified_commit(uuid) from public,anon;
grant execute on function public.webbase_unified_commit(uuid) to authenticated;
