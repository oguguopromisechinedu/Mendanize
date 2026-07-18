# Admin articles (MES module)

Per [APP-ROUTER-PATHS.md](../../../docs/APP-ROUTER-PATHS.md), admin content routes that share names with public paths live at:

`app/(dashboard)/dashboard/articles/` → `/dashboard/articles`

Do not add `page.tsx` here — it would collide with `app/(public)/articles`.
