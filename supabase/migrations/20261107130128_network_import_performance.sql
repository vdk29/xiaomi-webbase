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
 if public.webbase_network_key(col.j->>'raw_name')<>col.j->>'key' then raise exception 'Invalid warehouse key';end if;
 if (col.j->>'total')::int is null or (select sum((payload->'values'->>col.idx::int)::int) from public.webbase_network_stage where import_id=p_import)<>(col.j->>'total')::int then raise exception 'Warehouse total mismatch: %',col.j->>'raw_name';end if;
 insert into public.webbase_network_warehouses(key,raw_name) values(col.j->>'key',col.j->>'raw_name') on conflict(key) do nothing;
 end loop;
 -- Normalize the existing catalog once, never once per incoming product under RLS.
 select coalesce(jsonb_object_agg(k,ids),'{}') into catalog from (
 select (case when p.is_demo then '1:' else '0:' end)||public.webbase_network_key(v.name) k,jsonb_agg(distinct p.id) ids
 from public.webbase_products p cross join lateral(values(p.name),(p.source_name)) v(name) where v.name is not null group by 1
 ) lookup;
 for row in select key,payload as j from public.webbase_network_stage where import_id=p_import order by key loop
 demo:=row.j->>'raw_name' ~* '(^|[ (])ldu([ )]|$)';
 select product_id into p_id from public.webbase_network_items where key=row.key;
 reason:=null;
 if p_id is null then
 select array_agg(value::uuid) into matches from jsonb_array_elements_text(coalesce(catalog->((case when demo then '1:' else '0:' end)||row.key),'[]'));

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
 insert into public.webbase_network_stock(import_id,item_key,warehouse_key,quantity)
 select p_import,t.key,c.value->>'key',(t.payload->'values'->>(c.ordinality-1)::int)::int
 from public.webbase_network_stage t cross join jsonb_array_elements(imp.columns) with ordinality c(value,ordinality) where t.import_id=p_import;
 counts:=jsonb_build_object('recognized',imp.expected_items,'created',created,'linked',linked,'ambiguous',ambiguous,'total',sum_total,'skipped',jsonb_array_length(imp.skipped),'negative',imp.negative_count,'warehouses',jsonb_array_length(imp.columns),'stores',(select count(distinct w.store_id) from public.webbase_network_warehouses w where w.reviewed and not w.excluded and w.key in(select value->>'key' from jsonb_array_elements(imp.columns))),'unknown_warehouses',(select count(*) from public.webbase_network_warehouses w where not w.reviewed and w.key in(select value->>'key' from jsonb_array_elements(imp.columns))));
 update public.webbase_network_imports set status='archived' where status='active';
 update public.webbase_network_imports set status='active',completed_at=now(),summary=counts where id=p_import;
 delete from public.webbase_network_stage where import_id=p_import;
 return counts;
end;$$;
