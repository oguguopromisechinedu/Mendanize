# HTTP API layout (MES-002)

## Canonical surfaces

| Prefix | Access | Role |
|--------|--------|------|
| `/api/public/*` | No auth (+ rate limit) | Read-oriented Teaching Frontend APIs |
| `/api/dashboard/*` | Session + role (MES-006) | Authenticated dashboard APIs |
| `/api/auth/*` | NextAuth / registration | Canonical session endpoints (MES-006) |

Response envelope for public + dashboard routes: `{ data, error, meta }` — see `types/api.ts` and `lib/api/response.ts`.

All routes under `/api/public/*` and `/api/dashboard/*` are implemented Shared Service seams (no `501 NOT_IMPLEMENTED` placeholders).

### Dashboard admin modules

| Route | Auth | Notes |
|-------|------|-------|
| `/api/dashboard/users` | Admin | List + PATCH role |
| `/api/dashboard/subscribers` | Editor | List / create / delete |
| `/api/dashboard/workflow` | Editor | Publishing queue + PATCH status |
| `/api/dashboard/automation` | Admin | Jobs list / toggle / run |
| `/api/dashboard/tags` | Editor | Tag vocabulary CRUD |
| `/api/dashboard/comments` | Editor | Moderation queue |
| `/api/dashboard/pages` | Editor | Static pages CRUD |
| `/api/dashboard/newsletter` | Editor | Campaigns + send |
| `/api/dashboard/broken-links` | Editor | Scan + status updates |
| `/api/dashboard/activity-log` | Editor | Audit trail |
| `/api/dashboard/knowledge-base` | Editor | Internal playbooks |
| `/api/dashboard/integrations` | Editor | Provider / settings status |

## Legacy routes (do not extend)

These predate the MES-002 split. Keep working until the owning MES migrates them into `/api/public` or `/api/dashboard` (or Shared Services):

- `/api/generate` — legacy AI generation
- `/api/ai/*` — legacy AI tool/chat helpers
- Inline non-envelope responses in older auth helpers (migrate to envelope when touching MES-006)

Do **not** add new product features under these legacy paths.
