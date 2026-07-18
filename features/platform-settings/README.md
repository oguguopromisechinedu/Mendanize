# platform-settings

**Implements:** MES-020

**Shared Services:** `settings`, `ai`

ONLY AI-configuration and platform settings storage location. Backed by services/settings.

## Structure

- `components/` — feature UI
- `hooks/` — feature hooks
- `services/` — feature-local orchestration only (calls `/services/`, does not duplicate Shared Services)
- `actions/` — server actions
- `types/`, `validators/`, `utils/`, `constants/`
