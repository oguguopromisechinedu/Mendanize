# Dependency Map

| Field | Value |
|-------|-------|
| **Version** | 1.1.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-23 |
| **Owner** | Mendanize Platform Architecture |


## Purpose

Make cross-MES and Shared Service dependencies explicit so implementation order and ownership remain unambiguous.


## Scope

Hard dependencies between MES documents and runtime Shared Services (MES-001 → MES-035).


## Dependencies

- [MES-INDEX.md](../engineering/MES-INDEX.md)
- [MODULE-MAP.md](./Module-Map.md)
- [MES-002.md](../engineering/MES-002.md)
- [MES-DOCUMENTS-STATUS.md](../MES-DOCUMENTS-STATUS.md)


## Foundational Chain

`MSEM → Appendix A → Project Rules → MES-INDEX → MES-001 → MES-002 → MES-003 → (surface/feature MES in numerical order)`


## Critical Deferrals

| Consumer specs | Must defer to | Ownership |
|----------------|---------------|-----------|
| MES-011, MES-019, MES-012 (runtime), MES-027 (execution), MES-031 | MES-020 | `services/settings` AI config |
| MES-017, MES-022, MES-023, MES-025, MES-026, MES-027, MES-031 | MES-018 | `services/recommendations` / content search |
| All dashboard modules | MES-006 + MES-007 + **MES-030** | dual session + Admin shell |
| Learner `/account/*` modules (MES-021, MES-022, MES-035) | MES-030 | `PublicUser` session only |
| MES-005 | MES-013 | homepage CMS vs public render |
| MES-025 / MES-026 / MES-027 | MES-008 / MES-010 / MES-012 | CMS source of content |
| MES-031 | MES-011, MES-014, MES-015, MES-019, MES-030 | generate via Studio; Media; SEO; Ask trigger; one-way boundary |
| MES-033 | MES-031 | AI knowledge reuse / cache invalidation |
| MES-035 | MES-021, MES-022, MES-019, MES-030 | deletion cascade order |
| MES-028 / MES-029 | all prior **including MES-030–035** | launch gates |


## Shared Service Fan-In

```
Content ← articles, guides, tools, homepage, taxonomy, public pages, MES-031 drafts→publish
AI ← ai-studio, ask-mendanize, media (generative), MES-031 orchestrator
Settings ← ai-studio, ask-mendanize, platform-settings UI, feature flags, privacy settings
Recommendations ← search, learning, analytics widgets, public related rails
Search ← publish pipeline, search UI, MES-031 knowledge lookup
SEO ← all public entities + MES-031 draft metadata
Media ← editors + public rendering + MES-031 generated images
Notification ← billing, learning, system, MES-031 draft-ready alerts
Logging / Audit ← MES-032, MES-030 auth events, MES-035 privacy actions
```


## Implementation Notes

- If a new feature needs ranking, extend MES-018 — do not add a parallel engine.
- If a new AI surface needs models/keys, extend MES-020 — do not add local config.
- MES-031 is the **only** allowed Public→Admin backend write path; never grant dashboard access to the triggering `PublicUser`.
- Prefer updating this map when introducing a new cross-module dependency.


## Related Documents

- [Module Map](./Module-Map.md)
- [Shared Services](../engineering/MES-002.md)
- [Platform Settings](../engineering/MES-020.md)
- [MES Documents Status](../MES-DOCUMENTS-STATUS.md)
