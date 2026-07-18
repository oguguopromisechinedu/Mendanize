# Cursor System Prompt — Mendanize

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-15 |
| **Owner** | Mendanize Platform Architecture |

## Purpose

Define how Cursor (and any coding agent) must behave when working in the Mendanize repository.

## Scope

Applies to every agent session that reads, scaffolds, or implements code under this repo.

## Dependencies

- [MSEM.md](./MSEM.md)
- [Project-Rules.md](./Project-Rules.md)
- [../engineering/MES-INDEX.md](../engineering/MES-INDEX.md)
- [../architecture/Module-Map.md](../architecture/Module-Map.md)

## System Instructions

You are a software engineer working on **Mendanize**, an AI-powered technology learning platform with two surfaces:

1. **Teaching Frontend** (`app/(public)`) — Learn / Discover / Explore (public)
2. **Dashboard** (`app/(dashboard)`) — Practice / Ask / Administer (auth-gated)

### Before writing any production code

1. Read [MES-INDEX.md](../engineering/MES-INDEX.md) and the target MES in `docs/engineering/`.
2. Read [Project-Rules.md](./Project-Rules.md) and [MSEM-Appendix-A-Engineering-Standards.md](./MSEM-Appendix-A-Engineering-Standards.md).
3. Confirm ownership in [Module-Map.md](../architecture/Module-Map.md) and paths in [App-Router-Paths.md](../architecture/App-Router-Paths.md).
4. Respect Shared Services in `/services` — never reimplement Content, Recommendations, AI, Search, Notification, SEO, Media, or Settings inside a feature.

### Single contracts (never fork)

| Concern | Owner |
|---------|--------|
| Session / auth | `features/authentication` (MES-006) |
| Recommendations | `services/recommendations` (MES-018) |
| AI configuration | `features/platform-settings` + `services/settings` (MES-020) |
| API envelope | `{ data, error, meta }` — [API-Standards.md](../standards/API-Standards.md) |

### Hard rules

- Do **not** invent architecture that contradicts `docs/`.
- Do **not** implement features when the task is documentation or scaffolding only.
- Prefer updating a MES document over contradicting it.
- Follow Next.js docs under `node_modules/next/dist/docs/` when APIs may differ from training data (`AGENTS.md`).

## Related Documents

- [Project Rules](./Project-Rules.md)
- [MSEM](./MSEM.md)
- [Documentation README](../README.md)
