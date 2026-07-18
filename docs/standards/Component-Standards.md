# Component Standards

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-15 |
| **Owner** | Mendanize Platform Architecture |

## Purpose

Define where UI components live, how they are composed, and what may not be duplicated across features.

## Scope

`components/ui` primitives, `components/layout` shells, `components/shared` composites, and `features/*/components` feature-specific UI.

## Dependencies

- [UI-Standards.md](./UI-Standards.md)
- [Coding-Standards.md](./Coding-Standards.md)
- [../core/Project-Rules.md](../core/Project-Rules.md)
- [../engineering/MES-003.md](../engineering/MES-003.md)

## Ownership

| Layer | Location | Allowed contents |
|-------|----------|------------------|
| Primitives | `components/ui` | Button, Input, Dialog, etc. |
| Layout | `components/layout` | Public/Dashboard shells, nav chrome |
| Shared | `components/shared` | Cross-feature presentational pieces |
| Feature | `features/*/components` | Domain UI that composes primitives |

## Rules

1. Features compose primitives — they do not invent a second button/input system.
2. No Prisma or Shared Service calls inside presentational components; data enters via props or server containers.
3. Mark client components with `"use client"` only when required.
4. Prefer accessible Radix/shadcn-style primitives already in the repo over one-off controls.
5. Keep prop APIs typed; avoid `any`.
6. Story/demo coverage is encouraged for primitives; not required for every feature leaf.

## Implementation Notes

- Before adding a primitive, search `components/ui` for an existing match.
- Feature READMEs should not claim Shared Service ownership of visual primitives.

## Related Documents

- [UI Standards](./UI-Standards.md)
- [Coding Standards](./Coding-Standards.md)
- [Module Map](../architecture/Module-Map.md)
