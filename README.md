# Mendanize

AI-powered technology learning platform with two surfaces:

1. **Teaching Frontend** (`app/(public)`) — Learn / Discover / Explore (public)
2. **Dashboard** (`app/(dashboard)`) — Practice / Ask / Administer (auth-gated)

## Source of truth

Engineering docs live under [`docs/`](./docs/README.md). Start with:

- [Cursor System Prompt](./docs/core/Cursor-System-Prompt.md)
- [MES Index](./docs/engineering/MES-INDEX.md) — implement specs in order (MES-001 → MES-029)
- [Module Map](./docs/architecture/Module-Map.md)
- [App Router Paths](./docs/architecture/App-Router-Paths.md)

## Tech stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui
- **Data:** PostgreSQL via Prisma (Supabase-hosted DB supported)
- **Auth:** NextAuth (session owner: MES-006 / `features/authentication`)
- **AI:** Multi-provider via `services/ai` (wiring lands in later MES specs)
- **API contract:** `{ data, error, meta }` — see [API Standards](./docs/standards/API-Standards.md)

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment

See [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md) and `.env.example`. Typical keys:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (when using Supabase)
- `OPENAI_API_KEY` (and other provider keys as features land)
