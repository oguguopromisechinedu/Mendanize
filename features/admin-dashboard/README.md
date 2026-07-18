# admin-dashboard

**Implements:** MES-007

**Shared Services:** `settings` (admin nav seed), future `content` / `analytics` / `ai` for live widgets

Auth-gated dashboard shell, grouped navigation, home widget shells, and reusable admin chrome.

## Structure

- `components/` — `DashboardShell`, sidebar, top bar, home widgets, reusable primitives
- `services/` — `loadAdminShell` / `loadDashboardHome` (orchestration only)
- `constants/seed.ts` — placeholder dashboard payload
- `types/` — dashboard home shapes

## How modules plug in

1. Add or update the route under `app/(dashboard)/dashboard/<module>`
2. Ensure the item exists in `services/settings/admin-navigation.ts`
3. Replace `AdminModulePlaceholder` with the feature UI
4. Swap corresponding home widgets in `SEEDED_DASHBOARD_HOME` to real Shared Service reads
