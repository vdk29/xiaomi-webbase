-- The owner confirmed these retail points and their legal entities on 2026-11-07.
-- Their addresses are not known. Distinct accounting point names must not be merged
-- just because they share a city; preserve both Ekaterinburg points independently.
insert into public.webbase_network_stores(id,name,region,address,verified) values
 ('report-spb','Магазин Санкт-Петербург','spb','Адрес уточняется',true),
 ('report-ekb-66003','Екатеринбург · магазин № 66/003','other','Адрес уточняется',true),
 ('report-ekb-mega','Екатеринбург · Мега','other','Адрес уточняется',true)
on conflict(id) do nothing;
update public.webbase_network_warehouses set store_id='report-spb',company='smart_orange',reviewed=true,updated_at=now()
 where key in (public.webbase_network_warehouse_key('Склад Санкт-Петербург'),public.webbase_network_warehouse_key('Склад Санкт-Петербург ОВ')) and store_id is null;
update public.webbase_network_warehouses set store_id='report-ekb-66003',company='mixtech',reviewed=true,updated_at=now()
 where key in (public.webbase_network_warehouse_key('Склад Магазин № 66/003 Екатеринбург'),public.webbase_network_warehouse_key('Склад Магазин № 66/003 Екатеринбург ОВ')) and store_id is null;
update public.webbase_network_warehouses set store_id='report-ekb-mega',company='mixtech',reviewed=true,updated_at=now()
 where key=public.webbase_network_warehouse_key('Склад Мега Екб') and store_id is null;
