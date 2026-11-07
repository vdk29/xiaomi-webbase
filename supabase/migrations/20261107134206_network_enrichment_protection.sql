create or replace function public.webbase_network_finish(p_product uuid,p_result jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare p public.webbase_products;pic jsonb;p_photo boolean;p_description boolean;
begin
 select * into p from public.webbase_products where id=p_product for update;
 if not p.network_origin then raise exception 'Only network-created products may be enriched';end if;
 if not exists(select 1 from public.webbase_network_jobs where product_id=p_product and status='working' and lease_until>now()) then raise exception 'Lease expired';end if;
 pic:=p_result->'image';
 update public.webbase_products set
 description=case when coalesce(description,'')='' then coalesce(p_result->>'description','') else description end,
 specs=coalesce(p_result->'specs','{}')||specs,
 image_path=case when coalesce(image_path,'')='' and not exists(select 1 from public.webbase_product_images where product_id=p_product) then nullif(pic->>'storage_path','') else image_path end
 where id=p_product;
 if pic->>'new_upload'='true' and coalesce(p.image_path,'')='' and not exists(select 1 from public.webbase_product_images where product_id=p_product) then
 insert into public.webbase_product_images(product_id,storage_path,is_primary,mime_type,byte_size,width,height,original_name,source_url)
 values(p_product,pic->>'storage_path',true,pic->>'mime_type',(pic->>'byte_size')::int,(pic->>'width')::int,(pic->>'height')::int,'network-enrichment',pic->>'source_url') on conflict(storage_path) do nothing;
 end if;
 select coalesce(image_path,'')<>'' or exists(select 1 from public.webbase_product_images where product_id=p_product),coalesce(description,'')<>'' into p_photo,p_description from public.webbase_products where id=p_product;
 insert into public.webbase_network_sources(product_id,kind,url,details) select p_product,e->>'kind',e->>'url',coalesce(e->'details','{}') from jsonb_array_elements(coalesce(p_result->'sources','[]')) e;
 update public.webbase_network_jobs set status=case when p_photo and p_description then 'done' else 'review' end,photo_found=p_photo,description_found=p_description,reason=p_result->>'reason',lease_until=null,updated_at=now() where product_id=p_product;
end;$$;

create or replace function public.webbase_network_context(p_product uuid) returns jsonb language sql stable security invoker set search_path='' as $$
select jsonb_build_object('product',to_jsonb(p),'own_image',(select to_jsonb(own) from public.webbase_product_images own where own.product_id=p.id order by own.is_primary desc,own.sort_order limit 1),'donor',(select to_jsonb(d) from public.webbase_products d where d.id<>p.id and not d.is_demo and
 (public.webbase_network_photo_key(d.name)=public.webbase_network_photo_key(p.name) or (p.memory<>'' and public.webbase_network_model_key(d.name)=public.webbase_network_model_key(p.name)))
 order by (d.specs->>'_source_url' is not null) desc,(public.webbase_network_photo_key(d.name)=public.webbase_network_photo_key(p.name)) desc,d.network_origin limit 1),
 'images',coalesce((select jsonb_agg(to_jsonb(i)) from public.webbase_product_images i where i.product_id=(select d.id from public.webbase_products d where d.id<>p.id and not d.is_demo and public.webbase_network_photo_key(d.name)=public.webbase_network_photo_key(p.name) and exists(select 1 from public.webbase_product_images where product_id=d.id) order by d.created_at limit 1)),(select jsonb_agg(to_jsonb(bank)) from(select i.* from public.webbase_product_images i where i.product_id is null and i.variant_key is not null and public.webbase_network_key(i.variant_key)=public.webbase_network_photo_key(p.name) order by i.is_primary desc,i.sort_order,i.created_at limit 1) bank),'[]'))
from public.webbase_products p where p.id=p_product;
$$;
-- Retrieval of reviewed catalogue facts is distinct from a fresh manufacturer verification.
with origin as(select distinct on(s.product_id) s.product_id,s.details->>'donor_id' donor_id from public.webbase_network_sources s where kind='specs_reused' order by s.product_id,s.retrieved_at)
update public.webbase_products p set specs=jsonb_set(p.specs,'{_verified_at}',to_jsonb(d.specs->>'_verified_at'))
from origin o join public.webbase_products d on d.id::text=o.donor_id
where p.id=o.product_id and p.network_origin and p.updated_by is null and d.specs->>'_verified_at' is not null
and not exists(select 1 from public.webbase_network_sources s where s.product_id=p.id and s.kind='manufacturer_specs');
