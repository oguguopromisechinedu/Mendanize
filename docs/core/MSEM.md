# Mendanize Software Engineering Manifesto (MSEM)

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-14 |
| **Owner** | Mendanize Platform Architecture |


## Purpose

Establish the governing principles for how Mendanize is designed, built, tested, and evolved. MSEM is the parent of all MES documents.


## Scope

Applies to every engineer, agent, and contractor contributing to the Mendanize monorepo. Detailed engineering standards live in [MSEM-Appendix-A-Engineering-Standards.md](./MSEM-Appendix-A-Engineering-Standards.md). Process rules live in [Project-Rules.md](./Project-Rules.md).


## Dependencies

None — this document is foundational. All MES documents depend on MSEM and Appendix A.


## Platform Thesis

Mendanize is an AI-native learning and content platform with **three** primary surfaces (MES-001 v3.0 / MES-030):

1. **Teaching Frontend (public)** — Learn / Discover / Explore without requiring authentication.
2. **Learner Account Area (`/account/*`)** — billing, learning, profile for signed-in `PublicUser` learners.
3. **Admin Dashboard (`/dashboard/*`)** — Create / Administer — **Admin-only** (never learner billing/learning).

These surfaces share data and Shared Services but intentionally separate routing, layouts, and permission boundaries.


## Core Principles

1. **Specification first** — Documentation in `docs/` precedes production code.
2. **Shared Services over duplication** — Cross-cutting capabilities are implemented once under `/services`.
3. **Feature modules orchestrate** — `/features/*` may orchestrate Shared Services; they must not fork them.
4. **Single contracts** — One API shape, one session model, one recommendations engine, one AI-configuration store.
5. **Security by default** — AuthZ checks at the edge of every dashboard API and server action.
6. **Accessibility and SEO are product features** — not optional polish.
7. **Observability is mandatory** before production (MES-028).
8. **Prefer clarity over cleverness** in folder structure and naming.


## Governance

- Architectural changes that alter Shared Service boundaries require an MES update before merge.
- Breaking API contract changes require version notes in [API-STANDARDS.md](../standards/API-Standards.md) and [CHANGELOG.md](../CHANGELOG.md).
- Appendix A is binding on every feature scaffold and pull request review.


## Implementation Notes

- Stack baseline: Next.js App Router, React, TypeScript, Prisma, PostgreSQL (Supabase), Auth.js/NextAuth, Stripe, multi-provider AI clients.
- Folder ownership is fixed in [MODULE-MAP.md](../architecture/Module-Map.md).
- Agents must refuse feature work that contradicts MSEM or Appendix A.


## Related Documents

- [Appendix A — Engineering Standards](./MSEM-Appendix-A-Engineering-Standards.md)
- [Project Rules](./Project-Rules.md)
- [MES Index](../engineering/MES-INDEX.md)
- [Coding Standards](../standards/Coding-Standards.md)
