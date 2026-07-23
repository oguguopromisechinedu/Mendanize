# Mendanize Engineering Specifications — Master Index (Final, v1.5)

Complete sequence — **MES-001 through MES-035**, plus MSEM Appendix A. This supersedes every earlier draft. **Note:** per the build history, MES-001–028 were already implemented by Cursor and a v1.0 Production Readiness Report (MES-029) was produced before MES-030 (Dual Authentication) was introduced. MES-030 is therefore a **retrofit** against the live codebase, not greenfield — see MES-030 and the updated MES-006 for what that means in practice. Specs MES-031–035 extend the platform after that baseline. Every other spec in this index has been updated in place to reference `PublicUser`/`Admin` explicitly wherever it previously said "user," "authenticated," or implied a single shared session.

**Operational status:** [MES-DOCUMENTS-STATUS.md](../MES-DOCUMENTS-STATUS.md) — use that table to know what is Complete vs next to implement.

---

## HOW TO USE THIS

1. Give Cursor / contributors **this index first**, then [MES-DOCUMENTS-STATUS.md](../MES-DOCUMENTS-STATUS.md), then [Project-Rules.md](../core/Project-Rules.md) + Appendix A.
2. Proceed **spec by spec in numerical order**. Each spec states its own dependencies — don't skip ahead.
3. Confirm folder ownership in [Module-Map.md](../architecture/Module-Map.md) and routes in [App-Router-Paths.md](../architecture/App-Router-Paths.md).
4. Meet ACCEPTANCE CRITERIA, honour WHAT NOT TO BUILD, then **STOP** and wait for approval before the next MES.

---

## THE SEQUENCE

| #          | Title                                                                                                | Layer                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Appendix A | Engineering Standards (Accessibility, Responsive, Performance, SEO, Code Quality, Security, Testing) | Referenced by every spec                                     |
| MES-001    | Project Foundation & Product Vision                                                                  | Foundation                                                   |
| MES-002    | Shared Services & API Architecture                                                                   | Foundation                                                   |
| MES-003    | Design System                                                                                        | Foundation                                                   |
| MES-004    | Public Website Structure & Global Navigation                                                         | Foundation                                                   |
| MES-005    | Premium Homepage Experience                                                                          | Foundation                                                   |
| MES-006    | Authentication & Authorization Foundation (v2.0 — dual-domain aware)                                 | Foundation                                                   |
| MES-007    | Enterprise Admin Dashboard Architecture (v3.0 — Platform Services–integrated)                        | Foundation                                                   |
| MES-008    | Article Management System (CMS)                                                                      | Content Module                                               |
| MES-009    | Categories & Topics Management                                                                       | Content Module                                               |
| MES-010    | Learning Guides Management                                                                           | Content Module                                               |
| MES-011    | Admin AI Studio (Content Generation)                                                                 | Content Module                                               |
| MES-012    | AI Tools Management                                                                                  | Content Module                                               |
| MES-013    | Homepage Content Management System                                                                   | Content Module                                               |
| MES-014    | Media Library & Digital Asset Management                                                             | Content Module                                               |
| MES-015    | SEO & Metadata Management (SEO Center)                                                               | Content Module                                               |
| MES-016    | Navigation & Menu Management (Navbar Manager)                                                        | Content Module                                               |
| MES-017    | Search & Discovery Engine                                                                            | Platform Service                                             |
| MES-018    | Recommendations Engine                                                                               | Platform Service                                             |
| MES-019    | Ask Mendanize AI Platform                                                                            | Platform Service                                             |
| MES-020    | Platform Settings & Configuration                                                                    | Platform Service                                             |
| MES-021    | Billing & Subscriptions                                                                              | Platform Service                                             |
| MES-022    | User Learning Experience & Personalization                                                           | User Experience                                              |
| MES-023    | Analytics & Insights Platform                                                                        | User Experience                                              |
| MES-024    | Notification & Communication System                                                                  | User Experience                                              |
| MES-025    | Public Article Experience                                                                            | Public Surface                                               |
| MES-026    | Public Learning Guide Experience                                                                     | Public Surface                                               |
| MES-027    | Public AI Tools Directory                                                                            | Public Surface                                               |
| MES-028    | Performance, Security & Production Readiness                                                         | Launch                                                       |
| MES-029    | Final QA, Testing & Production Launch                                                                | Launch                                                       |
| MES-030    | Dual Authentication & Authorization Architecture (retrofit)                                          | Foundation — supersedes single-domain assumptions everywhere |
| MES-031    | AI Knowledge Generation Pipeline                                                                     | Platform Service — connects MES-019 and MES-011              |
| MES-032    | Observability & Logging                                                                              | Launch — rightsized, fleshes out MES-028                     |
| MES-033    | Caching & Performance                                                                                | Launch — rightsized, focus on AI response cost control       |
| MES-034    | Backup & Recovery                                                                                    | Launch — rightsized, relies on Supabase's built-in backups   |
| MES-035    | Privacy & Compliance Basics                                                                          | Launch — rightsized, real GDPR/CCPA obligations only         |

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

## v1.1 UPDATE — DUAL AUTHENTICATION PATCH PASS (MES-030)

MES-030 splits the single user model into `PublicUser` (learners) and `Admin` (staff), with fully isolated sessions. Every spec from MES-002 onward that referenced a generic "user," "authenticated," or a shared session has been updated to name `PublicUser` or `Admin` explicitly. Specific changes:

- **MES-002** — API route auth checks now explicit (`PublicUser` or `Admin`, never generic).
- **MES-006** — replaced wholesale with the dual-domain-aware v2.0 (this is the version MES-030 retrofits against).
- **MES-007** — now explicitly depends on MES-030; "User Profile Menu" clarified as the `Admin`'s own profile.
- **MES-010, MES-018** — future progress-tracking and recommendation context clarified as `PublicUser`-scoped.
- **MES-019 (Ask Mendanize AI)** — Tier 2 auth, sign-in handoff, and the `Conversation` model's foreign key all explicitly tied to `PublicUser`.
- **MES-020** — Authentication Settings scoped explicitly to the Public domain; Admin account/role policy lives in MES-030 instead.
- **MES-021 (Billing) — real conflict found and fixed:** the original spec routed subscription management through `/dashboard/settings/billing`, which is now Admin-only under MES-030. Billing management is a `PublicUser` feature and has been moved to `/account/billing`; `Subscription.userId` corrected to `Subscription.publicUserId`. Added a read-only, admin-side revenue reporting view that never touches an individual user's payment details directly.
- **MES-022 (Personalization)** — rewritten to scope every model and route (`/account/`_, not `/dashboard/_`) to `PublicUser` explicitly, matching the MES-021 fix.
- **MES-024** — notification preferences split explicitly between `PublicUser` and `Admin`.
- **MES-028, MES-029** — both now depend on MES-030; MES-028's Security Audit checks for the two independent session contracts and real RBAC enforcement (not just "prepared"); MES-029 adds an explicit dual-auth isolation test to its cross-module integration checks.

**The most important catch in this pass:** the original MES-021/MES-022 routing under `/dashboard/`_ would have been a real bug if built as originally written — learners would have had no working billing or account area at all once MES-030 locked `/dashboard/_` to Admins only. This is exactly the kind of cross-spec conflict this patch pass exists to catch before Cursor builds it.

---

## v1.2 UPDATE — ENTERPRISE ADMIN DASHBOARD (MES-007 v3.0)

MES-007 was upgraded from a basic dashboard shell to a full enterprise architecture: Command Palette, Right Context Panel, Status Bar, module auto-registration, concrete performance targets, and a Platform Services–first design where every dashboard module communicates only through MES-002's shared services. Three reconciliations were required:

- **Six new shared services folded into MES-002** (not redefined separately): Learning Service, Analytics Service, Homepage Service, Navigation Service, Logging Service, Audit Service. MES-002 already owned Content/AI/Search/Notification/SEO/Media/Settings — the new doc's versions of those were dropped in favor of the existing canonical ones.
- **Dual-auth boundary enforced explicitly:** this dashboard is 100% `Admin`-gated. Its Users domain lists Administrators/Editors/Authors as real `Admin` roles with full CRUD, but **Subscribers are** `PublicUser` **accounts** — shown read-only for visibility, with no ability to log in as them or modify their account, which stays inside their own session per MES-030.
- **Permission-aware sidebar and a "Permission Denied" state are now explicit requirements**, not just implied by RBAC existing — this is where MES-030's role/permission model actually surfaces in the UI, not just the route guard.

---

## v1.3 UPDATE — AI KNOWLEDGE GENERATION PIPELINE (MES-031, new)

Confirmed via audit that no existing spec connects Ask Mendanize AI (MES-019, public-facing conversational AI) to the Admin AI Studio (MES-011, admin-triggered content generation). MES-031 closes that gap: when a visitor's question has no good answer in the existing knowledge base, the system automatically drafts a new Article using MES-011's generation engine, queues it for admin review in a new AI Knowledge Center, and never auto-publishes.

**Why this needed careful dual-auth handling:** this is the one place in the platform where a `PublicUser` action (asking a question) causes `Admin`-side data to be created (a draft in the review queue). MES-031 is explicit that this is a one-way, backend-only trigger — the visitor's session never gains any visibility into the draft or the Knowledge Center, and no new session type or permission exception was introduced. MES-011 and MES-019 were both updated with a one-line cross-reference to MES-031 rather than restating its logic.

---

## v1.4 UPDATE — TRIAGE OF MES-033 THROUGH MES-053 (21 pasted "enterprise" specs)

A batch of 21 enterprise-scale specs (MES-033–053) was reviewed against what's already built and what actually fits a solo-founder platform at Mendanize's current stage. Verdict:

**Dropped as duplicates of existing specs:** MES-033/045 (both duplicate MES-017 Search), MES-034 (duplicates MES-014 Media Library), MES-035 (duplicates MES-023 Analytics), MES-040 (duplicates MES-002's AI Service + MES-011 + MES-031), MES-042 (duplicates MES-018 Recommendations + MES-022 Personalization), MES-046 (duplicates MES-002's API Architecture), MES-047 (duplicates MES-024 Notifications). **MES-049 (Membership/Billing) was the most important catch** — building it would have directly reintroduced the `/dashboard` routing conflict already fixed in MES-021.

**Dropped as wrong scale for what Mendanize is:** MES-048 (11-language i18n — premature pre-PMF), MES-050 (plugin marketplace/SDK — no third-party developer ecosystem exists), MES-051 (native mobile/wearables/AR/VR — no mobile app has ever been scoped), MES-052 (Kubernetes/GitOps/multi-region DevOps — this deploys to Vercel), MES-053 as originally written (ISO 27001/SOC 2/Legal Hold — enterprise compliance theater with no enterprise customers).

**Kept, rightsized, and renumbered:**

- MES-032 — Observability & Logging (rightsized from MES-037; fleshes out what MES-028 previously only described as "architecture preparation")
- MES-033 — Caching & Performance (rightsized from MES-036; the one genuinely valuable idea is AI response caching to control provider costs via MES-031's knowledge reuse)
- MES-034 — Backup & Recovery (rightsized from MES-038; relies on Supabase's built-in backups rather than building custom infrastructure)
- MES-035 — Privacy & Compliance Basics (rightsized from MES-053; keeps the real GDPR/CCPA obligations — consent, export, deletion — drops the enterprise governance program)

**Folded into existing specs rather than becoming new platforms:** the Knowledge Graph idea (MES-043) became a short "lightweight relationship model" section in MES-018 (Recommendations) — reusing existing Category/Topic tags instead of a graph database. The Content QA idea (MES-044) became an "Editorial Quality Checklist" section in MES-008 (Articles) — a pre-publish checklist, not a scoring engine. The Workflow Automation idea (MES-039) is already covered by MES-007's existing Publishing Workflow visualization; no separate engine needed.

**The general pattern worth naming:** most of these 21 specs took something Mendanize already has at an appropriate size and re-described it at enterprise-vendor scale (a "Platform," a "Center," a "Gateway," a dozen named microservices) for a single-product, pre-revenue-scale, solo-founder build. The fix in each case was the same: keep the real underlying need, drop the ceremony.

---

## DESIGN NOTE

The reference screenshots used for dashboard/homepage inspiration show a purple/dark-navy palette — this is an **older, already-flagged-as-diverging** Mendanize direction. The current locked palette (ink dark `#0D0D0D`, amber `#E8940C`, Bricolage Grotesque + Instrument Sans) from MES-003 is what's authoritative. The reference informed structure and information architecture only, per every spec's own "use as inspiration, do not copy" instruction.

---

## v1.5 UPDATE — MES-001 CATCH-UP AND FULL SEQUENCE CONSISTENCY PASS

MES-001 was found to still contain a stale four-item Spec Roadmap fragment that misdescribed MES-002–004 (leftover from a pre-final-numbering draft) and a two-surface architecture model that no longer matched reality once MES-030 made `/dashboard/*` Admin-only. Both are now fixed: MES-001 v3.0 names three surfaces (Teaching Frontend, Learner Account Area at `/account/*`, Admin Dashboard) and carries the full, accurate roadmap through MES-035. Three leftover "both surfaces" phrases elsewhere in the document were also corrected to reflect all three.

**MES-028 and MES-029 — the launch gate — were the other real gap.** Both predated MES-031–035 entirely and would have shipped without auditing or testing any of them. Both now list all five in their dependencies and scope. Most importantly, MES-029's cross-module integration checks now explicitly test **MES-031's one-way boundary** (no `PublicUser` session, including the one that asked the triggering question, can reach the AI Draft queue) and **MES-035's account-deletion cascade** (Billing, Personalization, and Ask Mendanize AI conversation history all clear correctly) — these were the two riskiest untested seams in the whole sequence.

**Five smaller cross-reference gaps closed:** Media Library (MES-014) and Search (MES-017) now note they're reused by MES-031's pipeline rather than that pipeline having its own copy. Platform Settings (MES-020) gained a Privacy Settings section pointing to MES-035. Billing (MES-021) now states the correct cancel-before-delete order MES-035's cascade depends on. Personalization (MES-022) now explicitly lists itself as included in that same cascade.

**Net effect:** every spec in the sequence now correctly cross-references every other spec it depends on or is depended on by — there are no more stale spec-count references or silently-missing scope anywhere in MES-001 through MES-035.

---

## FUTURE ROADMAP (explicitly out of this sequence)

Real ML-based recommendations, real learning-progress tracking and completion certificates, multi-language support, community features, mobile apps, enterprise offerings, AI tool submissions/reviews, affiliate tracking, final per-tier billing gates. Each becomes its own MES-03X spec once actually designed — not before.
