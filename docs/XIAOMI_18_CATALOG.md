# Xiaomi 18 Pro / Pro Max — Global catalogue update, 18 November 2026

Applied to the existing Supabase project `dazniyfntumbljkocjoo`. No products were created/deleted, no prices changed, and no stock table was changed. The seed transaction checks the complete local inventory digest and product count before/after.

## Published data

- 16 retail variants: Pro / Pro Max × Black / White / Cosmic Blue / Velvet Red × 12/256 / 12/512 GB.
- Two existing black LDU cards receive the same physical-device pictures/specifications while retaining their own IDs, SKUs, demo category and stock. Photo inheritance does not merge inventory.
- 24 distinct WebP files in private `webbase-products` Storage: rear, front, rear three-quarter for each model/colour; 363,024 bytes total, maximum 19,932 bytes per image. Each card resolves three angles through an own or shared gallery.
- Manufacturer specifications, short descriptions, per-card RAM/storage/colour/weight/dimensions and source dates. Blue has its separately documented weight/thickness. Existing descriptions and administrative edits are protected.
- Two concise seller profiles use Global facts and their own review date.

## Sources and discrepancies

Specifications: [Xiaomi 18 Pro Global](https://www.mi.com/global/product/xiaomi-18-pro/specs/) and [Xiaomi 18 Pro Max Global](https://www.mi.com/global/product/xiaomi-18-pro-max/specs/), retrieved 18 November 2026. Photographs are from the exact colour-specific [mi-shop.com product pages](https://mi-shop.com/catalog/smartphones/xiaomi-18-pro-series/), our store's catalogue. The source page and original image URL are retained for every file.

The supplied shop price-tag photograph differs from Xiaomi Global: Pro has Snapdragon 8 Elite Gen 6, not Extreme; Pro Max supports 100 W wired charging, not 90 W. Both manufacturers' battery figures match the photograph: 6000 / 7050 mAh. The Pro resolution on mi-shop.com also differs from Xiaomi Global; the catalogue uses Xiaomi Global's 2436 × 1120. The basic Global package excludes a power adapter; store-specific bundles may differ. No unsupported Android version was inferred from the retailer's old template.

## Persistence and safe application

The photo registry already preserves full SKU keys across reimport/deletion. Migration `20261118132808_photo_gallery_1c_unit_suffix.sql` removes the `, шт` suffix before forming a physical model/colour gallery key. It also allows the explicit `(LDU)` prefix for picture sharing only. Other model qualifiers and complete colours remain in the key. Existing own galleries take precedence; orphan registry keys remain intact.

Network-generated single-image fallbacks can now expand to the complete shared gallery. This prevents a network thumbnail from hiding the other angles.

Reviewed JSON inputs are in `supabase/data/xiaomi-18-global-{images,specs}-20261118.json`. `python scripts/build-xiaomi-18-catalog-seed.py` generates the idempotent data seed, which requires verified Storage objects and fails on unexpected target identities or administrative edits. It never uploads files or modifies stock. Reapplying the seed was tested inside a rolled-back transaction.

The temporary `webbase-18-global-assets` worker accepted only the fixed manifest, used the existing Vault worker secret and signed uploads, verified all 24 server-side SHA-256 hashes, then was redeployed as HTTP 410. `staging-job.ts` records the completed job for review; the deployed entry point does not import it. No key, signed link, private report or stock snapshot is committed. No new cron or database access policy was added.

## Verification

- `npm run check`, `npm test` (117 passed; three pre-existing Excel-fixture checks skipped).
- `tests/shared-photos.sql`: real import RPC, 1C unit suffix, LDU photo inheritance with independent identity, model/colour separation, own-gallery priority, orphan/SKU restoration and staff RLS; transaction rolled back.
- `tests/photo-reimport.sql`: real import RPC restores a full gallery after UUID replacement; fourth photo rejected; transaction rolled back.
- `tests/xiaomi-18-catalog.sql`: live data, exact Global facts, actual Storage files, per-variant memory/colour and three distinct angles.
- `scripts/verify-xiaomi-18-catalog.cjs`: all 18 live cards through a read-only staff adapter with real signed Storage images, three gallery buttons, refresh, seller tabs, stock display and widths 320–1440px. Uses private snapshot/link files from environment variables, not committed fixtures.
