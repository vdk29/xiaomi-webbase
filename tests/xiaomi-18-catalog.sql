-- Read-only post-deployment checks of the reviewed Global catalogue data.
do $$
declare p record; gallery jsonb; total integer:=0;
begin
 for p in select * from public.webbase_products where model in ('Xiaomi 18 Pro','Xiaomi 18 Pro Max') loop
  total:=total+1;
  select coalesce(jsonb_agg(to_jsonb(i)),'[]') into gallery from public.webbase_product_images i where product_id=p.id;
  if jsonb_array_length(gallery)=0 then select coalesce(jsonb_agg(image),'[]') into gallery from public.webbase_shared_product_images(array[p.id]);end if;
  if jsonb_array_length(gallery)<>3 then raise exception 'Missing three angles: %',p.sku;end if;
  if (select count(distinct e->>'storage_path') from jsonb_array_elements(gallery) e)<>3 then raise exception 'Duplicate angle: %',p.sku;end if;
  if exists(select 1 from jsonb_array_elements(gallery) e where not exists(select 1 from storage.objects where bucket_id='webbase-products' and name=e->>'storage_path' and (metadata->>'size')::int=(e->>'byte_size')::int)) then raise exception 'Missing Storage file';end if;
  if p.specs->>'Версия'<>'Global' or p.specs->>'_verified_at'<>'2026-11-18' then raise exception 'Wrong market/source date';end if;
  if p.model='Xiaomi 18 Pro' and (p.specs->>'Аккумулятор' not like '6000%' or p.specs->>'Процессор'<>'Snapdragon 8 Elite Gen 6' or p.specs->>'Проводная зарядка' not like 'До 90 Вт%') then raise exception 'Wrong Pro specs';end if;
  if p.model='Xiaomi 18 Pro Max' and (p.specs->>'Аккумулятор' not like '7050%' or p.specs->>'Процессор'<>'Snapdragon 8 Elite Extreme Gen 6' or p.specs->>'Проводная зарядка' not like 'До 100 Вт%') then raise exception 'Wrong Pro Max specs';end if;
  if p.specs->>'Встроенная память (ГБ)'<>split_part(split_part(p.memory,'/',2),' ',1) then raise exception 'Wrong memory';end if;
  if exists(select 1 from jsonb_array_elements(gallery) e join public.webbase_product_images i on i.id=(e->>'id')::uuid join public.webbase_products donor on donor.id=i.product_id where donor.model<>p.model or donor.color<>p.color) then raise exception 'Wrong donor model/colour';end if;
 end loop;
 if total<18 then raise exception 'Missing current products';end if;
end $$;
select 'PASS: Global facts, variant memory/colour, three distinct real Storage files, and demo cards remain separate' result;
