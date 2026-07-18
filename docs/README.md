# Mendanize Engineering Documentation

| Field | Value |
|-------|-------|
| **Version** | 1.1.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-15 |
| **Owner** | Mendanize Platform Architecture |

## Purpose

This directory is the **single source of truth** for the Mendanize platform. Documentation precedes production code.

## Documentation Structure

```
docs/
  README.md                 ← you are here
  ENVIRONMENT.md            ← runtime env (ops)
  DEPLOYMENT.md
  FINAL-DEPLOYMENT-CHECKLIST.md  ← v1.0 go-live checklist
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

  engineering/              ← MES-001 … MES-029 + index
    MES-INDEX.md
    MES-001.md … MES-029.md
```

| Folder | Role |
|--------|------|
| [core/](./core/) | Manifesto, agent prompt, binding project rules |
| [standards/](./standards/) | API, coding, security, database, UI, components, testing |
| [architecture/](./architecture/) | Router paths, module & dependency maps |
| [engineering/](./engineering/) | MES specifications in execution order |

## Document Hierarchy

1. **[core/MSEM.md](./core/MSEM.md)** + **[core/MSEM-Appendix-A-Engineering-Standards.md](./core/MSEM-Appendix-A-Engineering-Standards.md)** + **[core/Project-Rules.md](./core/Project-Rules.md)** — highest authority
2. **[engineering/MES-001.md](./engineering/MES-001.md)** / **[MES-002.md](./engineering/MES-002.md)** — platform & Shared Services
3. **MES-003–MES-029** — feature and surface specs
4. **[standards/](./standards/)** — applied to every implementation
5. **[architecture/](./architecture/)** + ops docs — structural and runtime reality

## How Cursor Must Work

Follow **[core/Cursor-System-Prompt.md](./core/Cursor-System-Prompt.md)**. Then:

1. Read [engineering/MES-INDEX.md](./engineering/MES-INDEX.md)
2. Read [core/Project-Rules.md](./core/Project-Rules.md), [core/MSEM-Appendix-A-Engineering-Standards.md](./core/MSEM-Appendix-A-Engineering-Standards.md), and [engineering/MES-002.md](./engineering/MES-002.md)
3. Read the target MES and its dependencies
4. Confirm [architecture/Module-Map.md](./architecture/Module-Map.md)
5. Implement only in mapped folders — never fork Shared Services

## Single Contracts

| Concern | Document | Location |
|---------|----------|----------|
| Session | [MES-006](./engineering/MES-006.md) | `features/authentication` |
| Recommendations | [MES-018](./engineering/MES-018.md) | `services/recommendations` |
| AI configuration | [MES-020](./engineering/MES-020.md) | `services/settings` |
| API envelope | [API-Standards](./standards/API-Standards.md) | `{ data, error, meta }` |

## Related Documents

- [Cursor System Prompt](./core/Cursor-System-Prompt.md)
- [MES Index](./engineering/MES-INDEX.md)
- [Module Map](./architecture/Module-Map.md)
- [MES-002 completion handoff](./MES-002-COMPLETION.md)
- [MES-003 completion handoff](./MES-003-COMPLETION.md)
- [MES-004 completion handoff](./MES-004-COMPLETION.md)
- [MES-005 completion handoff](./MES-005-COMPLETION.md)
- [MES-006 completion handoff](./MES-006-COMPLETION.md)
- [MES-007 completion handoff](./MES-007-COMPLETION.md)
- [MES-008 completion handoff](./MES-008-COMPLETION.md)
- [MES-009 completion handoff](./MES-009-COMPLETION.md)
- [MES-010 completion handoff](./MES-010-COMPLETION.md)
- [MES-011 completion handoff](./MES-011-COMPLETION.md)
- [MES-012 completion handoff](./MES-012-COMPLETION.md)
- [MES-013 completion handoff](./MES-013-COMPLETION.md)
- [MES-014 completion handoff](./MES-014-COMPLETION.md)
- [MES-015 completion handoff](./MES-015-COMPLETION.md)
- [MES-016 completion handoff](./MES-016-COMPLETION.md)
- [MES-017 completion handoff](./MES-017-COMPLETION.md)
- [MES-018 completion handoff](./MES-018-COMPLETION.md)
- [MES-019 completion handoff](./MES-019-COMPLETION.md)
- [MES-020 completion handoff](./MES-020-COMPLETION.md)
- [MES-021 completion handoff](./MES-021-COMPLETION.md)
- [MES-022 completion handoff](./MES-022-COMPLETION.md)
- [MES-023 completion handoff](./MES-023-COMPLETION.md)
- [MES-024 completion handoff](./MES-024-COMPLETION.md)
- [MES-025 completion handoff](./MES-025-COMPLETION.md)
- [MES-026 completion handoff](./MES-026-COMPLETION.md)
- [MES-027 completion handoff](./MES-027-COMPLETION.md)
- [MES-028 completion handoff](./MES-028-COMPLETION.md)
- [MES-029 completion / v1.0 Production Readiness Report](./MES-029-COMPLETION.md)

## Ops & contributor docs

- [Environment](./ENVIRONMENT.md)
- [Deployment](./DEPLOYMENT.md)
- [Final deployment checklist (v1.0)](./FINAL-DEPLOYMENT-CHECKLIST.md)
- [Launch checklist](./LAUNCH-CHECKLIST.md)
- [Administrator guide](./ADMINISTRATOR.md)
- [Contributor guide](./CONTRIBUTING.md)
