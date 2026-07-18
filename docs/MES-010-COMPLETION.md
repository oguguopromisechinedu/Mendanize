# MES-010 Learning Guides Management — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-011 — Admin AI Studio](./engineering/MES-011.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature | `features/learning-guides` |
| Data | `services/content/guides.ts` |
| Hierarchy | **Guide → GuideSection → GuideLesson** |
| Required link | Guide `topicId` required (MES-009); category optional / derived |
| Models | `Guide`, `GuideSection`, `GuideLesson`, `GuideStatus`, `GuideDifficulty`, `GuideRevision`, `GuideProgress` (schema only) |
| Migration | `20260715160000_mes010_learning_guides` |
| Structure UX | Add/rename/reorder/delete with **Move up/down** (keyboard-accessible) |

## Surfaces

- List with search, status tabs, bulk publish/archive/delete
- Create/Edit with taxonomy, difficulty, objectives, SEO, cover, structure builder
- Lesson editor: TipTap content + video/code/resource/article/AI-tool placeholders
- Preview: cover, meta, objectives, sections/lessons, progress placeholder

## How later modules integrate

| Module | Integration |
|--------|-------------|
| **Categories/Topics (MES-009)** | Topic required; selects from taxonomy service |
| **Articles (MES-008)** | Lesson `articleId` placeholder for deep links |
| **AI Tools (MES-012)** | Lesson `aiToolId` placeholder |
| **GuideProgress / MES-021** | Table exists; UI tracking deferred |
| **Ask Mendanize / AI Studio** | Guides remain consumable content; generation of guide drafts can hand off later |
| **Public Learn (MES-025)** | `listGuides` / `getGuideBySlug` for published guides |

## STOP

Ready for **MES-011**. Do not start Admin AI Studio until requested.
