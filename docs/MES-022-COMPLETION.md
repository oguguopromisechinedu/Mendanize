# MES-022 User Learning Experience — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-023 — Analytics & Insights Platform](./engineering/MES-023.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature | `features/user-learning` |
| Shared Service | `services/learning` |
| Recommendations | `services/recommendations` (`contextType: "user"`) — not reimplemented |
| Migration | `20260715270000_mes022_user_learning` |
| Dashboard API | `GET /api/dashboard/learning` |

## Data model

| Spec name | Implementation |
|-----------|----------------|
| `SavedArticle` / `SavedGuide` / `SavedAITool` | Polymorphic `SavedContent` (MES-018) by `RecommendationEntityKind` |
| `UserInterest` / `LearningHistory` | Existing MES-018 tables (writes owned here) |
| `LearningGoal` | New |
| `UserPreference` | New (difficulty, reminder placeholder, preferred taxonomy, theme) |
| `LearningProgress` | New placeholder rows until real guide lesson completion |

All queries/mutations scope by `userId` (ownership checks on delete/update).

## Surfaces (`/learning/*`)

| Route | Purpose |
|-------|---------|
| `/learning` | Dashboard: welcome, stats, continue, recent, saved, recommended |
| `/learning/continue` | Guide progress cards (placeholder progress) |
| `/learning/saved` | Search / filter / sort / remove / open |
| `/learning/history` | Recently viewed (+ search/Ask placeholders) |
| `/learning/recommended` | For-you rail via MES-018 |
| `/learning/interests` | Category/topic taxonomy toggles |
| `/learning/preferences` | Difficulty, goals, theme, reminder placeholder |

Authenticated layout redirects unsigned users to sign-in.

## Integrations

| Module | Role |
|--------|------|
| **Auth (MES-006)** | `requireUser` / `getSession` |
| **Recommendations (MES-018)** | Ranking + `recordContentView` |
| **Content** | Resolve titles/slugs; taxonomy for interests |
| **Ask (MES-019)** | History page links to `/dashboard/ask` |
| **Public slug pages** | Track views into `LearningHistory` when signed in |

## Out of scope (as specified)

Real rec algorithms beyond MES-018, real streak/progress math, email reminders, push, gamification.

## STOP

Ready for **MES-023**. Do not start Analytics until requested.
