# MES-009 Categories & Topics Management — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-010 — Learning Guides Management](./engineering/MES-010.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature | `features/categories-topics` |
| Data | `services/content/taxonomy.ts` — single shared taxonomy layer |
| Models | `Category`, `Topic`, `CategoryStatus`, `TopicStatus`, `CategoryImage`, `TopicImage` |
| Migration | `20260715150000_mes009_taxonomy` |
| Rule | One Category → many Topics; Topic **requires** `categoryId` (no orphans) |

## Surfaces

- **Categories:** list (search/bulk), create/edit, detail (stats, topics, recent articles)
- **Topics:** list (filter by category, bulk), create/edit, detail (stats, parent, recent articles)
- Article editor (MES-008) now reads live taxonomy via `listCategorySummaries` / `listTopicSummaries`

## Validation

- Unique name/slug per entity
- Topic create/update rejects missing parent category
- Category delete blocked when topics remain (Prisma `Restrict` + memory guard)

## How later modules use taxonomy

| Consumer | Integration |
|----------|-------------|
| **Articles (MES-008)** | `categoryId` / `topicId` on `Article` — already wired |
| **Learning Guides (MES-010)** | Attach guides to `topicId` via Content Service |
| **AI Tools (MES-012)** | Attach tools to topics the same way |
| **Search / Navigation / Homepage** | Read `listCategories()` / `listTopics()` public summaries |
| **Public pages (MES-024+)** | Category/topic landing pages consume taxonomy + content counts |
| **SEO Service** | `resolveMetadata` supports `category` and `topic` entity types |

## STOP

Ready for **MES-010**. Do not start Learning Guides until requested.
