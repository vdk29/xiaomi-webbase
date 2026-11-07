-- Synthetic rollback-only fixtures; no private Excel or production stock changes.
begin;
select set_config('request.jwt.claim.sub',(select user_id::text from public.webbase_staff where active and role='admin' limit 1),true);
set local role authenticated;
create temporary table network_qa_result(label text,value text);
do $$
declare imp jsonb;rep jsonb;new_id uuid;existing_id uuid;demo_id uuid;key_existing text;args jsonb;photo_id uuid;before_stock text;data jsonb;second uuid;
begin
 select md5(string_agg(product_id||':'||warehouse||':'||display||':'||ldu,',' order by product_id)) into before_stock from public.webbase_stock;
 insert into public.webbase_products(sku,name,description,specs) values('NETWORK-QA-EXISTING','Смартфон QA Network 8GB+128GB Black','Ручное описание','{"Ручная характеристика":"сохранить"}') returning id into existing_id;
 insert into public.webbase_products(sku,name) values('NETWORK-QA-DUP-1','Смартфон QA Duplicate 8GB+128GB Black'),('NETWORK-QA-DUP-2','смартфон QA Duplicate 8GB+128GB Black');
 insert into public.webbase_product_images(product_id,storage_path,mime_type,uploaded_by) values(existing_id,'products/00000000-0000-4000-8000-000000000001/00000000-0000-4000-8000-000000000002.webp','image/webp',auth.uid()) returning id into photo_id;
 insert into public.webbase_network_stores(id,name,region,verified) values('network-qa-moscow','QA Москва','moscow',true),('network-qa-spb','QA Петербург','spb',true);
 insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,reviewed,excluded) values
 ('qa склад','QA склад','network-qa-moscow','warehouse',true,false),('qa ов','QA ОВ','network-qa-moscow','display',true,false),('qa брак','QA брак','network-qa-moscow','defect',true,false),('qa транзит','QA транзит',null,'service',true,true);
 args:='{"file_hash":"0000000000000000000000000000000000000000000000000000000000000000","filename":"synthetic-qa.xlsx","report_date":"2099-01-01","item_count":4,"total":11,"columns":[{"key":"qa склад","raw_name":"QA склад","total":6},{"key":"qa ов","raw_name":"QA ОВ","total":4},{"key":"qa брак","raw_name":"QA брак","total":2},{"key":"qa транзит","raw_name":"QA транзит","total":-1}]}'::jsonb;
 imp:=public.webbase_network_begin(args);
 perform public.webbase_network_stage((imp->>'id')::uuid,(select jsonb_agg(x||jsonb_build_object('key',public.webbase_network_key(x->>'raw_name'))) from jsonb_array_elements('[{"raw_name":"Смартфон QA Network 8GB+128GB Black","row":9,"values":[5,2,1,-1],"total":7},{"raw_name":"Смартфон QA Network 8GB+256GB Black","row":10,"category":"Смартфоны","brand":"QA","model":"QA Network","memory":"8/256 ГБ","color":"Black","ram":8,"storage":256,"values":[0,1,1,0],"total":2},{"raw_name":"(LDU) Смартфон QA Network 8GB+128GB White","row":11,"values":[0,1,0,0],"total":1},{"raw_name":"Смартфон QA Duplicate 8GB+128GB Black","row":12,"values":[1,0,0,0],"total":1}]') x));
 rep:=public.webbase_network_commit((imp->>'id')::uuid);
 if rep->>'created'<>'2' or rep->>'linked'<>'1' or rep->>'ambiguous'<>'1' then raise exception 'Bad matching counts: %',rep;end if;
 data:=public.webbase_network_availability(existing_id,null,'moscow',false,'warehouse');
 if data->'stores'->0->>'warehouse'<>'5' or data->'stores'->0->>'display'<>'2' or data->'stores'->0->>'defect'<>'1' or data->'stores'->0->>'total'<>'7' then raise exception 'Bad warehouse/OV/defect math: %',data;end if;
 if jsonb_array_length(data->'stores')<>1 then raise exception 'Service warehouses leaked';end if;
 select product_id into new_id from public.webbase_network_items where key=public.webbase_network_key('Смартфон QA Network 8GB+256GB Black');
 if exists(select 1 from public.webbase_stock where product_id=new_id) then raise exception 'Network import wrote local stock';end if;
 insert into public.webbase_product_images(product_id,storage_path,mime_type,uploaded_by) values(new_id,'products/00000000-0000-4000-8000-000000000003/00000000-0000-4000-8000-000000000004.webp','image/webp',auth.uid());
 if not exists(select 1 from public.webbase_product_images where product_id=new_id and ('network:'||md5(public.webbase_network_key('Смартфон QA Network 8GB+256GB Black')))=any(sku_keys)) then raise exception 'Network photo identity missing';end if;
 update public.webbase_products set sku='NETWORK-QA-ADOPTED',source_skus=array['NETWORK-QA-ADOPTED'] where id=new_id;
 if not exists(select 1 from public.webbase_product_images where product_id=new_id and cardinality(sku_keys)>=2) then raise exception 'Photo identity lost on local SKU adoption';end if;
 data:=public.webbase_network_availability(new_id,null,'moscow',false,'warehouse');
 if data->'stores'->0->>'warehouse'<>'0' or data->'stores'->0->>'display'<>'1' or data->'stores'->0->>'total'<>'1' then raise exception 'Display-only total is wrong';end if;
 select product_id into demo_id from public.webbase_network_items where key=public.webbase_network_key('(LDU) Смартфон QA Network 8GB+128GB White');
 data:=public.webbase_network_availability(demo_id,null,'moscow',false,'warehouse');
 if data->>'is_demo'<>'true' or data->'stores'->0->>'available'<>'0' or data->'stores'->0->>'ldu'<>'1' then raise exception 'LDU offered as normal stock: %',data;end if;
 data:=public.webbase_network_search('QA Network','moscow',0,24,false);
 if data->>'count'<>'2' then raise exception 'Demo mixed into ordinary search';end if;
 data:=public.webbase_network_availability(existing_id,null,'spb',true,'warehouse');if exists(select 1 from jsonb_array_elements(data->'stores')s where s->>'region'<>'spb') then raise exception 'Region leaked';end if;
 if (select description from public.webbase_products where id=existing_id)<>'Ручное описание' or not exists(select 1 from public.webbase_product_images where id=photo_id and product_id=existing_id) then raise exception 'Manual content changed';end if;
 if (select md5(string_agg(product_id||':'||warehouse||':'||display||':'||ldu,',' order by product_id)) from public.webbase_stock) is distinct from before_stock then raise exception 'Local stock changed';end if;
 if public.webbase_network_begin(args)->>'id'<>imp->>'id' or public.webbase_network_commit((imp->>'id')::uuid)->>'repeated'<>'true' then raise exception 'Not idempotent';end if;
 second:=(public.webbase_network_begin(args||jsonb_build_object('file_hash',repeat('1',64)))->>'id')::uuid;
 begin perform public.webbase_network_commit(second);raise exception 'Incomplete import accepted';exception when others then if sqlerrm='Incomplete import accepted' then raise;end if;end;
 if (select id from public.webbase_network_imports where status='active')<>(imp->>'id')::uuid then raise exception 'Failed import displaced active snapshot';end if;
 insert into network_qa_result values('transactional_network_import','PASS'),('local_stock_and_photos_unchanged','PASS'),('exact_variants_LDU_ambiguity_regions','PASS');
end;$$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000099',true);
set local role authenticated;
do $$begin
 if (select count(*) from public.webbase_network_stock)>0 then raise exception 'Unapproved user read stock';end if;
 begin perform public.webbase_network_begin('{}');raise exception 'Unapproved user imported';exception when insufficient_privilege then null;end;
end;$$;
reset role;
set local role anon;
do $$begin
 begin perform public.webbase_network_search();raise exception 'Anonymous RPC access';exception when insufficient_privilege then null;end;
 begin perform 1 from public.webbase_network_stock;raise exception 'Anonymous table access';exception when insufficient_privilege then null;end;
end;$$;
reset role;
select * from network_qa_result;
rollback;
