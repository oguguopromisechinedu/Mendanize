# MES-017 Search & Discovery — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-018 — Recommendations Engine](./engineering/MES-018.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature | `features/search` |
| Shared Service | `services/search` |
| Models | `SearchConfiguration`, `SearchHistory`, `TrendingSearch`, `SearchSuggestion`, `SearchFilter` |
| Migration | `20260715230000_mes017_search` |
| Public API | `GET /api/public/search` (+ `?mode=discovery`) |

## Surfaces

- **Global Search** — header `SearchModal` (⌘K / Ctrl+K, clear, voice placeholder, live suggestions, recent/trending)
- **`/search`** — results grouped by type + reusable filters (type, category, topic, difficulty, dates, featured, recently updated)
- **`/dashboard/search-settings`** — engine config, ranking/synonym/stop-word/analytics placeholders, filter toggles

## Integration

| Module | Role |
|--------|------|
| **Articles / Guides / AI Tools / Categories / Topics** | Indexed by Shared Search Service (published/active only) |
| **Header / Navigation (MES-004/016)** | Global search embed; settings manageability separate from Navbar Manager |
| **Homepage** | Discovery/trending available for embeds without forking query logic |
| **Ask Mendanize** | Linked from empty/filter UX; does not duplicate search ranking |
| **Recommendations (MES-018)** | Search discovery uses `getRecommendations({ contextType: "trending" })` |
| **Analytics (MES-023)** | Trending/history placeholders until real view counts land |

## Out of scope (as specified)

Semantic/AI search, live analytics, personalized ranking, voice backend, autocomplete backend, dedicated search infra beyond Postgres.

## STOP

Ready for **MES-018**. Do not start Recommendations until requested.
