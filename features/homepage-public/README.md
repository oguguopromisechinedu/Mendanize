# homepage-public

**Implements:** MES-005

**Shared Services:** `content`, `recommendations`, `media`, `seo`

Public premium homepage experience. CMS editing is homepage-management (MES-013).

## Structure

- `components/` — feature UI
- `hooks/` — feature hooks
- `services/` — feature-local orchestration only (calls `/services/`, does not duplicate Shared Services)
- `actions/` — server actions
- `types/`, `validators/`, `utils/`, `constants/`
