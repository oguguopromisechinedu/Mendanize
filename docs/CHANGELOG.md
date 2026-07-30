# Documentation Changelog

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-14 |
| **Owner** | Mendanize Platform Architecture |


## Purpose

Record versioned changes to the Mendanize engineering documentation set.


## Scope

Docs-only history. Application release notes may mirror entries when behaviour lands.


## Dependencies

- [README.md](./README.md)
- [MES-INDEX.md](./engineering/MES-INDEX.md)


## Releases

### 2.1.4 — 2026-07-29 (MES-045 Community Events)

#### Added
- [MES-045-COMPLETION](./MES-045-COMPLETION.md) — `/community/events`, RSVP, Admin publish, search index

#### Changed
- [MES-DOCUMENTS-STATUS.md](./MES-DOCUMENTS-STATUS.md) v1.10 — MES-045 **Complete**; next **MES-046**

### 2.1.3 — 2026-07-28 (MES-044 Coding Workspace Execution)

#### Added
- [MES-044-COMPLETION](./MES-044-COMPLETION.md) — QuickJS WASM JS sandbox, kill switch, tier rate limits

#### Changed
- [MES-DOCUMENTS-STATUS.md](./MES-DOCUMENTS-STATUS.md) v1.9 — MES-044 **Complete**; next **MES-045**

### 2.1.2 — 2026-07-28 (MES-043 Learner Messaging)

#### Added
- [MES-043-COMPLETION](./MES-043-COMPLETION.md) — `/account/messages` DMs + `/dashboard/community/messages` reports

#### Changed
- [MES-DOCUMENTS-STATUS.md](./MES-DOCUMENTS-STATUS.md) v1.8 — MES-043 **Complete**; next **MES-044**

### 2.1.1 — 2026-07-28 (MES-041 / 042 / 051 handoffs)

#### Added
- [MES-041-COMPLETION](./MES-041-COMPLETION.md), [MES-042-COMPLETION](./MES-042-COMPLETION.md), [MES-051-COMPLETION](./MES-051-COMPLETION.md)

#### Changed
- [MES-DOCUMENTS-STATUS.md](./MES-DOCUMENTS-STATUS.md) v1.7 — MES-041, 042, 051 **Complete**; next **MES-043**

### 2.1.0 — 2026-07-28 (MES-001 → MES-051 governance + EMS)

#### Added
- [MES-041](./engineering/MES-041.md) … [MES-051](./engineering/MES-051.md) (next-phase specs; EMS = MES-051)
- MES-INDEX **v2.1** covers full sequence through MES-051

#### Changed
- [README.md](./README.md), [Cursor-System-Prompt.md](./core/Cursor-System-Prompt.md), [Project-Rules.md](./core/Project-Rules.md), [CONTRIBUTING.md](./CONTRIBUTING.md) — agents must read **MES-001 → MES-051** and follow [MES-DOCUMENTS-STATUS.md](./MES-DOCUMENTS-STATUS.md) **one MES at a time**
- Architecture maps updated for MES-036–051 ownership
- Status board v1.6 lists 041–051 as Specified; recommended order 041 → 042 → 051 → 043–050

### 1.3.0 — 2026-07-23 (MES-030–035 implementation handoffs)

#### Added
- Completion handoffs: [MES-030](./MES-030-COMPLETION.md) … [MES-035](./MES-035-COMPLETION.md)
- Restore runbook: [docs/runbooks/restore.md](./runbooks/restore.md)

#### Changed
- [MES-DOCUMENTS-STATUS.md](./MES-DOCUMENTS-STATUS.md) marks MES-030–035 **Complete** (MVP / process)

### 1.2.0 — 2026-07-23 (Doc system connected through MES-035)

#### Changed
- Linked governance, maps, status, and contributor/agent prompts to **MES-INDEX v1.5** (MES-001 → MES-035)
- [MES-DOCUMENTS-STATUS.md](./MES-DOCUMENTS-STATUS.md) is now the operational next-MES board
- Architecture maps + App Router paths reflect three surfaces and MES-030–035 ownership
- Root README, CONTRIBUTING, Cursor System Prompt, Project Rules, MSEM thesis aligned

#### Notes
- No MES-030–035 product code in this docs pass — status marks 030 Partial / 031–035 Specified|Process
- Audit reports under `docs/reports/` still evidence MES-001–029; status board covers the rest until audits refresh

### 1.1.0 — 2026-07-15 (Mendanize platform v1.0 freeze)

#### Added
- MES-002–029 completion handoffs; **MES-029 v1.0 Production Readiness Report**
- CI workflow (`.github/workflows/ci.yml`), launch/smoke checklist, admin & contributor guides
- Integration seam tests + `npm run smoke`

#### Notes
- Development stopped pending approval per MES-029 FINAL INSTRUCTION.
- Post-v1.0 items listed in `docs/MES-029-COMPLETION.md` §7.

### 1.0.0 — 2026-07-14

#### Added
- Complete Phase 1 documentation system under `docs/`
- MSEM + Appendix A binding standards
- MES-001 through MES-029 module specifications
- Cross-cutting standards: API, Security, Coding, Database, Environment, Deployment
- Maps: Module, Dependency, App Router Paths
- Documentation README and MES Index

#### Notes
- Application feature implementation is intentionally out of scope for this release of the docs set.
- Prior scaffold notes (`MES-DOCUMENTS-STATUS.md`, older `MES-MODULE-MAP.md`) are superseded by this Phase 1 pack.


## Implementation Notes

When changing a MES, bump its Version field and add a dated entry here describing why.


## Related Documents

- [Documentation README](./README.md)
- [MES Index](./engineering/MES-INDEX.md)
