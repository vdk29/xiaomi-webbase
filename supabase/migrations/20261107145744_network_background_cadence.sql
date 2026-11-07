create or replace function public.webbase_network_finish(p_product uuid,p_result jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare p public.webbase_products;pic jsonb;p_photo boolean;p_description boolean;
begin
 select * into p from public.webbase_products where id=p_product for update;
 if not p.network_origin then raise exception 'Only network-created products may be enriched';end if;
 if not exists(select 1 from public.webbase_network_jobs where product_id=p_product and status='working' and lease_until>now()) then raise exception 'Lease expired';end if;
 if p_result ? 'identity' and public.webbase_network_key(p.name)<>p_result->>'identity' then
 update public.webbase_network_jobs set status='review',reason='Название изменено во время обработки; проверьте модификацию и повторите заполнение',lease_until=null,updated_at=now() where product_id=p_product;return;
 end if;
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
-- Small image batches stay within Edge CPU limits; no HTTP call runs when the queue is empty.
select cron.alter_job(job_id:=(select jobid from cron.job where jobname='webbase-network-enrichment'),schedule:='20 seconds',command:=(select replace(command,'timeout_milliseconds:=1000','timeout_milliseconds:=5000') from cron.job where jobname='webbase-network-enrichment'));
-- Only this extension's operational scheduler logs are retained for seven days.
select cron.schedule('webbase-network-log-retention','15 3 * * *',$job$delete from cron.job_run_details where jobid=(select jobid from cron.job where jobname='webbase-network-enrichment') and end_time<now()-interval '7 days';$job$);
