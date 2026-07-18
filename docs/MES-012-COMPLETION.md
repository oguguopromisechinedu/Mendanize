# MES-012 AI Tools Management — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-013 — Homepage CMS](./engineering/MES-013.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature | `features/ai-tools` |
| Data | `services/content/tools.ts` |
| Models | `Tool`, `ToolCategoryRelation`, `ToolTopicRelation`, `ToolFeature`, `ToolImage`, `ToolTag` + enums (`ToolStatus`, `ToolPricing`, `ToolDifficulty`, `ToolAvailability`, `ToolFeatureKind`, `ToolImageKind`) |
| Migration | `20260715180000_mes012_ai_tools` |
| SEO | `resolveMetadata({ entityType: "ai_tool" })` in `services/seo` |
| Public stubs | `listAiTools` / `getAiToolBySlug` on Content Service (published only) |

## Surfaces

- **List** — search, status tabs, bulk publish/archive/delete; columns: logo, name, slug, category, topic, developer, pricing, status, featured, updated
- **Editor** — basics, classification, pricing, features/use cases/advantages/limitations, educational fields, media, SEO, featured/status
- **Preview** — admin approximation of public tool page (MES-027)
- Routes under `/dashboard/ai-tools` (new, `[id]`, preview, drafts/published/archived)

## Distinct from AI Studio

| | **AI Tools (MES-012)** | **AI Studio (MES-011)** |
|--|------------------------|-------------------------|
| Path | `/dashboard/ai-tools` | `/dashboard/ai-studio` |
| Purpose | Curate Discover directory listings | Generate article/image drafts |
| Audience | Editors managing educational tools | Editors producing content assets |

## How later modules integrate

| Module | Integration |
|--------|-------------|
| **Articles / Guides** | Manual related ID overrides now; Recommendations Service (MES-018) for automatic links |
| **Categories / Topics (MES-009)** | `ToolCategoryRelation` / `ToolTopicRelation` |
| **Search** | Type `ai_tool` already in Search types; indexing follows when Search is wired |
| **Homepage (MES-013)** | Featured tools can surface via Content/Homepage blocks |
| **Ask Mendanize (MES-019)** | Tools remain educational context; no Ask UI in this phase |
| **Public directory (MES-027)** | Consumes `listAiTools` / `getAiToolBySlug` |

## STOP

Ready for **MES-013**. Do not start Homepage CMS until requested.
