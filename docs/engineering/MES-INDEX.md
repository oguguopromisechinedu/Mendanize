# Mendanize Engineering Specifications — Master Index (Final, v1.0)

Complete, fresh sequence — MES-001 through MES-029, plus MSEM Appendix A. This supersedes every earlier draft (the original ChatGPT-generated MES-001–025, and this conversation's interim renumbering attempts). Nothing has been built against any of them yet, so this is the version to hand to Cursor.

---

## HOW TO USE THIS
Documents live under `docs/engineering/` (MES-001–029), with binding rules in `docs/core/`, contracts in `docs/standards/`, and maps in `docs/architecture/`. Give Cursor [Cursor-System-Prompt.md](../core/Cursor-System-Prompt.md) and this index first, then proceed spec by spec in order. Each spec states its own dependencies — don't skip ahead.

---

## THE SEQUENCE

| # | Title | Layer |
|---|---|---|
| Appendix A | [MSEM Appendix A — Engineering Standards](../core/MSEM-Appendix-A-Engineering-Standards.md) | Referenced by every spec |
| [MES-001](./MES-001.md) | Project Foundation & Product Vision | Foundation |
| [MES-002](./MES-002.md) | Shared Services & API Architecture | Foundation |
| [MES-003](./MES-003.md) | Design System | Foundation |
| [MES-004](./MES-004.md) | Public Website Structure & Global Navigation | Foundation |
| [MES-005](./MES-005.md) | Premium Homepage Experience | Foundation |
| [MES-006](./MES-006.md) | Authentication & User Management | Foundation |
| [MES-007](./MES-007.md) | Admin Dashboard Foundation | Foundation |
| [MES-008](./MES-008.md) | Article Management System (CMS) | Content Module |
| [MES-009](./MES-009.md) | Categories & Topics Management | Content Module |
| [MES-010](./MES-010.md) | Learning Guides Management | Content Module |
| [MES-011](./MES-011.md) | Admin AI Studio (Content Generation) | Content Module |
| [MES-012](./MES-012.md) | AI Tools Management | Content Module |
| [MES-013](./MES-013.md) | Homepage Content Management System | Content Module |
| [MES-014](./MES-014.md) | Media Library & Digital Asset Management | Content Module |
| [MES-015](./MES-015.md) | SEO & Metadata Management (SEO Center) | Content Module |
| [MES-016](./MES-016.md) | Navigation & Menu Management (Navbar Manager) | Content Module |
| [MES-017](./MES-017.md) | Search & Discovery Engine | Platform Service |
| [MES-018](./MES-018.md) | Recommendations Engine | Platform Service |
| [MES-019](./MES-019.md) | Ask Mendanize AI Platform | Platform Service |
| [MES-020](./MES-020.md) | Platform Settings & Configuration | Platform Service |
| [MES-021](./MES-021.md) | Billing & Subscriptions | Platform Service |
| [MES-022](./MES-022.md) | User Learning Experience & Personalization | User Experience |
| [MES-023](./MES-023.md) | Analytics & Insights Platform | User Experience |
| [MES-024](./MES-024.md) | Notification & Communication System | User Experience |
| [MES-025](./MES-025.md) | Public Article Experience | Public Surface |
| [MES-026](./MES-026.md) | Public Learning Guide Experience | Public Surface |
| [MES-027](./MES-027.md) | Public AI Tools Directory | Public Surface |
| [MES-028](./MES-028.md) | Performance, Security & Production Readiness | Launch |
| [MES-029](./MES-029.md) | Final QA, Testing & Production Launch | Launch |

---

## WHAT THIS SEQUENCE FIXES vs. THE ORIGINAL 25-SPEC DRAFT

1. **No duplicated logic.** Recommendations (MES-018), AI configuration (MES-020), session handling (MES-006), and API contracts (MES-002) each have exactly one canonical implementation that every other module calls — instead of being independently reinvented across Search, Personalization, Analytics, and three public pages.
2. **Security and testing start at MES-002**, not as an afterthought at the end — every module builds against the Appendix A baseline from day one; MES-028 audits adherence, it doesn't introduce the concept.
3. **The missing Billing spec exists** (MES-021) — matches the stated MES-001 business objective that had no corresponding module before.
4. **Ask Mendanize AI is internally consistent** — a public Tier 1 contextual widget (embedded in MES-025/026/027) and a full gated Tier 2 dashboard experience, with an explicit handoff, instead of contradicting itself across four specs.
5. **The Admin AI Studio is now a real module** (MES-011) — the reference screenshots showed AI-powered article/image/video generation as core to the admin experience; the original 25-spec draft never accounted for it.
6. **Multi-provider AI from the start** (MES-002's AI Service) — Claude, OpenAI, Gemini, Grok, DALL-E — matching the reference's "AI & API Status" panel, instead of assuming a single provider.
7. **No repeated boilerplate.** Every spec is shorter and states only its actual scope + exceptions, deferring standards to Appendix A — 29 focused documents instead of 25 documents each re-explaining accessibility from scratch.

---

## DESIGN NOTE
The reference screenshots used for dashboard/homepage inspiration show a purple/dark-navy palette — this is an **older, already-flagged-as-diverging** Mendanize direction. The current locked palette (ink dark `#0D0D0D`, amber `#E8940C`, Bricolage Grotesque + Instrument Sans) from MES-003 is what's authoritative. The reference informed structure and information architecture only, per every spec's own "use as inspiration, do not copy" instruction.

---

## FUTURE ROADMAP (explicitly out of this sequence)
Real ML-based recommendations, real learning-progress tracking and completion certificates, multi-language support, community features, mobile apps, enterprise offerings, AI tool submissions/reviews, affiliate tracking, final per-tier billing gates. Each becomes its own MES-03X spec once actually designed — not before.
