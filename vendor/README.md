# Pinned browser dependencies

Local copies avoid a separate CDN connection at startup.

- Supabase JS 2.95.0: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.95.0/dist/umd/supabase.min.js (MIT; SUPABASE-LICENSE).
- SheetJS 0.18.5: https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js (Apache 2.0; XLSX-LICENSE), loaded only when an Excel file is selected.

- Three.js 0.160.1: https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.min.js (MIT; THREE-LICENSE), dynamically loaded only in the preorder presentation. The mesh renders on pose/size changes, not a continuous WebGL loop.

Unmodified distribution files. SHA256SUMS records the downloaded bytes.
