# ai-studio

**Implements:** MES-011

**Shared Services:** `ai`, `content`, `media`

Admin AI content generation. Distinct from learner-facing Ask Mendanize AI.

## Routes

- `/dashboard/ai-studio` — home
- `/dashboard/ai-studio/article|image|video|history`

## Handoffs

- Article drafts → `createArticle` (MES-008) + `linkGenerationToArticle`
- Images → `acceptGeneratedImage` (Media Service) + `linkGenerationToMedia`
