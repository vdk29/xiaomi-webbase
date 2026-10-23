# Xiaomi WebBase

Внутренний каталог магазина Xiaomi на GitHub Pages и Supabase.

## Возможности

- вход по регистронезависимому логину и паролю; прежний email администратора поддерживается;
- роли `admin` и `staff`, активная блокировка на уровне RLS;
- каталог с поиском, фильтрами, сортировкой и отдельными UUID-страницами товаров;
- редактирование карточки и остатков только администратором;
- приватная галерея Supabase Storage с signed URL, сжатием WebP и сортировкой;
- административное управление сотрудниками через Edge Function;
- предпросмотр Excel и транзакционный импорт 1С без перезаписи ручных полей и фотографий.

## Развёртывание

1. Применить `supabase/migrations/20261023210000_complete_webbase.sql`.
2. Развернуть `supabase/functions/webbase-create-staff/index.ts` с `verify_jwt = true`.
3. Убедиться, что бакет `webbase-products` приватный и ограничен 5 МБ / JPG, PNG, WebP.
4. Опубликовать ветку через GitHub Pages.

В браузерном коде хранится только publishable key. Secret/service-role key используется исключительно внутри Edge Function.

## Проверки

```bash
npm run check
npm test
```
