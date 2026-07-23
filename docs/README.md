# Mendanize Engineering Documentation

| Field | Value |
|-------|-------|
| **Version** | 1.2.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-23 |
| **Owner** | Mendanize Platform Architecture |

## Purpose

This directory is the **single source of truth** for the Mendanize platform. Documentation precedes production code.

## Documentation Structure

```
docs/
  README.md                 ← you are here
  MES-DOCUMENTS-STATUS.md   ← implementation status of every MES
  ENVIRONMENT.md            ← runtime env (ops)
  DEPLOYMENT.md
  FINAL-DEPLOYMENT-CHECKLIST.md
  LAUNCH-CHECKLIST.md
  CHANGELOG.md

  core/                     ← governance
    MSEM.md
    Cursor-System-Prompt.md
    Project-Rules.md
    MSEM-Appendix-A-Engineering-Standards.md

  standards/                ← cross-cutting contracts
    API-Standards.md
    Coding-Standards.md
    Security-Standards.md
    Database.md
    UI-Standards.md
    Component-Standards.md
    Testing-Standards.md

  architecture/             ← structure maps
    App-Router-Paths.md
    Module-Map.md
    Dependency-Map.md
    MES-Module-Map.md

  engineering/              ← MES-001 … MES-035 + index
    MES-INDEX.md
    MES-001.md … MES-035.md

  reports/                  ← audit / roadmap (evidence-based)
```

| Folder | Role |
|--------|------|
| [core/](./core/) | Manifesto, agent prompt, binding project rules |
| [standards/](./standards/) | API, coding, security, database, UI, components, testing |
| [architecture/](./architecture/) | Router paths, module & dependency maps |
| [engineering/](./engineering/) | MES specifications in execution order (through MES-035) |
| [reports/](./reports/) | Audit verdicts and implementation roadmap |

## Document Hierarchy

1. **[core/MSEM.md](./core/MSEM.md)** + **[core/MSEM-Appendix-A-Engineering-Standards.md](./core/MSEM-Appendix-A-Engineering-Standards.md)** + **[core/Project-Rules.md](./core/Project-Rules.md)** — highest authority
2. **[engineering/MES-INDEX.md](./engineering/MES-INDEX.md)** — master sequence (v1.5: MES-001 → MES-035)
3. **[engineering/MES-001.md](./engineering/MES-001.md)** / **[MES-002.md](./engineering/MES-002.md)** — platform & Shared Services
4. **MES-003–MES-035** — feature, surface, retrofit, and launch specs (see index)
5. **[standards/](./standards/)** — applied to every implementation
6. **[architecture/](./architecture/)** + ops docs — structural and runtime reality
7. **[MES-DOCUMENTS-STATUS.md](./MES-DOCUMENTS-STATUS.md)** — which specs are implemented vs pending

## How Cursor / contributors must work

Follow **[core/Cursor-System-Prompt.md](./core/Cursor-System-Prompt.md)**. Then:

1. Read [engineering/MES-INDEX.md](./engineering/MES-INDEX.md) (current sequence through **MES-035**)
2. Read [MES-DOCUMENTS-STATUS.md](./MES-DOCUMENTS-STATUS.md) — know what is done vs next
3. Read [core/Project-Rules.md](./core/Project-Rules.md), [core/MSEM-Appendix-A-Engineering-Standards.md](./core/MSEM-Appendix-A-Engineering-Standards.md), and [engineering/MES-002.md](./engineering/MES-002.md)
4. Read the **target MES** and its **dependencies** (do not skip)
5. Confirm [architecture/Module-Map.md](./architecture/Module-Map.md) and [architecture/App-Router-Paths.md](./architecture/App-Router-Paths.md)
6. Implement only in mapped folders — never fork Shared Services
7. Satisfy the MES **ACCEPTANCE CRITERIA**, honour **WHAT NOT TO BUILD**, then **STOP** and wait for approval before the next MES

## Three surfaces (MES-001 v3.0 / MES-030)

| Surface | Who | URL root |
|---------|-----|----------|
| Teaching Frontend | Anyone | `app/(public)` → `/`, `/articles`, … |
| Learner Account | `PublicUser` | `/account/*` (billing, learning, profile) |
| Admin Dashboard | `Admin` only | `/dashboard/*`, `/ai-studio`, … |

Never put learner billing/learning under Admin-only `/dashboard/*`.

## Single Contracts

| Concern | Document | Location |
|---------|----------|----------|
| Session | [MES-006](./engineering/MES-006.md) / [MES-030](./engineering/MES-030.md) | `features/authentication` |
| Recommendations | [MES-018](./engineering/MES-018.md) | `services/recommendations` |
| AI configuration | [MES-020](./engineering/MES-020.md) | `services/settings` |
| API envelope | [API-Standards](./standards/API-Standards.md) | `{ data, error, meta }` |

## Related Documents

- [Cursor System Prompt](./core/Cursor-System-Prompt.md)
- [MES Index](./engineering/MES-INDEX.md)
- [MES Documents Status](./MES-DOCUMENTS-STATUS.md)
- [Module Map](./architecture/Module-Map.md)
- Completion handoffs: [MES-002](./MES-002-COMPLETION.md) … [MES-029](./MES-029-COMPLETION.md) (MES-030–035 handoffs are created when that MES is completed)
- [Audit reports](./reports/README.md)

## Ops & contributor docs

- [Environment](./ENVIRONMENT.md)
- [Deployment](./DEPLOYMENT.md)
- [Final deployment checklist (v1.0)](./FINAL-DEPLOYMENT-CHECKLIST.md)
- [Launch checklist](./LAUNCH-CHECKLIST.md)
- [Administrator guide](./ADMINISTRATOR.md)
- [Contributor guide](./CONTRIBUTING.md)
