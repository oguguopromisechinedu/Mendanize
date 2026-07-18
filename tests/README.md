# Tests

Production readiness & QA (MES-028 scaffolding, MES-029 verification).

## Structure

- `unit/` — shared components, libs (rate limit, observability, UI states)
- `integration/` — cross-module Shared Service seam checks (MES-029)
- `e2e/` — reserved for browser E2E expansion post-v1.0 approval
- `fixtures/` — shared test data

## Commands

```bash
npm test                 # unit + integration
npm run test:integration
npm run test:watch
npm run smoke            # needs a running server
```

Vitest + Testing Library. CI runs `npm test` on every PR (`.github/workflows/ci.yml`).
