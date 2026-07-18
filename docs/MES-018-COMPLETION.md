# MES-018 Recommendations Engine — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-019 — Ask Mendanize AI](./engineering/MES-019.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Shared Service | `services/recommendations` — **only** ranking engine |
| Feature UI | `features/recommendations` (`RecommendationsRail`) |
| Signal tables | `UserInterest`, `SavedContent`, `LearningHistory` (written by MES-022; read here) |
| Migration | `20260715240000_mes018_recommendations` |
| Public API | `GET /api/public/recommendations?contextType=&contextId=&limit=` |

## Canonical API

```ts
getRecommendations({
  contextType: "article" | "guide" | "tool" | "user" | "trending",
  contextId,
  limit,
}) → { items: [{ type→entityType, id, title, slug, href, thumbnail, reason, score }] }
```

Legacy MES-002 seams `getRelated` / `getRecommendedForUser` wrap this.

## Rules (phase 1)

- **Related** — category/topic overlap + featured + recency; tool curated IDs boost
- **User** — interests ∪ related-of-saved/history; cold-start falls back to trending
- **Trending** — article `viewCount` + featured/recency placeholders until Analytics (MES-023)

## Wired consumers

| Surface | Call |
|---------|------|
| Search discovery | `contextType: "trending"` |
| Public `/articles|guides|ai-tools/[slug]` | related rail |
| Admin article/guide/tool previews | related rail |
| Personalization (MES-022) | `contextType: "user"` + `RecommendationsRail` |

## Out of scope

ML/embeddings, real-time personalization, A/B ranking, interest/save UI (MES-022).

## STOP

Ready for **MES-019**. Do not start Ask Mendanize until requested.
