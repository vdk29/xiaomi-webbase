create function public.webbase_network_model_key(value text) returns text language sql immutable set search_path='' as $$select trim(regexp_replace(regexp_replace(public.webbase_network_key(value),'(^| )ldu( |$)',' ','g'),'\s+[0-9]+/[0-9]+gb.*$',''));$$;
revoke all on function public.webbase_network_model_key(text) from public,anon;
grant execute on function public.webbase_network_model_key(text),public.webbase_network_photo_key(text) to authenticated,service_role;
create index webbase_network_photo_key_idx on public.webbase_products(public.webbase_network_photo_key(name));
create index webbase_network_model_key_idx on public.webbase_products(public.webbase_network_model_key(name));
create or replace function public.webbase_network_context(p_product uuid) returns jsonb language sql stable security invoker set search_path='' as $$
select jsonb_build_object('product',to_jsonb(p),'donor',(select to_jsonb(d) from public.webbase_products d where d.id<>p.id and not d.is_demo and
 (public.webbase_network_photo_key(d.name)=public.webbase_network_photo_key(p.name) or (p.memory<>'' and public.webbase_network_model_key(d.name)=public.webbase_network_model_key(p.name)))
 order by (d.specs->>'_source_url' is not null) desc,(public.webbase_network_photo_key(d.name)=public.webbase_network_photo_key(p.name)) desc,d.network_origin limit 1),
 'images',coalesce((select jsonb_agg(to_jsonb(i)) from public.webbase_product_images i where i.product_id=(select d.id from public.webbase_products d where d.id<>p.id and not d.is_demo and public.webbase_network_photo_key(d.name)=public.webbase_network_photo_key(p.name) and exists(select 1 from public.webbase_product_images where product_id=d.id) order by d.created_at limit 1)),'[]'))
from public.webbase_products p where p.id=p_product;
$$;
