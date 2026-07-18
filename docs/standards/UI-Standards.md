# UI Standards

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-15 |
| **Owner** | Mendanize Platform Architecture |

## Purpose

Define cross-surface UI expectations for the Teaching Frontend and Dashboard that are not specific to a single component primitive.

## Scope

Layout shells, spacing, typography application, motion, accessibility presentation, and admin-configurable visual defaults (see MES-001 Design Customization Principle). Visual tokens and primitives also reference MES-003.

## Dependencies

- [../core/Project-Rules.md](../core/Project-Rules.md)
- [../engineering/MES-003.md](../engineering/MES-003.md)
- [Component-Standards.md](./Component-Standards.md)
- [Coding-Standards.md](./Coding-Standards.md)

## Standards

1. **Two shells, one system** — Public and dashboard share tokens; they use distinct layout shells (`components/layout`).
2. **Clarity over decoration** — Prefer readable hierarchy and generous spacing on learning surfaces.
3. **Motion budget** — Intentional, limited animations; honour `prefers-reduced-motion`.
4. **Accessibility** — WCAG 2.2 AA targets for focus, contrast, landmarks, and keyboard use.
5. **Configurable look, fixed behaviour** — Appearance may be settings-driven (MES-020 / design settings); interaction contracts are not.
6. **No hero cards** on the premium homepage first viewport (MES-005).
7. **Responsive by default** — Mobile and desktop are first-class; do not ship desktop-only layouts.

## Implementation Notes

- Tokens live in `styles/` and theme mapping; do not hard-code ad-hoc hex values in features when a token exists.
- Dashboard prioritizes density and keyboard efficiency; public prioritizes brand composition and readability.
- Defer primitive API details to [Component-Standards.md](./Component-Standards.md).

## Related Documents

- [Component Standards](./Component-Standards.md)
- [MES-003 Design System](../engineering/MES-003.md)
- [MES-005 Premium Homepage](../engineering/MES-005.md)
