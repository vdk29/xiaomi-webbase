-- Rollback-only end-to-end unified import. No real report or stock is committed.
begin;
select set_config('request.jwt.claim.sub',(select user_id::text from public.webbase_staff where active and role='admin' limit 1),true);
set local role authenticated;
create temporary table unified_qa_result(label text,value text);
do $$
declare existing uuid;missing uuid;imp uuid;bad uuid;new_id uuid;meta jsonb;result jsonb;stock jsonb;before_count int;
begin
 insert into public.webbase_products(sku,source_skus,name,description,specs) values('UNIFIED-123',array['UNIFIED-123'],'Ручное название смартфона','Не затирать','{"Ручной факт":"сохранить"}') returning id into existing;
 insert into public.webbase_products(sku,name) values('UNIFIED-MISSING','QA absent from report') returning id into missing;
 insert into public.webbase_stock(product_id,warehouse,display,ldu) values(existing,99,99,0),(missing,17,2,0);
 insert into public.webbase_product_images(product_id,storage_path,mime_type,uploaded_by) values(existing,'products/00000000-0000-4000-8000-000000000001/00000000-0000-4000-8000-000000000003.webp','image/webp',auth.uid());
 meta:='{"file_hash":"2222222222222222222222222222222222222222222222222222222222222222","filename":"unified-test.xlsx","report_date":"2099-02-01","item_count":5,"total":488,"columns":[{"key":"склад тц европолис","raw_name":"Склад ТЦ Европолис","total":108},{"key":"склад тц европолис ов","raw_name":"Склад ТЦ Европолис ОВ","total":107},{"key":"склад тц европолис брак","raw_name":"Склад ТЦ Европолис Брак","total":123},{"key":"склад тц авиапарк (mobilidi)","raw_name":"Склад ТЦ Авиапарк (MOBILIDI)","total":150}]}'::jsonb;
 imp:=(public.webbase_network_begin(meta)->>'id')::uuid;
 perform public.webbase_network_stage(imp,(select jsonb_agg(x||jsonb_build_object('key',public.webbase_network_key(x->>'raw_name'))) from jsonb_array_elements('[{"raw_name":"Смартфон QA Unified 8GB+128GB Black","source_skus":["UNIFIED-123"],"category":"Смартфоны","row":9,"values":[5,2,9,100],"total":116},{"raw_name":"(LDU) Смартфон QA Unified 8GB+128GB Black","source_skus":["UNIFIED-123"],"category":"Смартфоны","row":10,"values":[1,2,7,50],"total":60},{"raw_name":"Смартфон QA Unified 8GB+256GB Black","source_skus":["UNIFIED-256"],"category":"Смартфоны","row":11,"values":[0,3,8,0],"total":11},{"raw_name":"(LDU) Смартфон QA Unified 8GB+128GB White","category":"Смартфоны","row":12,"values":[2,0,99,0],"total":101},{"raw_name":"(ПФ) Смартфон QA defective","row":13,"values":[100,100,0,0],"total":200}]')x));
 result:=public.webbase_unified_commit(imp);
 if result->'local'->>'warehouse'<>'5' or result->'local'->>'display'<>'10' or result->'local'->>'ldu'<>'5' then raise exception 'Local stock mixed with defect/other stores/PF: %',result;end if;
 select to_jsonb(s) into stock from public.webbase_stock s where product_id=existing;
 if stock->>'warehouse'<>'5' or stock->>'display'<>'5' or stock->>'ldu'<>'3' then raise exception 'SKU adoption or LDU grouping failed: %',stock;end if;
 if (select warehouse+display from public.webbase_stock where product_id=missing)<>0 then raise exception 'Absent stock not zeroed';end if;
 if (select name from public.webbase_products where id=existing)<>'Ручное название смартфона' or (select description from public.webbase_products where id=existing)<>'Не затирать' or not exists(select 1 from public.webbase_product_images where product_id=existing) then raise exception 'Manual card/photo overwritten';end if;
 if (select count(*) from public.webbase_products where sku='UNIFIED-123' and not is_demo)<>1 then raise exception 'SKU duplicate created';end if;
 select id into new_id from public.webbase_products where sku='UNIFIED-256';
 if new_id is null or (select display from public.webbase_stock where product_id=new_id)<>3 then raise exception 'New card SKU not retained';end if;
 result:=public.webbase_network_availability(existing,null,'all',false,'quantity','smart_orange');
 if result->'stores'->0->>'warehouse'<>'5' or result->'stores'->0->>'display'<>'2' or result->'stores'->0->>'defect'<>'9' then raise exception 'Network display/defect changed: %',result;end if;
 select count(*) into before_count from public.webbase_products;
 if public.webbase_unified_commit(imp)->>'repeated'<>'true' or (select count(*) from public.webbase_products)<>before_count then raise exception 'Repeat not idempotent';end if;
 -- Failure after the network commit must roll back network publication AND local changes.
 insert into public.webbase_products(name) values('Смартфон QA ambiguous local'),('Смартфон QA ambiguous local');
 meta:=meta||jsonb_build_object('file_hash',repeat('3',64),'item_count',1,'total',1,'columns',jsonb_build_array(jsonb_build_object('key','склад тц европолис','raw_name','Склад ТЦ Европолис','total',1),jsonb_build_object('key','склад тц европолис ов','raw_name','Склад ТЦ Европолис ОВ','total',0)));
 bad:=(public.webbase_network_begin(meta)->>'id')::uuid;
 perform public.webbase_network_stage(bad,jsonb_build_array(jsonb_build_object('key',public.webbase_network_key('Смартфон QA ambiguous local'),'raw_name','Смартфон QA ambiguous local','row',9,'values',jsonb_build_array(1,0),'total',1)));
 begin perform public.webbase_unified_commit(bad);raise exception 'Ambiguity was accepted';exception when others then if sqlerrm='Ambiguity was accepted' then raise;end if;end;
 if (select id from public.webbase_network_imports where status='active')<>imp or (select warehouse from public.webbase_stock where product_id=existing)<>5 then raise exception 'Failed unified transaction changed live data';end if;
 -- Conflicting ordinary SKUs and missing local columns are both rejected before publication.
 meta:=meta||jsonb_build_object('file_hash',repeat('4',64),'item_count',2,'total',2,'columns',jsonb_build_array(jsonb_build_object('key','склад тц европолис','raw_name','Склад ТЦ Европолис','total',2),jsonb_build_object('key','склад тц европолис ов','raw_name','Склад ТЦ Европолис ОВ','total',0)));
 bad:=(public.webbase_network_begin(meta)->>'id')::uuid;
 perform public.webbase_network_stage(bad,(select jsonb_agg(jsonb_build_object('key',public.webbase_network_key(name),'raw_name',name,'source_skus',jsonb_build_array('UNIFIED-COLLISION'),'row',9,'values',jsonb_build_array(1,0),'total',1)) from unnest(array['Смартфон QA collision 8/128 Black','Смартфон QA collision 8/256 Black'])name));
 begin perform public.webbase_unified_commit(bad);raise exception 'Duplicate SKU accepted';exception when others then if sqlerrm not like 'Один артикул%' then raise;end if;end;
 meta:=meta||jsonb_build_object('file_hash',repeat('5',64),'item_count',1,'total',1,'columns',jsonb_build_array(jsonb_build_object('key','склад тц европолис','raw_name','Склад ТЦ Европолис','total',1)));
 bad:=(public.webbase_network_begin(meta)->>'id')::uuid;
 begin perform public.webbase_unified_commit(bad);raise exception 'Missing OV accepted';exception when others then if sqlerrm not like 'В отчёте не найдены%' then raise;end if;end;
 if (select id from public.webbase_network_imports where status='active')<>imp then raise exception 'Validation failure replaced active report';end if;
 insert into unified_qa_result values('duplicate_SKU_and_missing_OV_rejected','PASS');
 -- Ordinary and demo stock may share a factory SKU; local SKU import still targets only ordinary cards.
 if (select count(*) from public.webbase_products where sku='UNIFIED-123' and is_demo)<>1 then raise exception 'Shared demo article not preserved';end if;
 begin insert into public.webbase_products(sku,name) values('UNIFIED-123','Ordinary duplicate');raise exception 'Ordinary duplicate accepted';exception when unique_violation then null;end;
 begin insert into public.webbase_products(sku,name,is_demo) values('UNIFIED-123','Demo duplicate',true);raise exception 'Demo duplicate accepted';exception when unique_violation then null;end;
 perform public.webbase_apply_import('shared-demo-SKU-legacy.xlsx','[{"source_key":"ручное название смартфона","name":"Ручное название смартфона","sku":"UNIFIED-123","source_skus":["UNIFIED-123"],"category":"Смартфоны","warehouse":6,"display":2,"ldu":0}]'::jsonb);
 if (select warehouse from public.webbase_stock where product_id=existing)<>6 then raise exception 'Legacy SKU import targeted demo';end if;
 -- A unit suffix cannot create another card of the same exact model/colour/memory.
 insert into public.webbase_products(name,description) values('Смартфон QA Unit 12GB+512GB Black','Ручное описание без артикула') returning id into new_id;
 meta:=meta||jsonb_build_object('file_hash',repeat('6',64),'item_count',1,'total',1,'columns',jsonb_build_array(jsonb_build_object('key','склад тц европолис','raw_name','Склад ТЦ Европолис','total',1),jsonb_build_object('key','склад тц европолис ов','raw_name','Склад ТЦ Европолис ОВ','total',0)));
 bad:=(public.webbase_network_begin(meta)->>'id')::uuid;
 perform public.webbase_network_stage(bad,jsonb_build_array(jsonb_build_object('key',public.webbase_network_key('Смартфон QA Unit 12GB+512GB Black, шт'),'raw_name','Смартфон QA Unit 12GB+512GB Black, шт','source_skus','[]'::jsonb,'row',9,'values',jsonb_build_array(1,0),'total',1)));
 result:=public.webbase_unified_commit(bad);
 if result->'network'->>'created'<>'0' or result->'network'->>'linked'<>'1' or (select warehouse from public.webbase_stock where product_id=new_id)<>1 or (select description from public.webbase_products where id=new_id)<>'Ручное описание без артикула' then raise exception 'Unit suffix duplicated or overwrote a card: %',result;end if;
 insert into unified_qa_result values('shared_demo_SKU_and_legacy_compatibility','PASS'),('unit_suffix_reuses_existing_card_without_article','PASS');
 insert into unified_qa_result values('atomic_network_and_local_sku_adoption','PASS'),('local_excludes_defects_and_other_stores','PASS'),('demo_only_and_paired_LDU_not_sellable','PASS'),('manual_images_fields_idempotency_rollback','PASS');
end;$$;
reset role;
select set_config('request.jwt.claim.sub',(select user_id::text from public.webbase_staff where active and role='staff' limit 1),true);
set local role authenticated;
do $$begin
 begin perform public.webbase_unified_commit((select id from public.webbase_network_imports where status='active'));raise exception 'Staff imported';exception when insufficient_privilege then null;end;
end;$$;
reset role;
set local role anon;
do $$begin
 begin perform public.webbase_unified_commit(null);raise exception 'Anon imported';exception when insufficient_privilege then null;end;
end;$$;
reset role;
select * from unified_qa_result;
rollback;
