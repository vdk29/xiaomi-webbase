-- Read permission checks and a stock-change fixture; no committed stock changes.
begin;
select set_config('request.jwt.claim.sub',(select user_id::text from webbase_staff where active and role='admin' limit 1),true);
set local role authenticated;
do $$
declare product uuid; n integer;
begin
 if has_table_privilege('anon','public.webbase_catalog','select') then raise exception 'Anonymous catalog access'; end if;
 if exists(select 1 from webbase_catalog c join webbase_stock s on s.product_id=c.id where c.catalog_in_stock is distinct from (s.warehouse+s.display>0)) then raise exception 'Availability mismatch'; end if;
 if (select count(*) from webbase_catalog)<>(select count(*) from webbase_products) then raise exception 'RLS or join dropped products'; end if;
 select count(*) into n from webbase_catalog where active and catalog_in_stock;
 if n>=50 and exists(select 1 from (select catalog_in_stock from webbase_catalog where active order by catalog_in_stock desc,category desc nulls last,name,id limit 50) first_page where not catalog_in_stock) then raise exception 'First page contains zero stock'; end if;
 select id into product from webbase_catalog where active and not catalog_in_stock limit 1;
 if product is not null then
  update webbase_stock set warehouse=1 where product_id=product;
  if not(select catalog_in_stock from webbase_catalog where id=product) then raise exception 'Rank did not react to stock update'; end if;
 end if;
end $$;
reset role;
select 'PASS: live stock priority, staff RLS, full catalog and anonymous denial; stock fixture rolls back' result;
rollback;
