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
2. **Spec order** — Follow [MES-INDEX.md](../engineering/MES-INDEX.md). Do not skip dependencies.
3. **Appendix A is binding** — Every MES follows [MSEM-Appendix-A-Engineering-Standards.md](./MSEM-Appendix-A-Engineering-Standards.md) unless it states an explicit exception.
4. **Shared Services stay shared** — Content, Recommendations, AI, Search, Notification, SEO, Media, Settings live only under `/services`.
5. **Single contracts**
   - Session → MES-006 / `features/authentication`
   - Recommendations → MES-018 / `services/recommendations`
   - AI configuration → MES-020 / `services/settings`
   - API envelope → `{ data, error, meta }` ([API-Standards.md](../standards/API-Standards.md))
6. **Folder ownership** — Implement only in locations listed in [Module-Map.md](../architecture/Module-Map.md).
7. **Two-surface routing** — Honour [App-Router-Paths.md](../architecture/App-Router-Paths.md); never create duplicate URLs across `(public)` and `(dashboard)`.
8. **No invented architecture** — If unspecified, extend the relevant MES first.

## Related Documents

- [MSEM](./MSEM.md)
- [Appendix A — Engineering Standards](./MSEM-Appendix-A-Engineering-Standards.md)
- [Cursor System Prompt](./Cursor-System-Prompt.md)
- [Documentation README](../README.md)
