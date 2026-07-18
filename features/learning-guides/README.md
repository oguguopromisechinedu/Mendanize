# learning-guides

**Implements:** MES-010 (admin CMS), MES-026 (public learning experience)

**Shared Services:** `content` (guides), `media`, `seo`, `recommendations`

Admin Learning Guides CMS — Guide → Section → Lesson hierarchy with TipTap lesson bodies and keyboard-accessible structure builder.

Public — `/guides`, `/guides/[slug]` overview, `/guides/[slug]/lessons/[lessonSlug]` lesson pages (nav, Ask Tier 1, related via MES-018, SEO).

## Routes

### Admin
- `/dashboard/guides`, `/drafts`, `/published`, `/archived`
- `/dashboard/guides/new`, `/[id]`, `/[id]/preview`

### Public
- `/guides`
- `/guides/[slug]`
- `/guides/[slug]/lessons/[lessonSlug]`
