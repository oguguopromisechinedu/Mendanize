# Styles (MES-003)

| File | Role |
|------|------|
| [`tokens.css`](./tokens.css) | CSS custom properties — colors, type roles, spacing, radius, motion, z-index |
| Wired from | `app/globals.css` via `@import "../styles/tokens.css"` |
| TS seed source | `services/settings/design-tokens.ts` (`getDesignTokens`) |

## Palette (seed)

- Ink dark background: `#0D0D0D`
- Amber accent/primary: `#E8940C`
- Fonts: Bricolage Grotesque (display) + Instrument Sans (body)

Do not introduce competing token files under features. Admin overrides land via Settings Service (MES-020).
