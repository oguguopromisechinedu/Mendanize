# Project Rules

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-15 |
| **Owner** | Mendanize Platform Architecture |

## Purpose

Binding project rules for how work is planned, documented, and implemented in the Mendanize repository. These are process and ownership rules — not the detailed Accessibility / Performance / SEO baselines (those live in Appendix A).

## Scope

Every engineer, contractor, and Cursor agent session.

## Dependencies

- [MSEM.md](./MSEM.md)
- [MSEM-Appendix-A-Engineering-Standards.md](./MSEM-Appendix-A-Engineering-Standards.md)
- [Cursor-System-Prompt.md](./Cursor-System-Prompt.md)

## Rules

1. **Docs before code** — Behaviour changes that affect architecture update `docs/` in the same change when practical.
2. **Spec order** — Follow [MES-INDEX.md](../engineering/MES-INDEX.md) and [MES-DOCUMENTS-STATUS.md](../MES-DOCUMENTS-STATUS.md). Do not skip dependencies. Implement the next pending MES; STOP after each.
3. **Appendix A is binding** — Every MES follows [MSEM-Appendix-A-Engineering-Standards.md](./MSEM-Appendix-A-Engineering-Standards.md) unless it states an explicit exception.
4. **Shared Services stay shared** — Content, Recommendations, AI, Search, Notification, SEO, Media, Settings, Logging, Audit live only under `/services`.
5. **Single contracts**
   - Session → MES-006 / MES-030 / `features/authentication`
   - Recommendations → MES-018 / `services/recommendations`
   - AI configuration → MES-020 / `services/settings`
   - API envelope → `{ data, error, meta }` ([API-Standards.md](../standards/API-Standards.md))
6. **Folder ownership** — Implement only in locations listed in [Module-Map.md](../architecture/Module-Map.md).
7. **Three-surface routing** — Honour [App-Router-Paths.md](../architecture/App-Router-Paths.md): Teaching Frontend, Learner `/account/*`, Admin `/dashboard/*`; never create duplicate URLs or put learner billing/learning under Admin dashboard.
8. **No invented architecture** — If unspecified, extend the relevant MES first.

## Related Documents

- [MSEM](./MSEM.md)
- [Appendix A — Engineering Standards](./MSEM-Appendix-A-Engineering-Standards.md)
- [Cursor System Prompt](./Cursor-System-Prompt.md)
- [Documentation README](../README.md)
