# Coding Standards

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-14 |
| **Owner** | Mendanize Platform Architecture |


## Purpose

Define coding conventions for TypeScript/React/Next.js in the Mendanize repository so modules remain consistent and reviewable.


## Scope

Language style, folder ownership, naming, imports, testing expectations, and documentation touch rules.


## Dependencies

- [MSEM-Appendix-A-Engineering-Standards.md](../core/MSEM-Appendix-A-Engineering-Standards.md)
- [API-STANDARDS.md](./API-Standards.md)
- [MODULE-MAP.md](../architecture/Module-Map.md)


## Rules

1. **TypeScript strict** — no `any` without justification.
2. **Feature ownership** — new UI/business code lands in the mapped `features/*` folder.
3. **Shared Services** — cross-feature logic lands in `services/*`, never copied.
4. **Thin routes** — `app/**/page.tsx` and `route.ts` compose features/services.
5. **Validators** — colocate Zod schemas in `features/*/validators` or shared `validators/`.
6. **Naming** — kebab-case folders; PascalCase components; camelCase functions.
7. **Server vs client** — default to Server Components; `"use client"` only when needed.
8. **Docs sync** — architectural behaviour changes update the relevant MES in the same PR when practical.
9. **No drive-by refactors** outside the task scope.
10. **Read Next.js docs in `node_modules/next/dist/docs/`** before using APIs that may differ from training data (see root `AGENTS.md`).


## Implementation Notes

- Prefer `@/` path aliases.
- Avoid `useMemo`/`useCallback` by default unless profiling or existing patterns require them (React Compiler guidance).
- ESLint + Prettier/repo formatting must pass in CI.


## Related Documents

- [Appendix A](../core/MSEM-Appendix-A-Engineering-Standards.md)
- [Design System](../engineering/MES-003.md)
- [Module Map](../architecture/Module-Map.md)
