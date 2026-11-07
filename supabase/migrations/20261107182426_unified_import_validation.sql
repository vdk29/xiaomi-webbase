-- Keep PL/pgSQL result variables distinct from the import summary column.
create or replace function public.webbase_unified_commit(p_import uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare imp public.webbase_network_imports; local_store text; keys text[]; net jsonb; row record; target uuid; candidates uuid[]; seen uuid[]:='{}'; written int:=0; zeroed int:=0; created int:=0; local_result jsonb;
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
 local_result:=jsonb_build_object('updated',written,'created',created,'zeroed',zeroed,'warehouse',(select coalesce(sum(warehouse),0) from public.webbase_stock),'display',(select coalesce(sum(display),0) from public.webbase_stock),'ldu',(select coalesce(sum(ldu),0) from public.webbase_stock));
 insert into public.webbase_imports(filename,actor_id,status,recognized,skipped,needs_review) values(imp.filename,auth.uid(),'applied',written,0,0);
 update public.webbase_network_imports set local_synced_at=now(),local_summary=local_result where id=p_import;
 return jsonb_build_object('network',net,'local',local_result,'repeated',false);
end;$$;
revoke all on function public.webbase_unified_commit(uuid) from public,anon;
grant execute on function public.webbase_unified_commit(uuid) to authenticated;
