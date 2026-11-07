-- Reuse a verified orphan gallery before attempting any external download.
create or replace function public.webbase_network_context(p_product uuid) returns jsonb language sql stable security invoker set search_path='' as $$
select jsonb_build_object('product',to_jsonb(p),'donor',(select to_jsonb(d) from public.webbase_products d where d.id<>p.id and not d.is_demo and
 (public.webbase_network_photo_key(d.name)=public.webbase_network_photo_key(p.name) or (p.memory<>'' and public.webbase_network_model_key(d.name)=public.webbase_network_model_key(p.name)))
 order by (d.specs->>'_source_url' is not null) desc,(public.webbase_network_photo_key(d.name)=public.webbase_network_photo_key(p.name)) desc,d.network_origin limit 1),
 'images',coalesce((select jsonb_agg(to_jsonb(i)) from public.webbase_product_images i where i.product_id=(select d.id from public.webbase_products d where d.id<>p.id and not d.is_demo and public.webbase_network_photo_key(d.name)=public.webbase_network_photo_key(p.name) and exists(select 1 from public.webbase_product_images where product_id=d.id) order by d.created_at limit 1)),(select jsonb_agg(to_jsonb(bank)) from(select i.* from public.webbase_product_images i where i.product_id is null and i.variant_key is not null and public.webbase_network_key(i.variant_key)=public.webbase_network_photo_key(p.name) order by i.is_primary desc,i.sort_order,i.created_at limit 1) bank),'[]'))
from public.webbase_products p where p.id=p_product;
$$;

create index webbase_network_images_variant_idx on public.webbase_product_images(public.webbase_network_key(variant_key)) where product_id is null and variant_key is not null;
