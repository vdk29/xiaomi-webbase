-- Read-only category/RLS regression against the existing active snapshot.
begin;
select set_config('request.jwt.claim.sub',(select user_id::text from public.webbase_staff where active and role='staff' limit 1),true);
set local role authenticated;
create temporary table network_category_results(label text,value text);
do $$declare company text;cat text;all_rows jsonb;filtered jsonb;empty_rows jsonb;category_sum int;begin
 foreach company in array array['smart_orange','mobility','mixtech'] loop
  all_rows:=public.webbase_network_search('','all',0,24,false,company,'');category_sum:=0;
  for cat in select jsonb_array_elements_text(all_rows->'categories') loop
   filtered:=public.webbase_network_search('','all',0,24,false,company,cat);
   if exists(select 1 from jsonb_array_elements(filtered->'items')p where p->>'category'<>cat) then raise exception 'Category leaked: % %',company,cat;end if;
   if jsonb_array_length(filtered->'items')>24 or filtered->'categories'<>all_rows->'categories' then raise exception 'Pagination/category choices unstable';end if;
   category_sum:=category_sum+(filtered->>'count')::int;
   if (filtered->>'count')::int>24 then
    empty_rows:=public.webbase_network_search('','all',24,24,false,company,cat);
    if exists(select 1 from jsonb_array_elements(filtered->'items')a join jsonb_array_elements(empty_rows->'items')b on a->>'key'=b->>'key') then raise exception 'Page duplicated';end if;
   end if;
  end loop;
  if category_sum<>(all_rows->>'count')::int then raise exception 'Categories omit or duplicate products';end if;
  empty_rows:=public.webbase_network_search('___NO_SUCH_PRODUCT_QA_742___','all',0,24,false,company,'');
  if empty_rows->>'count'<>'0' or empty_rows->'categories'<>all_rows->'categories' then raise exception 'Search erased categories';end if;
  empty_rows:=public.webbase_network_search('','all',0,24,false,company,'___NO_SUCH_CATEGORY___');
  if empty_rows->>'count'<>'0' then raise exception 'Unknown category returned products';end if;
 end loop;
 insert into network_category_results values('three_companies_categories_pagination_search','PASS');
end;$$;
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000099',true);
set local role authenticated;
do $$declare r jsonb;begin
 r:=public.webbase_network_search('','all',0,24,true,'smart_orange','');
 if r->>'count'<>'0' or jsonb_array_length(r->'categories')<>0 then raise exception 'Unapproved user read category inventory';end if;
end;$$;
reset role;
set local role anon;
do $$begin
 begin perform public.webbase_network_search('','all',0,24,false,'smart_orange','Смартфоны');raise exception 'Anonymous category search';exception when insufficient_privilege then null;end;
end;$$;
reset role;
select * from network_category_results;
rollback;
