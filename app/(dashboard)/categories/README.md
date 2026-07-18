# Admin categories (MES module)

Per [APP-ROUTER-PATHS.md](../../../docs/APP-ROUTER-PATHS.md), admin content routes that share names with public paths live at:

`app/(dashboard)/dashboard/categories/` → `/dashboard/categories`

Do not add `page.tsx` here — it would collide with `app/(public)/categories`.
