# MES-025 Public Article Experience — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-026 — Public Guide Experience](./engineering/MES-026.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature UI | `features/articles/components/public/*` |
| Shared Service | `services/content` (`getPublishedArticleBySlug`, `listArticles`) |
| SEO | `services/seo` (`resolveMetadata`) + Article / BreadcrumbList JSON-LD |
| Recommendations | `features/recommendations` → MES-018 only |
| Ask | `AskContextualWidget` Tier 1 (`ARTICLE` context) |
| Layout | `PageShell` with `hideHeader` for custom reading header |

## Surfaces

| Route | Role |
|-------|------|
| `/articles` | Public index (`PublicArticleListView`) |
| `/articles/[slug]` | Full reading experience (`ArticleReadingView`) |

## Reading experience

Header (category/topic links, title, excerpt, author, dates, reading time, featured badge), featured image, session-only reading progress bar, sticky TOC (desktop) + mobile details TOC, prose body with heading anchors, author placeholder, share placeholders, Ask widget, tags / prev-next / Continue learning + Newsletter CTAs, related rail.

## Integrations

| Module | How |
|--------|-----|
| **Guides / AI Tools / Categories / Topics** | Related rail via Recommendations Service; taxonomy links use real `categorySlug` / `topicSlug` when present |
| **Search** | Published content remains discoverable through existing public search indexes |
| **SEO (MES-015)** | Canonical, OG/Twitter, robots, structured data on the article page |
| **Ask (MES-019)** | Contextual Tier 1 widget scoped to the article |
| **Learning (MES-022)** | Authenticated views call `trackContentView` |
| **CMS (MES-008)** | Same Content Service records; public only serves `PUBLISHED` |

## Out of scope (as specified)

Comments, ratings, persisted reading progress, real share APIs, reactions.

## STOP

Ready for **MES-026**. Do not start Public Guide Experience until requested.
