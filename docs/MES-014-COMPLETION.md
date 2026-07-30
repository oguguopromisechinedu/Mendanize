# MES-014 Media Library — completion handoff (updated)

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 (storage upgrade 2026-07-29) |
| **Next** | [MES-015 — SEO Center](./engineering/MES-015.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature | `features/media-library` |
| Shared Service | `services/media` |
| Models | `MediaAsset`, `MediaCategory`, `MediaCollection`, `MediaTag`, `MediaUsage`, enums `AssetStatus`, `MediaVisibility` |
| Migration | `20260715200000_mes014_media_library` |
| Storage | **Supabase Storage** bucket `media` when `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set; URL paste fallback for external assets |
| Picker API | `GET /api/dashboard/media` |

## Storage (MES-014 closeout)

- Drag-drop uploads read files as base64 client-side and upload via `uploadMediaAction`
- `uploadAsset` writes to Supabase Storage at `uploads/{timestamp}-{slug}` with `storageProvider: supabase`
- `deleteAssets` removes Supabase objects when `storageProvider === "supabase"`
- File-byte uploads fail clearly when Supabase is unavailable (no silent picsum placeholder)

### Supabase setup

1. Create a **public** bucket named `media` in Supabase Storage
2. Set env vars: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Surfaces (`/dashboard/media`)

- Library (grid/list, search, multi-select, bulk archive/delete/move)
- Upload (drag-drop queue with cancel/retry, URL paste)
- Asset details (metadata, category, collections, tags, visibility, featured)
- Collections & Categories CRUD
- Recently uploaded / Unused assets
- **MediaPicker** reusable component

## How modules reuse it

| Module | Integration |
|--------|-------------|
| **Articles / Guides / AI Tools** | `MediaPicker` for featured/cover/logo |
| **Homepage** | Can pick hero image URLs via library assets |
| **AI Studio (MES-011)** | `acceptGeneratedImage` persists into Media Library |
| **Categories / Topics** | Picker available for taxonomy images |

## Security

MIME allowlist on upload; staff-gated actions (`requireEditor`); no direct filesystem paths exposed.

## STOP

Media Library storage gap closed. Status: **Complete**.
