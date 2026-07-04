# Mendanize Publishing Platform Plan

## 1. Current architecture audit

### What already exists
- Next.js 16 app router foundation with a marketing homepage and a dashboard shell.
- NextAuth-based authentication with Prisma adapter and role support.
- Prisma schema already includes a strong base for publishing: `User`, `Category`, `Tag`, `Post`, `Subscriber`, and role-based access.
- Middleware already protects key areas such as `/dashboard`, `/workspace`, and `/admin`.
- Existing UI primitives and layout components are already in place for a polished experience.

### What is missing
- A clear separation between public reader routes and private editorial/admin routes.
- Public routes for `/blog`, `/blog/[slug]`, `/categories`, `/search`, and `/about`.
- Private editorial routes for `/dashboard`, `/dashboard/articles`, `/dashboard/create`, `/dashboard/media`, `/dashboard/analytics`, and `/dashboard/settings`.
- Admin-only access enforcement for all dashboard routes.
- A content/data access layer for posts and categories.
- Route-grouped architecture that makes the two experiences independent and easier to scale.

## 2. Proposed folder structure

```text
app/
  (public)/
    layout.tsx
    page.tsx
    about/page.tsx
    blog/page.tsx
    blog/[slug]/page.tsx
    categories/page.tsx
    search/page.tsx
  (dashboard)/
    dashboard/layout.tsx
    dashboard/page.tsx
    dashboard/articles/page.tsx
    dashboard/create/page.tsx
    dashboard/media/page.tsx
    dashboard/analytics/page.tsx
    dashboard/settings/page.tsx
components/
  public/
  dashboard/
lib/
  auth/
    access.ts
  content/
    posts.ts
```

## 3. Proposed database structure

The existing Prisma schema already covers most of the publishing foundation:

- `User`: administrators and editors
- `Post`: article content with SEO, status, author, category, and publish date
- `Category`: top-level content taxonomy
- `Tag`: optional content tagging
- `PostTag`: join table for many-to-many tags
- `Subscriber`: newsletter or audience list

Recommended additions for future expansion:
- `MediaAsset`: uploaded images and files
- `Page`: static marketing/utility pages
- `SiteSettings`: global branding, SEO defaults, and publication preferences

## 4. Proposed route structure

### Public reader experience
- `/` — homepage
- `/blog` — article archive
- `/blog/[slug]` — article details
- `/categories` — category browser
- `/search` — search experience
- `/about` — publication/about page

### Private admin experience
- `/dashboard` — overview
- `/dashboard/articles` — article management
- `/dashboard/create` — content creation entry point
- `/dashboard/media` — asset management
- `/dashboard/analytics` — publishing metrics
- `/dashboard/settings` — publication settings

## 5. Proposed role architecture

- `USER`: can browse public content only
- `ADMIN`: can access editorial dashboard and manage publishing workflows
- Future extension: `EDITOR` and `AUTHOR` roles for team collaboration

## 6. Implementation phases

1. Establish route-grouped public and dashboard structure.
2. Enforce admin-only access at the middleware layer.
3. Add placeholder pages for all required routes.
4. Introduce a small content access layer that is ready for real data later.
5. Verify the build and routing behavior.
