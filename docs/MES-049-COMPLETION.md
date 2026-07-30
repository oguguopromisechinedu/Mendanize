# MES-049 Recommendations ML Upgrade — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-29 |
| **Next** | [MES-050 — PWA & Offline Learning Basics](./engineering/MES-050.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Facade | `services/recommendations` — **unchanged** public API; all consumers still import MES-018 only |
| ML scoring | `services/recommendations/ml-scoring.ts` — shadow/canary/default model registry + HTTP scoring |
| Schema | `RecommendationModel` (model registry), `RecommendationClick` (click-through metrics) |
| Migration | `20260729060000_mes049_recommendations_ml` |
| Admin UI | `/dashboard/recommendations/ml` — model CRUD + quality dashboard |

## Rollout lifecycle

1. **Shadow** — model is scored in the background, results discarded. For offline comparison only.
2. **Canary** — deterministic session-hash bucketing at `rolloutPercent`. Only bucketed users see model scores.
3. **Default** — all users get model-ranked results. Only one DEFAULT model at a time.
4. **Disabled** — instant rollback switch; zeroes rollout and reverts to rules.

## Fallback guarantee

If a model endpoint is unreachable, times out (configurable, default 2s), or returns invalid data, the rules-based MES-018 path remains authoritative. No user-facing degradation.

## Quality dashboard

Click-through proxy metrics under `/dashboard/recommendations/ml`:
- Total clicks, rules-scored vs model-scored split
- Average click position
- Daily click trend (30-day window)

## Model host documentation

The `RecommendationModel.endpoint` field accepts any HTTP POST endpoint that returns `{ scores: [{ entityId, score }] }`. This supports:
- **In-house** — self-hosted model behind an internal URL
- **Vendor** — managed ML service (e.g. AWS SageMaker, GCP Vertex) with API key in `configJson`

The rollback switch (`disableRecommendationModel`) instantly sets status to DISABLED and rollout to 0%.

## Privacy

No raw PII is sent to model endpoints. Only pseudonymous user IDs, entity IDs, and numeric scores are transmitted (MES-035 compatible).

## STOP

Ready for **MES-050**. Do not start PWA & Offline until requested.
