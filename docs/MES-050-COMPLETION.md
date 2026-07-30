# MES-050 PWA & Offline Learning Basics — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-29 |
| **Next** | See [MES-DOCUMENTS-STATUS](./MES-DOCUMENTS-STATUS.md) for remaining partial work |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Manifest | `app/manifest.ts` — learner-focused `start_url: /account`, standalone display |
| Service worker | `public/sw.js` — shell cache, learning-path cache, offline fallback |
| Offline storage | `lib/pwa/offline-storage.ts` — IndexedDB for HTML snapshots (max 25 items) |
| PWA shell | `components/pwa/pwa-shell.tsx` — SW registration + install prompt |
| Offline fallback | `/offline` (public) |
| Offline library | `/account/offline` — learner library of cached content |
| Icons | `public/icons/icon-192.png`, `icon-512.png` |

## Cache strategy

| Layer | Strategy | Scope |
|-------|----------|-------|
| Shell | Precache on install | `/offline`, icons |
| Static assets | Cache-first | `/_next/static/*`, `/icons/*` |
| Learning paths | Network-first, cache on success | `/articles/*`, `/guides/*/lessons/*`, account mirrors |
| Navigation | Network-first → cached page → `/offline` | All other learner/public routes |
| IndexedDB | Snapshot HTML on view (1.5s delay) | Recently viewed articles/lessons |

**Excluded:** `/dashboard/*` and `/api/auth/*` are never cached or registered for install targeting.

## Install prompt UX

- Listens for `beforeinstallprompt`, shows a single dismissible banner
- Dismissed state stored in localStorage for 14 days
- Not mounted on `/dashboard/*`

## Known offline limitations

- Only **text content** of recently viewed articles/lessons is cached (HTML snapshot in IndexedDB)
- Featured images, videos, Ask widget, and recommendations require connectivity
- Auth uses existing cookie sessions — no offline sign-in
- Push notifications deferred (phase-1b, requires MES-024 web-push provider)
- Admin dashboard intentionally excluded from PWA scope
- IndexedDB quota varies by browser; oldest entries evicted at 25 items

## Dual-auth preserved

Cookie sessions unchanged. Service worker and install prompt only register on public and account (`/account/*`) surfaces — not `/dashboard/*`.

## STOP

Native apps remain out of sequence. PWA layer is complete for learner installability and basic offline reading.
