# MES-008 Article Management System — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-009 — Categories & Topics Management](./engineering/MES-009.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature | `features/articles` |
| Data | `services/content/articles.ts` (+ public `listArticles` / `getArticleBySlug`) |
| DB | `Article`, `ArticleStatus`, `Topic`, `ArticleTag`, `FeaturedImage`, `ArticleRevision` — migration `20260715140000_mes008_article_cms` |
| Editor | TipTap (`ArticleRichTextEditor`) |
| Auth | Dashboard gate → `requireEditor()` / `isStaffRole` in `proxy.ts` (Editors + Admins) |
| Offline/demo | In-memory article store when `DATABASE_URL` is unset |

## Surfaces

- `/dashboard/articles` — searchable table, bulk publish/archive/delete
- `/dashboard/articles/drafts|scheduled|published|archived` — status filtered lists
- `/dashboard/articles/new` + `/dashboard/articles/[id]` — create/edit
- `/dashboard/articles/[id]/preview` — responsive admin preview (public Learn = MES-024)

## How later modules plug in

| Module | Integration |
|--------|-------------|
| **MES-009 Categories/Topics** | Editor selects already read `listCategoriesAdmin` / `listTopicsAdmin`; replace seeds with managed taxonomy |
| **MES-011 AI Studio** | `assistArticleAuthoring` / Generate with AI entry point — live generation lands here |
| **MES-014 Media Library** | Featured-image placeholders + URL field → Media Picker via `services/media` |
| **SEO Center** | Article SEO fields already stored; `resolveMetadata({ entityType: "article" })` reads them |
| **MES-024 Public site** | Consume published records from Content Service (`listArticles` / `getArticleBySlug`) |

Legacy `Post` models remain for any pre-existing blog experiments — Article CMS is the Learn pillar source of truth.

## STOP

Ready for **MES-009**. Do not start Categories & Topics until requested.
