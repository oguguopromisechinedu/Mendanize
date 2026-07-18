# recommendations

**Implements:** MES-018

**Shared Services:** `recommendations` only — never duplicate ranking.

## Structure

- `components/RecommendationsRail` — reusable related / for-you UI
- `services/` — orchestration → `services/recommendations`
- Interest/saved writes belong to Personalization (MES-022)
