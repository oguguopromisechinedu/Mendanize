# MES-026 Public Learning Guide Experience — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-027 — Public AI Tools Directory](./engineering/MES-027.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature UI | `features/learning-guides/components/public/*` |
| Shared Service | `services/content` (`getPublishedGuideBySlug`, `listGuides`, `flattenGuideLessons`) |
| SEO | `services/seo` (`resolveMetadata`) + Course / HowTo + BreadcrumbList JSON-LD |
| Recommendations | MES-018 only (`contextType: "guide"`) |
| Ask | `AskContextualWidget` Tier 1 (`GUIDE`, lesson-scoped on lesson pages) |
| Layout | `PageShell` with `hideHeader` |

## Surfaces

| Route | Role |
|-------|------|
| `/guides` | Public index (`PublicGuideListView`) |
| `/guides/[slug]` | Guide overview — objectives, outline, Start Learning |
| `/guides/[slug]/lessons/[lessonSlug]` | Lesson reading + expandable section nav, prev/next |

## Experience

Overview: cover, taxonomy links, difficulty, duration, section/lesson counts, objectives, prerequisites, outline, progress placeholder, Ask, resource panel.

Lesson: sticky/expandable nav with current highlight, prose body, video/code/resource placeholders, completion placeholders, continue panel (next lesson + Ask + related).

## Integrations

| Module | How |
|--------|-----|
| **Articles / AI Tools** | Related rail via Recommendations Service |
| **Categories / Topics** | Real slug links when present on `GuideRecord` |
| **User Learning (MES-022)** | Authenticated views call `trackContentView` |
| **Search** | Published guides remain in public discovery surfaces |
| **SEO (MES-015)** | Canonical, OG/Twitter, Course/HowTo structured data |
| **Ask (MES-019)** | Contextual Tier 1 on overview and per lesson |
| **CMS (MES-010)** | Same Content Service; public serves `PUBLISHED` only |

## Out of scope (as specified)

Real progress/completion, certificates, quizzes, assignments, bookmarks, real downloads.

## STOP

Ready for **MES-027**. Do not start Public AI Tools Directory until requested.
