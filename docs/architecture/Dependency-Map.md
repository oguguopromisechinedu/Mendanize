# Dependency Map

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-14 |
| **Owner** | Mendanize Platform Architecture |


## Purpose

Make cross-MES and Shared Service dependencies explicit so implementation order and ownership remain unambiguous.


## Scope

Hard dependencies between MES documents and runtime Shared Services.


## Dependencies

- [MES-INDEX.md](../engineering/MES-INDEX.md)
- [MODULE-MAP.md](./Module-Map.md)
- [MES-002-Shared-Services.md](../engineering/MES-002.md)


## Foundational Chain

`MSEM → Appendix A → Project Rules → MES-001 → MES-002 → MES-003 → (surface/feature MES)`


## Critical Deferrals

| Consumer specs | Must defer to | Ownership |
|----------------|---------------|-----------|
| MES-011, MES-019, MES-012 (runtime), MES-027 (execution) | MES-020 | `services/settings` AI config |
| MES-017, MES-022, MES-023, MES-025, MES-026, MES-027 | MES-018 | `services/recommendations` |
| All dashboard modules | MES-006 + MES-007 | session + shell |
| MES-005 | MES-013 | homepage CMS vs public render |
| MES-025 / MES-026 / MES-027 | MES-008 / MES-010 / MES-012 | CMS source of content |
| MES-028 / MES-029 | all prior | launch gates |


## Shared Service Fan-In

```
Content ← articles, guides, tools, homepage, taxonomy, public pages
AI ← ai-studio, ask-mendanize, media (generative), tool runners
Settings ← ai-studio, ask-mendanize, platform-settings UI, feature flags
Recommendations ← search, learning, analytics widgets, public related rails
Search ← publish pipeline, search UI
SEO ← all public entities
Media ← editors + public rendering
Notification ← billing, learning, system
```


## Implementation Notes

- If a new feature needs ranking, extend MES-018 — do not add a parallel engine.
- If a new AI surface needs models/keys, extend MES-020 — do not add local config.
- Prefer updating this map when introducing a new cross-module dependency.


## Related Documents

- [Module Map](./Module-Map.md)
- [Shared Services](../engineering/MES-002.md)
- [Platform Settings](../engineering/MES-020.md)
