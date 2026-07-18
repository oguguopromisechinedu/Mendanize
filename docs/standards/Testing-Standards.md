# Testing Standards

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-15 |
| **Owner** | Mendanize Platform Architecture |

## Purpose

Define the minimum testing expectations for Shared Services, features, APIs, and launch gates (MES-028 / MES-029).

## Scope

Unit, integration, and end-to-end tests under `tests/`; CI expectations; what must be covered before production.

## Dependencies

- [../core/Project-Rules.md](../core/Project-Rules.md)
- [../engineering/MES-028.md](../engineering/MES-028.md)
- [../engineering/MES-029.md](../engineering/MES-029.md)
- [Security-Standards.md](./Security-Standards.md)
- [API-Standards.md](./API-Standards.md)

## Pyramid

| Layer | Location | Focus |
|-------|----------|--------|
| Unit | `tests/unit` | Shared Services, validators, pure utils |
| Integration | `tests/integration` | Auth, billing webhooks, API contracts |
| E2E | `tests/e2e` | Public browse smoke + auth dashboard smoke |

## Rules

1. Shared Services require unit tests for primary happy-path and failure contracts.
2. Auth and billing changes require integration coverage.
3. API handlers must assert the `{ data, error, meta }` envelope on success and failure.
4. E2E smoke for launch (MES-029): home, article, guide, tool, search, pricing, sign-in, articles CMS, settings.
5. Do not test implementation trivia; test behaviour and contracts.
6. Flaky tests are release blockers — quarantine or fix before merge to main.

## Implementation Notes

- Prefer deterministic fixtures in `tests/fixtures`.
- Mock AI providers in unit/integration; use sandboxed keys for limited e2e if needed.
- CI must run lint, typecheck, and tests before deploy ([../DEPLOYMENT.md](../DEPLOYMENT.md)).

## Related Documents

- [MES-028 Production Readiness](../engineering/MES-028.md)
- [MES-029 Final QA](../engineering/MES-029.md)
- [API Standards](./API-Standards.md)
