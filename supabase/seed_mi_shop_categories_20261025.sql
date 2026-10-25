-- Preserve existing UUIDs, photos, descriptions and stock; change only reviewed categories.
update public.webbase_products p set category=v.category from (values
('5c4ded93-d904-4005-aa26-60299e4e0ed7'::uuid,'6941812792858','Аксессуары и другое','Компьютерная техника'),
('aa763a5c-4e23-4c95-8f50-3c5694b44523'::uuid,'6941812792421','Аксессуары и другое','Компьютерная техника'),
('124d317a-f76d-41b0-864e-7f6a283ee235'::uuid,'6941812775004','Умный дом','Видеонаблюдение'),
('34a09755-5ad4-45c0-bbf3-d473b365a9b1'::uuid,'6941948703032','Аксессуары и другое','Компьютерная техника'),
('31729d06-70d9-41d4-ac51-a58e90d28892'::uuid,'6941948702936','Аксессуары и другое','Компьютерная техника'),
('15be18f6-659a-41f1-8fa4-f627600f1b4e'::uuid,'6941948701908','Аксессуары и другое','Компьютерная техника')) v(id,sku,before,category) where p.id=v.id and p.sku=v.sku and p.category=v.before;
