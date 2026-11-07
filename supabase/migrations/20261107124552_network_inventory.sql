-- Additive network snapshots; never writes to webbase_stock or existing product fields.
create extension if not exists pg_trgm with schema extensions;
create extension if not exists pg_cron;
create extension if not exists pg_net;
alter table public.webbase_products add column network_origin boolean not null default false, add column is_demo boolean not null default false;
create function public.webbase_network_key(value text) returns text language plpgsql immutable set search_path='' as $$
declare s text; m text[]; pair jsonb;
begin
 s:=lower(normalize(coalesce(value,''),NFKC)); s:=translate(s,'ё‐‑–—','е----');
 s:=replace(replace(replace(replace(s,'гб','gb'),'тб','tb'),'GB','gb'),'TB','tb');
 for m in select regexp_matches(s,'([0-9]+)\s*(?:gb)?\s*[+/]\s*([0-9]+)(?:\s*(gb|tb))?','g') loop
 s:=regexp_replace(s,'([0-9]+)\s*(?:gb)?\s*[+/]\s*([0-9]+)(?:\s*(gb|tb))?',m[1]||'/'||(m[2]::int*case when m[3]='tb' then 1024 else 1 end)||'gb');end loop;
 s:=regexp_replace(s,'xiaomi\s+(redmi|poco)\M','\1','g');
 for pair in select e.value from jsonb_array_elements('[["черный", "black"], ["чёрный", "black"], ["черная", "black"], ["чёрная", "black"], ["черное", "black"], ["белый", "white"], ["белая", "white"], ["белое", "white"], ["синий", "blue"], ["синяя", "blue"], ["голубой", "sky blue"], ["голубая", "sky blue"], ["зелёный", "green"], ["зеленый", "green"], ["зеленая", "green"], ["зелёная", "green"], ["красный", "red"], ["красная", "red"], ["розовый", "pink"], ["розовая", "pink"], ["фиолетовый", "purple"], ["фиолетовая", "purple"], ["серый", "gray"], ["серая", "gray"], ["серебристый", "silver"], ["оранжевый", "orange"], ["бежевый", "beige"], ["желтый", "yellow"], ["жёлтый", "yellow"]]'::jsonb) as e loop
 s:=regexp_replace(s,'(^|[[:space:](),])'||replace(pair->>0,'ё','е')||'($|[[:space:](),])','\1'||(pair->>1)||'\2','g');end loop;
 return trim(regexp_replace(translate(s,'()','  '),'\s+',' ','g'));
end;$$;
revoke all on function public.webbase_network_key(text) from public,anon;
grant execute on function public.webbase_network_key(text) to authenticated,service_role;
create index webbase_network_product_name_idx on public.webbase_products(public.webbase_network_key(name));
create index webbase_network_product_source_idx on public.webbase_products(public.webbase_network_key(source_name));
create index webbase_network_search_idx on public.webbase_products using gin ((lower(name||' '||coalesce(sku,'')||' '||coalesce(brand,'')||' '||coalesce(model,'')||' '||coalesce(memory,'')||' '||coalesce(color,''))) extensions.gin_trgm_ops);
create table public.webbase_network_stores(id text primary key,name text not null,region text not null check(region in ('moscow','mo','spb','other')),address text not null default '',source_url text,verified boolean not null default false,is_local boolean not null default false);
create table public.webbase_network_warehouses(key text primary key,raw_name text not null,store_id text references public.webbase_network_stores(id),kind text not null default 'warehouse' check(kind in ('warehouse','display','defect','service')),legal_entity text,reviewed boolean not null default false,excluded boolean not null default false,updated_at timestamptz not null default now());
create table public.webbase_network_imports(id uuid primary key default gen_random_uuid(),file_hash text not null unique check(length(file_hash)=64),filename text not null,report_date date not null,status text not null default 'staging' check(status in ('staging','active','archived','failed')),columns jsonb not null,expected_items int not null,expected_total int not null,skipped jsonb not null default '[]',negative_count int not null default 0,actor_id uuid references auth.users(id),created_at timestamptz not null default now(),completed_at timestamptz,summary jsonb not null default '{}');
create unique index webbase_network_one_snapshot_idx on public.webbase_network_imports((status)) where status='active';
create table public.webbase_network_stage(import_id uuid references public.webbase_network_imports(id) on delete cascade,key text not null,payload jsonb not null,primary key(import_id,key));
create table public.webbase_network_items(key text primary key,raw_name text not null,product_id uuid references public.webbase_products(id) on delete set null,is_demo boolean not null default false,review_reason text,source_row int);
create index webbase_network_items_product_idx on public.webbase_network_items(product_id);
create table public.webbase_network_stock(import_id uuid references public.webbase_network_imports(id),item_key text references public.webbase_network_items(key),warehouse_key text references public.webbase_network_warehouses(key),quantity int not null,primary key(import_id,item_key,warehouse_key));
create index webbase_network_stock_item_idx on public.webbase_network_stock(item_key,import_id);
create index webbase_network_stock_warehouse_idx on public.webbase_network_stock(warehouse_key,import_id);
create table public.webbase_network_jobs(product_id uuid primary key references public.webbase_products(id),import_id uuid references public.webbase_network_imports(id),status text not null default 'pending' check(status in ('pending','working','done','review','error')),attempts int not null default 0,lease_until timestamptz,photo_found boolean not null default false,description_found boolean not null default false,reason text,updated_at timestamptz not null default now());
create index webbase_network_jobs_pending_idx on public.webbase_network_jobs(status,lease_until,updated_at);
create table public.webbase_network_sources(id bigint generated always as identity primary key,product_id uuid references public.webbase_products(id),kind text not null,url text not null,retrieved_at timestamptz not null default now(),details jsonb not null default '{}');
alter table public.webbase_network_stores enable row level security;
revoke all on public.webbase_network_stores from anon;
grant select,insert,update,delete on public.webbase_network_stores to authenticated;
grant all on public.webbase_network_stores to service_role;
create policy staff_read on public.webbase_network_stores for select to authenticated using ((select private.webbase_is_staff()));
create policy admin_write on public.webbase_network_stores for all to authenticated using ((select private.webbase_is_admin())) with check ((select private.webbase_is_admin()));
alter table public.webbase_network_warehouses enable row level security;
revoke all on public.webbase_network_warehouses from anon;
grant select,insert,update,delete on public.webbase_network_warehouses to authenticated;
grant all on public.webbase_network_warehouses to service_role;
create policy staff_read on public.webbase_network_warehouses for select to authenticated using ((select private.webbase_is_staff()));
create policy admin_write on public.webbase_network_warehouses for all to authenticated using ((select private.webbase_is_admin())) with check ((select private.webbase_is_admin()));
alter table public.webbase_network_imports enable row level security;
revoke all on public.webbase_network_imports from anon;
grant select,insert,update,delete on public.webbase_network_imports to authenticated;
grant all on public.webbase_network_imports to service_role;
create policy staff_read on public.webbase_network_imports for select to authenticated using ((select private.webbase_is_staff()));
create policy admin_write on public.webbase_network_imports for all to authenticated using ((select private.webbase_is_admin())) with check ((select private.webbase_is_admin()));
alter table public.webbase_network_stage enable row level security;
revoke all on public.webbase_network_stage from anon;
grant select,insert,update,delete on public.webbase_network_stage to authenticated;
grant all on public.webbase_network_stage to service_role;
create policy staff_read on public.webbase_network_stage for select to authenticated using ((select private.webbase_is_staff()));
create policy admin_write on public.webbase_network_stage for all to authenticated using ((select private.webbase_is_admin())) with check ((select private.webbase_is_admin()));
alter table public.webbase_network_items enable row level security;
revoke all on public.webbase_network_items from anon;
grant select,insert,update,delete on public.webbase_network_items to authenticated;
grant all on public.webbase_network_items to service_role;
create policy staff_read on public.webbase_network_items for select to authenticated using ((select private.webbase_is_staff()));
create policy admin_write on public.webbase_network_items for all to authenticated using ((select private.webbase_is_admin())) with check ((select private.webbase_is_admin()));
alter table public.webbase_network_stock enable row level security;
revoke all on public.webbase_network_stock from anon;
grant select,insert,update,delete on public.webbase_network_stock to authenticated;
grant all on public.webbase_network_stock to service_role;
create policy staff_read on public.webbase_network_stock for select to authenticated using ((select private.webbase_is_staff()));
create policy admin_write on public.webbase_network_stock for all to authenticated using ((select private.webbase_is_admin())) with check ((select private.webbase_is_admin()));
alter table public.webbase_network_jobs enable row level security;
revoke all on public.webbase_network_jobs from anon;
grant select,insert,update,delete on public.webbase_network_jobs to authenticated;
grant all on public.webbase_network_jobs to service_role;
create policy staff_read on public.webbase_network_jobs for select to authenticated using ((select private.webbase_is_staff()));
create policy admin_write on public.webbase_network_jobs for all to authenticated using ((select private.webbase_is_admin())) with check ((select private.webbase_is_admin()));
alter table public.webbase_network_sources enable row level security;
revoke all on public.webbase_network_sources from anon;
grant select,insert,update,delete on public.webbase_network_sources to authenticated;
grant all on public.webbase_network_sources to service_role;
create policy staff_read on public.webbase_network_sources for select to authenticated using ((select private.webbase_is_staff()));
create policy admin_write on public.webbase_network_sources for all to authenticated using ((select private.webbase_is_admin())) with check ((select private.webbase_is_admin()));
revoke select on public.webbase_network_stage from authenticated;
create policy stage_admin_read on public.webbase_network_stage for select to authenticated using ((select private.webbase_is_admin()));
grant select on public.webbase_network_stage to authenticated;
grant usage,select on sequence public.webbase_network_sources_id_seq to authenticated,service_role;
drop policy staff_read on public.webbase_network_stage;
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-123','ул. Тверская, д.17','moscow','г. Москва, ул. Тверская, д. 17','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-3','ТРЦ «Калейдоскоп»','moscow','г. Москва, ул. Сходненская, д. 56, этаж 1-й,  пом. А-05а','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-69','ТРЦ «Красный Кит»','mo','МО, Мытищи, пр-т Шараповский, вл. 2 стр. 3, этаж 1-й','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-8','ТРЦ «Город Лефортово»','moscow','г. Москва, ш. Энтузиастов, д. 12, корп. 2, этаж 1-й','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-95','ТЦ Европолис','moscow','г. Москва, пр-т Мира, д. 211, корп. 2, этаж 1-й','https://mi-shop.com/shops/',true,true);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-97','ТЦ «Европейский»','moscow','г. Москва, пл. Киевского вокзала, д. 2, вход №3, 1-й этаж','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-117','ТРЦ "Кузьминки Молл"','moscow','г. Москва, ул. Зеленодольская, д.42','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-118','ТРЦ «Авиапарк»','moscow','ул. Ходынский бульвар, д. 4, этаж 4','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-119','ТРЦ «Каширская Плаза»','moscow','г Москва, Каширское шоссе, д 61Г, нижний 1-й этаж','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-120','ТРЦ «Колумбус»','moscow','г. Москва, ул. Кировоградская, д. 13а, этаж 1-й','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-121','ТРЦ «Саларис»','moscow','МО, Киевское шоссе, 23-й километр, д. 1, этаж 1-й','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-22','Владимирский пр-т, д. 7','spb','г. Санкт - Петербург, Владимирский проспект, д. 7','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-23','ТРК «Питер Радуга»','spb','г. Санкт - Петербург, проспект Космонавтов, д. 14','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-26','ТРЦ «Охта Молл»','spb','г. Санкт - Петербург, Брантовская дорога, д. 3','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-101','ТРЦ «Академический»','spb','г. Санкт - Петербург, Гражданский проспект, д. 41 корп. А','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-122','ТРЦ «Жемчужная Плаза»','spb','г. Санкт-Петербург, Петергофское шоссе, д. 51','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-113','ул. Куйбышева, д. 57','other','г. Екатеринбург, ул. Куйбышева, д. 57','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-108','ул. Пушкина, д.17','other','г. Казань, ул. Пушкина, д.17','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-114','Ленинский пр-т, д. 69','other','г. Калининград, Ленинский пр-т, д.69-73','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-32','Буденновский пр-т., д. 51','other','г. Ростов-на-Дону, Буденновский пр-т, д. 51','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_stores(id,name,region,address,source_url,verified,is_local) values('mi-28','Первомайский пр-т, д. 78','other','г. Рязань, Первомайский пр-т, д. 78','https://mi-shop.com/shops/',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('интернет магазин предоплата','Интернет магазин ПРЕДОПЛАТА',null,'service',null,true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('интернет-магазин','ИНТЕРНЕТ-МАГАЗИН',null,'service',null,true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('интернет-магазин mobilidi','ИНТЕРНЕТ-МАГАЗИН (MOBILIDI)',null,'service','(MOBILIDI)',true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('интернет-магазин mobilidi брак','ИНТЕРНЕТ-МАГАЗИН (MOBILIDI) (БРАК)',null,'service','(MOBILIDI)',true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('интернет-магазин mobilidi возврат','ИНТЕРНЕТ-МАГАЗИН (MOBILIDI) Возврат',null,'service','(MOBILIDI)',true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('интернет-магазин smart orange','ИНТЕРНЕТ-МАГАЗИН (SMART ORANGE)',null,'service','(SMART ORANGE)',true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('интернет-магазин smart orange брак','ИНТЕРНЕТ-МАГАЗИН (SMART ORANGE) (БРАК)',null,'service','(SMART ORANGE)',true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('интернет-магазин smart orange возврат','ИНТЕРНЕТ-МАГАЗИН (SMART ORANGE) Возврат',null,'service','(SMART ORANGE)',true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('некондиция','Некондиция',null,'service',null,true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('розница mobilidi','Розница (MOBILIDI)',null,'service','(MOBILIDI)',true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('сервис центр','Сервис центр',null,'service',null,true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад w-plaza','Склад W-plaza',null,'service',null,true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад w-plaza микстех брак','Склад W-plaza Микстех Брак',null,'service','Микстех',true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад w-plaza микстех ов','Склад W-plaza Микстех ОВ',null,'service','Микстех',true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад гигфест','Склад Гигфест',null,'service',null,true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад интернет магазин','Склад Интернет магазин',null,'service',null,true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад йога','Склад Йога',null,'service',null,true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад казань','Склад Казань',null,'warehouse',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад казань ов','Склад Казань ОВ',null,'display',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад казань пушкина','Склад Казань Пушкина','mi-108','warehouse',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад казань пушкина брак','Склад Казань Пушкина Брак','mi-108','defect',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад казань пушкина ов','Склад Казань Пушкина ОВ','mi-108','display',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад калейдоскоп','Склад Калейдоскоп','mi-3','warehouse',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад калейдоскоп брак','Склад Калейдоскоп Брак','mi-3','defect',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад калейдоскоп ов','Склад Калейдоскоп ОВ','mi-3','display',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад калининград 39/2gb','Склад Калининград 39/002','mi-114','warehouse',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад калининград брак 39/2gb','Склад Калининград Брак 39/002','mi-114','defect',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад калининград ов 39/2gb','Склад Калининград ОВ 39/002','mi-114','display',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад магазин no 66/3gbекатеринбург','Склад Магазин № 66/003 Екатеринбург',null,'warehouse',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад магазин no 66/3gbекатеринбург ов','Склад Магазин № 66/003 Екатеринбург ОВ',null,'display',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад мега екб','Склад Мега Екб',null,'warehouse',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад москва тверская','Склад Москва Тверская','mi-123','warehouse',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад москва тверская брак','Склад Москва Тверская Брак','mi-123','defect',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад ростов-на-дону','Склад Ростов-на-Дону','mi-32','warehouse',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад ростов-на-дону ов','Склад Ростов-на-Дону ОВ','mi-32','display',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад рязань','Склад Рязань','mi-28','warehouse',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад рязань ов','Склад Рязань ОВ','mi-28','display',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад санкт-петербург','Склад Санкт-Петербург',null,'warehouse',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад санкт-петербург ов','Склад Санкт-Петербург ОВ',null,'display',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад спб радуга','Склад СПБ Радуга','mi-23','warehouse',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад спб радуга брак','Склад СПБ Радуга Брак','mi-23','defect',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад спб радуга ов','Склад СПБ Радуга ОВ','mi-23','display',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад транзит','Склад транзит',null,'service',null,true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад трц гранд каньон','Склад ТРЦ Гранд Каньон',null,'warehouse',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц авиапарк mobilidi','Склад ТЦ Авиапарк (MOBILIDI)','mi-118','warehouse','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц авиапарк mobilidi брак','Склад ТЦ Авиапарк (MOBILIDI) Брак','mi-118','defect','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц авиапарк mobilidi ов','Склад ТЦ Авиапарк (MOBILIDI) ОВ','mi-118','display','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц академический спб','Склад ТЦ Академический СПБ','mi-101','warehouse',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц академический спб брак','Склад ТЦ Академический СПБ Брак','mi-101','defect',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц академический спб ов','Склад ТЦ Академический СПБ ОВ','mi-101','display',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц город лефортово','Склад ТЦ Город Лефортово','mi-8','warehouse',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц город лефортово брак','Склад ТЦ Город Лефортово Брак','mi-8','defect',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц город лефортово ов','Склад ТЦ Город Лефортово ОВ','mi-8','display',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц европейский','Склад ТЦ Европейский','mi-97','warehouse',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц европейский брак','Склад ТЦ Европейский Брак','mi-97','defect',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц европейский ов','Склад ТЦ Европейский ОВ','mi-97','display',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц европолис','Склад ТЦ Европолис','mi-95','warehouse',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц европолис брак','Склад ТЦ Европолис Брак','mi-95','defect',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц европолис ов','Склад ТЦ Европолис ОВ','mi-95','display',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц европолис спб','Склад ТЦ Европолис СПБ',null,'warehouse',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц жемчужная плаза mobilibdi ов','Склад ТЦ Жемчужная Плаза (MOBILIBDI) ОВ','mi-122','display','(MOBILIBDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц жемчужная плаза mobilidi','Склад ТЦ Жемчужная Плаза (MOBILIDI)','mi-122','warehouse','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц жемчужная плаза mobilidi брак','Склад ТЦ Жемчужная Плаза (MOBILIDI) Брак','mi-122','defect','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц зеленопарк','Склад ТЦ Зеленопарк',null,'warehouse',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц зеленопарк hitbuy','Склад ТЦ Зеленопарк HitBuy',null,'warehouse','HitBuy',false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц зеленопарк брак','Склад ТЦ Зеленопарк Брак',null,'defect',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц зеленопарк ов','Склад ТЦ Зеленопарк ОВ',null,'display',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц капитолий сергиев посад','Склад ТЦ Капитолий Сергиев Посад',null,'warehouse',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц каширская плаза','Склад ТЦ Каширская Плаза','mi-119','warehouse',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц каширская плаза mobilidi','Склад ТЦ Каширская Плаза (MOBILIDI)','mi-119','warehouse','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц каширская плаза mobilidi брак','Склад ТЦ Каширская Плаза (MOBILIDI) Брак','mi-119','defect','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц каширская плаза mobilidi ов','Склад ТЦ Каширская Плаза (MOBILIDI) ОВ','mi-119','display','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц колумбус mobilidi','Склад ТЦ Колумбус (MOBILIDI)','mi-120','warehouse','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц колумбус mobilidi брак','Склад ТЦ Колумбус (MOBILIDI) Брак','mi-120','defect','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц колумбус mobilidi ов','Склад ТЦ Колумбус (MOBILIDI) ОВ','mi-120','display','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц red кит','Склад ТЦ Красный Кит','mi-69','warehouse',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц red кит брак','Склад ТЦ Красный Кит Брак','mi-69','defect',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц red кит ов','Склад ТЦ Красный Кит ОВ','mi-69','display',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц кузьминки молл','Склад ТЦ Кузьминки Молл','mi-117','warehouse',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц кузьминки молл mobilidi','Склад ТЦ Кузьминки Молл (MOBILIDI)','mi-117','warehouse','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц кузьминки молл брак mobilidi','Склад ТЦ Кузьминки Молл Брак (MOBILIDI)','mi-117','defect','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц кузьминки молл ов mobilidi','Склад ТЦ Кузьминки Молл ОВ (MOBILIDI)','mi-117','display','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц метрополис hitbuy','Склад ТЦ Метрополис HitBuy',null,'warehouse','HitBuy',false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц охта молл спб','Склад ТЦ Охта Молл СПБ','mi-26','warehouse',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц охта молл спб брак','Склад ТЦ Охта Молл СПБ Брак','mi-26','defect',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц охта молл спб ов','Склад ТЦ Охта Молл СПБ ОВ','mi-26','display',null,true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц саларис mobilidi','Склад ТЦ Саларис (MOBILIDI)','mi-121','warehouse','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц саларис mobilidi брак','Склад ТЦ Саларис (MOBILIDI) Брак','mi-121','defect','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц саларис mobilidi ов','Склад ТЦ Саларис (MOBILIDI) ОВ','mi-121','display','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц сити молл спб','Склад ТЦ Сити Молл СПБ',null,'warehouse',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц сити молл спб брак','Склад ТЦ Сити Молл СПБ Брак',null,'defect',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц тверская mobilidi','Склад ТЦ Тверская (MOBILIDI)','mi-123','warehouse','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц тверская mobilidi брак','Склад ТЦ Тверская (MOBILIDI) Брак','mi-123','defect','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц тверская mobilidi ов','Склад ТЦ Тверская (MOBILIDI) ОВ','mi-123','display','(MOBILIDI)',true,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц французский б-р','Склад ТЦ Французский б-р',null,'warehouse',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц французский б-р брак','Склад ТЦ Французский б-р Брак',null,'defect',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('склад тц французский б-р ов','Склад ТЦ Французский б-р ОВ',null,'display',null,false,false);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('центральный офис варшавское ш.1, стр.1-2','Центральный офис (Варшавское ш.1, стр.1-2)',null,'service',null,true,true);
insert into public.webbase_network_warehouses(key,raw_name,store_id,kind,legal_entity,reviewed,excluded) values('центральный офис варшавское ш.1, стр.1-2 ов','Центральный офис (Варшавское ш.1, стр.1-2) ОВ',null,'service',null,true,true);

create function public.webbase_network_begin(p_meta jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.webbase_network_imports;
begin
 if not private.webbase_is_admin() then raise exception 'Administrator required' using errcode='42501';end if;
 if jsonb_array_length(p_meta->'columns') not between 1 and 250 or (p_meta->>'item_count')::int not between 1 and 50000 or p_meta->>'file_hash' !~ '^[a-f0-9]{64}$' then raise exception 'Invalid import manifest';end if;
 insert into public.webbase_network_imports(file_hash,filename,report_date,columns,expected_items,expected_total,skipped,negative_count,actor_id)
 values(p_meta->>'file_hash',left(p_meta->>'filename',240),(p_meta->>'report_date')::date,p_meta->'columns',(p_meta->>'item_count')::int,(p_meta->>'total')::int,coalesce(p_meta->'skipped','[]'),coalesce((p_meta->>'negative')::int,0),auth.uid())
 on conflict(file_hash) do nothing;
 select * into r from public.webbase_network_imports where file_hash=p_meta->>'file_hash';return to_jsonb(r);
end;$$;
create function public.webbase_network_stage(p_import uuid,p_items jsonb) returns int language plpgsql security invoker set search_path='' as $$
declare item jsonb;col_count int;n int:=0;val jsonb;row_sum int;
begin
 if not private.webbase_is_admin() then raise exception 'Administrator required' using errcode='42501';end if;
 select jsonb_array_length(columns) into col_count from public.webbase_network_imports where id=p_import and status='staging' for update;
 if col_count is null then raise exception 'Import is not staging';end if;
 if jsonb_array_length(p_items)>100 then raise exception 'Batch exceeds 100 rows';end if;
 for item in select value from jsonb_array_elements(p_items) loop
 if public.webbase_network_key(item->>'raw_name')<>item->>'key' or length(item->>'raw_name') not between 2 and 1000 or jsonb_array_length(item->'values')<>col_count then raise exception 'Invalid staged identity or columns';end if;
 row_sum:=0;for val in select value from jsonb_array_elements(item->'values') loop
 if jsonb_typeof(val)<>'number' or (val::text)::numeric<>trunc((val::text)::numeric) or abs((val::text)::numeric)>10000000 then raise exception 'Invalid stock value';end if;row_sum:=row_sum+(val::text)::int;end loop;
 if row_sum<>(item->>'total')::int then raise exception 'Row total mismatch';end if;
 insert into public.webbase_network_stage(import_id,key,payload) values(p_import,item->>'key',item) on conflict(import_id,key) do update set payload=excluded.payload;n:=n+1;
 end loop;return n;
end;$$;
create function public.webbase_network_commit(p_import uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare imp public.webbase_network_imports;row record;col record;p_id uuid;matches uuid[];created int:=0;linked int:=0;ambiguous int:=0;demo boolean;sum_total int;counts jsonb;reason text;
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
 for row in select key,payload as j from public.webbase_network_stage where import_id=p_import order by key loop
 demo:=row.j->>'raw_name' ~* '(^|[ (])ldu([ )]|$)';
 select product_id into p_id from public.webbase_network_items where key=row.key;
 reason:=null;
 if p_id is null then
 select array_agg(distinct id) into matches from public.webbase_products p where
 (public.webbase_network_key(p.name)=row.key or public.webbase_network_key(p.source_name)=row.key) and p.is_demo=demo;
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

create function public.webbase_network_availability(p_product uuid default null,p_key text default null,p_region text default 'moscow',p_zeros boolean default false,p_sort text default 'warehouse') returns jsonb language sql stable security invoker set search_path='' as $$
with active as(select id,report_date,completed_at from public.webbase_network_imports where status='active'),
item as(select * from public.webbase_network_items where (p_product is not null and product_id=p_product) or (p_key is not null and key=p_key)),
amounts as(select w.store_id,sum(case when w.kind='warehouse' and not i.is_demo then q.quantity else 0 end)::int warehouse,sum(case when w.kind='display' and not i.is_demo then q.quantity else 0 end)::int display,sum(case when w.kind='defect' and not i.is_demo then q.quantity else 0 end)::int defect,
 sum(case when i.is_demo then q.quantity else 0 end)::int ldu,
 jsonb_agg(jsonb_build_object('warehouse',w.raw_name,'kind',w.kind,'entity',w.legal_entity,'quantity',q.quantity) order by w.raw_name) accounts
 from public.webbase_network_stock q join active a on q.import_id=a.id join item i on q.item_key=i.key join public.webbase_network_warehouses w on w.key=q.warehouse_key
 where w.reviewed and not w.excluded group by w.store_id),
rows as(select s.*,coalesce(a.warehouse,0) warehouse,coalesce(a.display,0) display,coalesce(a.defect,0) defect,coalesce(a.ldu,0) ldu,coalesce(a.accounts,'[]') accounts,
 greatest(coalesce(a.warehouse,0),0)+greatest(coalesce(a.display,0),0) available from public.webbase_network_stores s left join amounts a on a.store_id=s.id
 where s.verified and (p_region='all' or s.region=p_region) and exists(select 1 from item)),
ordered as(select * from rows where p_zeros or available>0 or ldu>0 order by case when p_sort='name' then name end,
 case when p_sort='warehouse' then warehouse>0 when p_sort='present' then available>0 else true end desc,
 case when p_sort='quantity' then available else greatest(warehouse,0) end desc,name)
select jsonb_build_object('report_date',(select report_date from active),'updated_at',(select completed_at from active),'is_demo',coalesce((select bool_or(is_demo) from item),false),'matched',exists(select 1 from item),
'stores',coalesce((select jsonb_agg(to_jsonb(ordered)||jsonb_build_object('total',warehouse+display)) from ordered),'[]'));
$$;

create function public.webbase_network_search(p_query text default '',p_region text default 'moscow',p_offset int default 0,p_limit int default 24,p_demo boolean default false) returns jsonb language sql stable security invoker set search_path='' as $$
with active as(select id,report_date from public.webbase_network_imports where status='active'),
agg as(select q.item_key,sum(greatest(q.quantity,0)) filter(where w.kind in('warehouse','display') and w.reviewed and not w.excluded and (p_region='all' or s.region=p_region)) as available
 from public.webbase_network_stock q join active a on a.id=q.import_id join public.webbase_network_warehouses w on w.key=q.warehouse_key left join public.webbase_network_stores s on s.id=w.store_id group by q.item_key),
found as(select i.key,i.raw_name as name,i.product_id,i.is_demo,p.color,p.memory,p.category,p.network_origin,coalesce(a.available,0) available,
 (select storage_path from public.webbase_product_images where product_id=p.id order by is_primary desc,sort_order limit 1) image_path
 from agg a join public.webbase_network_items i on i.key=a.item_key left join public.webbase_products p on p.id=i.product_id
 where (p_demo or not i.is_demo) and (p_query='' or public.webbase_network_key(concat_ws(' ',i.raw_name,p.name,p.brand,p.model,p.color,p.memory,p.sku,array_to_string(p.source_skus,' '))) like '%'||public.webbase_network_key(left(p_query,150))||'%')),
page as(select * from found order by is_demo,available desc,name,key offset greatest(p_offset,0) limit least(greatest(p_limit,1),48))
select jsonb_build_object('report_date',(select report_date from active),'count',(select count(*) from found),'items',coalesce((select jsonb_agg(to_jsonb(page)) from page),'[]'));
$$;

create index webbase_network_items_search_idx on public.webbase_network_items using gin(key extensions.gin_trgm_ops);
create function public.webbase_network_link(p_key text,p_product uuid) returns void language plpgsql security invoker set search_path='' as $$
begin
 if not private.webbase_is_admin() then raise exception 'Administrator required' using errcode='42501';end if;
 if not exists(select 1 from public.webbase_products p join public.webbase_network_items i on i.key=p_key where p.id=p_product and (public.webbase_network_key(p.name)=p_key or public.webbase_network_key(p.source_name)=p_key) and p.is_demo=i.is_demo) then raise exception 'Product variant does not match';end if;
 update public.webbase_network_items set product_id=p_product,review_reason=null where key=p_key;
end;$$;
create function public.webbase_network_retry(p_product uuid default null) returns int language plpgsql security invoker set search_path='' as $$
declare n int;
begin
 if not private.webbase_is_admin() then raise exception 'Administrator required' using errcode='42501';end if;
 update public.webbase_network_jobs set status='pending',attempts=0,lease_until=null,reason=null,updated_at=now() where (p_product is null or product_id=p_product) and status in ('review','error');get diagnostics n=row_count;return n;
end;$$;
-- Single-row lease allows continuation after a closed browser or a crashed invocation.
create function public.webbase_network_claim() returns jsonb language plpgsql security invoker set search_path='' as $$
declare j public.webbase_network_jobs;
begin
 update public.webbase_network_jobs set status='error',reason='Превышено число попыток; повторите обработку',updated_at=now() where attempts>=4 and status='working' and lease_until<now();
 select * into j from public.webbase_network_jobs where ((status='pending' and (lease_until is null or lease_until<now())) or (status='working' and lease_until<now())) and attempts<4 order by updated_at for update skip locked limit 1;
 if j.product_id is null then return null;end if;
 update public.webbase_network_jobs set status='working',attempts=attempts+1,lease_until=now()+interval '3 minutes',updated_at=now() where product_id=j.product_id;
 return to_jsonb(j);
end;$$;
revoke all on function public.webbase_network_claim() from public,anon,authenticated;
grant execute on function public.webbase_network_claim() to service_role;
-- Append columns to the existing invoker view without changing its relationships or local stock ordering.
create or replace view public.webbase_catalog with(security_invoker=true) as
select p.id,p.external_id,p.sku,p.name,p.category,p.model,p.memory,p.color,p.image_path,p.active,p.created_at,p.updated_at,p.brand,p.description,p.specs,p.source_name,p.source_skus,p.last_imported_at,p.updated_by,coalesce(s.warehouse,0)>0 as catalog_in_stock,p.network_origin,p.is_demo
from public.webbase_products p left join public.webbase_stock s on s.product_id=p.id;
revoke all on function public.webbase_network_begin(jsonb) from public,anon;
grant execute on function public.webbase_network_begin(jsonb) to authenticated,service_role;
revoke all on function public.webbase_network_stage(uuid,jsonb) from public,anon;
grant execute on function public.webbase_network_stage(uuid,jsonb) to authenticated,service_role;
revoke all on function public.webbase_network_commit(uuid) from public,anon;
grant execute on function public.webbase_network_commit(uuid) to authenticated,service_role;
revoke all on function public.webbase_network_availability(uuid,text,text,boolean,text) from public,anon;
grant execute on function public.webbase_network_availability(uuid,text,text,boolean,text) to authenticated,service_role;
revoke all on function public.webbase_network_search(text,text,integer,integer,boolean) from public,anon;
grant execute on function public.webbase_network_search(text,text,integer,integer,boolean) to authenticated,service_role;
revoke all on function public.webbase_network_link(text,uuid) from public,anon;
grant execute on function public.webbase_network_link(text,uuid) to authenticated,service_role;
revoke all on function public.webbase_network_retry(uuid) from public,anon;
grant execute on function public.webbase_network_retry(uuid) to authenticated,service_role;
create function public.webbase_network_photo_key(value text) returns text language sql immutable set search_path='' as $$select trim(regexp_replace(regexp_replace(public.webbase_network_key(value),'(^| )ldu( |$)',' ','g'),'\m[0-9]+/[0-9]+gb\M',' ','g'));$$;
create function public.webbase_network_context(p_product uuid) returns jsonb language sql stable security invoker set search_path='' as $$
select jsonb_build_object('product',to_jsonb(p),'donor',(select to_jsonb(d) from public.webbase_products d where d.id<>p.id and not d.is_demo and
 (public.webbase_network_photo_key(d.name)=public.webbase_network_photo_key(p.name) or (p.memory<>'' and regexp_replace(public.webbase_network_key(d.name),'\s+[0-9]+/[0-9]+gb.*$','')=regexp_replace(public.webbase_network_key(p.name),'\s+[0-9]+/[0-9]+gb.*$','')))
 order by (public.webbase_network_photo_key(d.name)=public.webbase_network_photo_key(p.name)) desc,(d.specs?'_source_url') desc limit 1),
 'images',coalesce((select jsonb_agg(to_jsonb(i)) from public.webbase_product_images i where i.product_id=(select d.id from public.webbase_products d where d.id<>p.id and not d.is_demo and public.webbase_network_photo_key(d.name)=public.webbase_network_photo_key(p.name) and exists(select 1 from public.webbase_product_images where product_id=d.id) order by d.created_at limit 1)),'[]'))
from public.webbase_products p where p.id=p_product;
$$;
revoke all on function public.webbase_network_context(uuid),public.webbase_network_photo_key(text) from public,anon,authenticated;
grant execute on function public.webbase_network_context(uuid),public.webbase_network_photo_key(text) to service_role;
create function public.webbase_network_finish(p_product uuid,p_result jsonb) returns void language plpgsql security invoker set search_path='' as $$
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
 if pic->>'new_upload'='true' and not exists(select 1 from public.webbase_product_images where product_id=p_product) then
 insert into public.webbase_product_images(product_id,storage_path,is_primary,mime_type,byte_size,width,height,original_name,source_url)
 values(p_product,pic->>'storage_path',true,pic->>'mime_type',(pic->>'byte_size')::int,(pic->>'width')::int,(pic->>'height')::int,'network-enrichment',pic->>'source_url') on conflict(storage_path) do nothing;
 end if;
 select coalesce(image_path,'')<>'' or exists(select 1 from public.webbase_product_images where product_id=p_product),coalesce(description,'')<>'' into p_photo,p_description from public.webbase_products where id=p_product;
 insert into public.webbase_network_sources(product_id,kind,url,details) select p_product,e->>'kind',e->>'url',coalesce(e->'details','{}') from jsonb_array_elements(coalesce(p_result->'sources','[]')) e;
 update public.webbase_network_jobs set status=case when p_photo and p_description then 'done' else 'review' end,photo_found=p_photo,description_found=p_description,reason=p_result->>'reason',lease_until=null,updated_at=now() where product_id=p_product;
end;$$;
revoke all on function public.webbase_network_finish(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.webbase_network_finish(uuid,jsonb) to service_role;
-- The scheduler token stays encrypted in Vault, never in GitHub or the browser.
do $$begin
 if not exists(select 1 from vault.secrets where name='webbase_network_worker') then perform vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'webbase_network_worker');end if;
end;$$;
grant usage on schema vault to service_role;
grant select on vault.decrypted_secrets to service_role;
create function public.webbase_network_worker_auth(p_token text) returns boolean language sql stable security invoker set search_path='' as $$select exists(select 1 from vault.decrypted_secrets where name='webbase_network_worker' and decrypted_secret=p_token);$$;
revoke all on function public.webbase_network_worker_auth(text) from public,anon,authenticated;
grant execute on function public.webbase_network_worker_auth(text) to service_role;
select cron.schedule('webbase-network-enrichment','* * * * *',
$job$select net.http_post(url:='https://dazniyfntumbljkocjoo.supabase.co/functions/v1/webbase-network-enrich',headers:=jsonb_build_object('Content-Type','application/json','x-webbase-worker',(select decrypted_secret from vault.decrypted_secrets where name='webbase_network_worker')),body:='{}'::jsonb,timeout_milliseconds:=1000) where exists(select 1 from public.webbase_network_jobs where status='pending' or(status='working' and lease_until<now()));$job$);
