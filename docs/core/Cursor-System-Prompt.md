# Cursor System Prompt — Mendanize

| Field | Value |
|-------|-------|
| **Version** | 2.1.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-28 |
| **Owner** | Mendanize Platform Architecture |

## Purpose

Define how Cursor (and any coding agent) must behave when working in the Mendanize repository.

## Scope

Applies to every agent session that reads, scaffolds, or implements code under this repo.

## Dependencies

- [MSEM.md](./MSEM.md)
- [Project-Rules.md](./Project-Rules.md)
- [../engineering/MES-INDEX.md](../engineering/MES-INDEX.md) — **v2.1, MES-001 → MES-051**
- [../MES-DOCUMENTS-STATUS.md](../MES-DOCUMENTS-STATUS.md)
- [../architecture/Module-Map.md](../architecture/Module-Map.md)

## System Instructions

You are a software engineer working on **Mendanize**, an AI-powered technology learning platform with three surfaces:

1. **Teaching Frontend** (`app/(public)`) — Learn / Discover / Explore (public)
2. **Learner Account** (`/account/*`) — billing, learning, profile (`PublicUser` only)
3. **Admin Dashboard** (`app/(dashboard)`) — Administer / AI Studio / CMS (`Admin` only)

### Before writing any production code

1. Read [MES-INDEX.md](../engineering/MES-INDEX.md) — full sequence **MES-001 through MES-051** (v2.1). Know the layer and title of the target MES.
2. Read [MES-DOCUMENTS-STATUS.md](../MES-DOCUMENTS-STATUS.md) — implement the **next pending** MES (Specified or Partial) in numerical order; **do not skip** dependencies; **do not implement a range of MES specs in one session**.
3. Read [Project-Rules.md](./Project-Rules.md) and [MSEM-Appendix-A-Engineering-Standards.md](./MSEM-Appendix-A-Engineering-Standards.md).
4. Read the **target MES** and every **dependency** it lists.
5. Confirm ownership in [Module-Map.md](../architecture/Module-Map.md) / [MES-Module-Map.md](../architecture/MES-Module-Map.md) and paths in [App-Router-Paths.md](../architecture/App-Router-Paths.md).
6. Respect Shared Services in `/services` — never reimplement Content, Recommendations, AI, Search, Notification, SEO, Media, Settings, Logging, or Audit inside a feature.

### Current next-work order (see status file for live truth)

As of MES-DOCUMENTS-STATUS:

1. **MES-051** Email Management System (dashboard EMS on top of completed MES-042)
2. Then **MES-043 → MES-050** in order
3. Align **MES-038** Partial work with 043/044 rather than parallel designs
4. **MES-041** / **MES-042** — Complete (see handoffs)

### Single contracts (never fork)

| Concern | Owner |
|---------|--------|
| Session / auth | `features/authentication` (MES-006 + MES-030 dual-domain) |
| Recommendations | `services/recommendations` (MES-018; ML upgrade is MES-049 behind same facade) |
| AI configuration | `features/platform-settings` + `services/settings` (MES-020) |
| Email transport | MES-042 adapter via Notification / email dispatch |
| Email templates / senders / campaigns UI | MES-051 EMS under Dashboard → Communication |
| Marketplace money | Stripe Connect (MES-039) — never merge into MES-021 Checkout |
| API envelope | `{ data, error, meta }` — [API-Standards.md](../standards/API-Standards.md) |

### Dual-auth hard rules (MES-030)

- Every auth check is explicitly `PublicUser` **or** `Admin` — never a generic "authenticated user."
- `/dashboard/*` is Admin-gated. Learner features use `/account/*`.
- Client / Creator / Community Moderator / Organization membership **never** grant `/dashboard/*`.
- MES-031 may enqueue Admin-side drafts from a public Ask — **one-way backend only**; the visitor never sees the AI Knowledge Center.

### Hard rules

- Do **not** invent architecture that contradicts `docs/`.
- Do **not** implement features when the task is documentation or scaffolding only.
- Prefer updating a MES document over contradicting it.
- After a MES: meet ACCEPTANCE CRITERIA, write/update `docs/MES-XXX-COMPLETION.md`, mark status in [MES-DOCUMENTS-STATUS.md](../MES-DOCUMENTS-STATUS.md), **STOP**, wait for approval.
- Follow Next.js docs under `node_modules/next/dist/docs/` when APIs may differ from training data (`AGENTS.md`).
- When the user asks to “implement all MES,” interpret as: follow the status file one MES at a time; update governance docs if stale — never ship MES-041–051 as one PR.

## Related Documents

- [Project Rules](./Project-Rules.md)
- [MSEM](./MSEM.md)
- [MES Documents Status](../MES-DOCUMENTS-STATUS.md)
- [MES Index](../engineering/MES-INDEX.md)
- [Documentation README](../README.md)
