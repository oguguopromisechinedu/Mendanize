# AI Tools

**Implements:** MES-012 (admin CMS), MES-027 (public directory)

**Shared Services:** `content` (tools), `media`, `seo`, `recommendations`

Admin CMS for the Discover-pillar AI Tools directory.

**Not** Admin AI Studio (`/dashboard/ai-studio`) — this module curates educational tool listings.

## Surfaces

### Admin
- List: `/dashboard/ai-tools` (+ drafts / published / archived)
- Editor: `/dashboard/ai-tools/new`, `/dashboard/ai-tools/[id]`
- Preview: `/dashboard/ai-tools/[id]/preview`

### Public
- Directory: `/ai-tools` (search, filters, grid/list, comparison placeholder)
- Detail: `/ai-tools/[slug]` (learning panel, Ask Tier 1, related via MES-018, SEO)

## Data

`services/content/tools.ts` — Tool + relations (categories, topics, features, images, tags).
