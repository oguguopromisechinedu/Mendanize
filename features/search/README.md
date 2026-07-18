# search

**Implements:** MES-017

**Shared Services:** `search`, `recommendations`, `content`

Search & discovery UI. Recommendations come from services/recommendations (MES-018) — do not duplicate.

## Structure

- `components/` — feature UI
- `hooks/` — feature hooks
- `services/` — feature-local orchestration only (calls `/services/`, does not duplicate Shared Services)
- `actions/` — server actions
- `types/`, `validators/`, `utils/`, `constants/`
