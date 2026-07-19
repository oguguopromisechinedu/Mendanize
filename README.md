# Mendanize

> AI-powered technology learning and content platform built on Next.js, Prisma, and PostgreSQL.

Mendanize is an AI-native learning platform with two primary surfaces that share data and
Shared Services but keep separate routing, layouts, and permission boundaries.

| Field | Value |
|-------|-------|
| **Status** | v1.0 — production release |
| **Stack** | Next.js 16 (App Router) · React 19 · TypeScript · Prisma 7 · PostgreSQL · NextAuth v5 |
| **AI (v1.0)** | OpenAI only (multi-provider seam reserved) |
| **Source of truth** | [`docs/`](./docs/README.md) — specs precede code |

---

## Table of contents

- [Platform overview](#platform-overview)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Folder structure](#folder-structure)
- [Module overview](#module-overview)
- [Setup instructions](#setup-instructions)
- [Environment variables](#environment-variables)
- [Development workflow](#development-workflow)
- [Coding standards](#coding-standards)
- [Deployment guide](#deployment-guide)
- [MES / MSEM references](#mes--msem-references)
- [Roadmap](#roadmap)
- [Contribution guide](#contribution-guide)
- [Troubleshooting](#troubleshooting)

---

## Platform overview

Mendanize serves two audiences from one application:

1. **Teaching Frontend** (`app/(public)`) — public **Learn / Discover / Explore** experience.
   Articles, learning guides, categories/topics, an AI tools directory, and a contextual
   "Ask Mendanize" widget. No authentication required. SEO and accessibility are treated as
   product features.
2. **Dashboard** (`app/(dashboard)`) — authenticated **Practice / Ask / Create / Administer**
   surface for signed-in users and operators. Includes the AI Studio, content management
   (articles, guides, media, categories), SEO center, navigation manager, analytics,
   settings, and billing.

Authentication flows live in a third route group, `app/(auth)`.

The platform thesis and governing principles are defined in the
[Mendanize Software Engineering Manifesto (MSEM)](./docs/core/MSEM.md).

---

## Architecture

Mendanize is a single Next.js (App Router) application organized in layers. Dependencies
flow inward — lower layers never import from higher ones.

```
┌──────────────────────────────────────────────────────────────────┐
│  app/*            Route surfaces & API handlers (thin)             │
│  ├── (public)     Teaching frontend  ── (auth)   Sign-in/up flows  │
│  ├── (dashboard)  Authenticated app                                │
│  └── api/*        Route handlers → { data, error, meta } envelope  │
└───────────────────────────────┬──────────────────────────────────┘
                                 │ render / call
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│  features/*       Feature modules: UI + server actions + orchestration
└───────────────────────────────┬──────────────────────────────────┘
                                 │ orchestrate (never fork)
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│  services/*       Shared Services: reusable domain logic           │
│                   (single owner: ai, content, search, seo, …)      │
└───────────────────────────────┬──────────────────────────────────┘
                                 │ read / write
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│  repositories/*   Data-access boundaries                           │
└───────────────────────────────┬──────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│  lib/*  +  prisma/   Prisma client, API helpers, utilities         │
│                      PostgreSQL (Supabase-hosted supported)        │
└──────────────────────────────────────────────────────────────────┘

Cross-cutting: middleware/ (edge/request), config/ (runtime config),
validators/ (Zod), components/ (shared UI), providers|contexts|stores|hooks (client state)
```

**Architectural principles** (from [MSEM](./docs/core/MSEM.md)):

1. **Specification first** — documentation in `docs/` precedes production code.
2. **Shared Services over duplication** — cross-cutting capabilities are implemented once
   under `services/*`.
3. **Feature modules orchestrate** — `features/*` may call Shared Services; they must not
   reimplement them.
4. **Single contracts** — one API shape, one session model, one recommendations engine, one
   AI-configuration store (see [Single Contracts](./docs/README.md#single-contracts)).
5. **Security by default** — authorization checks at the edge of every dashboard API and
   server action.
6. **Accessibility and SEO are product features**, not optional polish.
7. **Observability is mandatory** before production.

**API contract:** every API route returns `{ data, error, meta }` via `lib/api/response`
and `handleApiError`. See [API Standards](./docs/standards/API-Standards.md).

For structural detail see the [Module Map](./docs/architecture/Module-Map.md),
[Dependency Map](./docs/architecture/Dependency-Map.md), and
[App Router Paths](./docs/architecture/App-Router-Paths.md).

---

## Technology stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Styling / UI** | Tailwind CSS 4, shadcn/ui, Radix UI, Framer Motion, Lucide icons |
| **Content editing** | TipTap (rich text), react-markdown, remark-gfm, rehype-highlight |
| **Data** | PostgreSQL via Prisma 7 (`@prisma/adapter-pg`); Supabase-hosted DB supported |
| **Auth** | NextAuth v5 (Auth.js) + Prisma adapter, bcryptjs, Google/GitHub OAuth |
| **AI** | OpenAI (live at v1.0) via `services/ai`; Claude/Gemini/Grok adapters reserved |
| **Billing** | Stripe (subscription-ready) |
| **Rate limiting** | Upstash Redis (in-memory fallback locally) |
| **Validation** | Zod |
| **Email** | React email templates under `emails/` (SMTP placeholders) |
| **Analytics** | Vercel Analytics |
| **Testing** | Vitest, Testing Library, jsdom |
| **Tooling** | ESLint, tsx, Prisma CLI |

---

## Folder structure

```
mendanize/
├── app/                  Route surfaces & API handlers
│   ├── (public)/         Teaching frontend (Learn/Discover/Explore)
│   ├── (dashboard)/      Authenticated admin / practice app
│   ├── (auth)/           Sign-in / sign-up / password flows
│   └── api/              Route handlers ({ data, error, meta })
├── features/*            Feature modules (UI + server actions + orchestration)
├── services/*            Shared Services (reusable domain logic, single owner)
├── repositories/         Data-access layer over Prisma
├── components/           Cross-feature UI (shadcn/ui based)
├── lib/                  Framework helpers (API envelope, db client, utils)
├── validators/           Zod schemas
├── stores/ contexts/ providers/ hooks/   Client-side state & React wiring
├── actions/              Shared server actions
├── config/ middleware/   Runtime config & edge/request middleware
├── emails/               Transactional email templates
├── prisma/               schema.prisma, migrations, seed.ts
├── tests/                Unit & integration tests (Vitest)
├── scripts/              Operational scripts (smoke checks, tooling)
├── public/ styles/       Static assets & global styles
├── docs/                 Specs, standards, architecture maps, handoffs
├── auth.ts               NextAuth configuration
├── proxy.ts              Request proxy
└── next.config.ts prisma.config.ts vitest.config.ts   Configuration
```

Folder ownership is fixed in the [Module Map](./docs/architecture/Module-Map.md); do not
place Shared Service logic under `features/*` beyond orchestration.

---

## Module overview

### Feature modules (`features/*`)

Each feature maps to an MES specification and its primary route(s).

| Module | Primary route(s) | Spec |
|--------|------------------|------|
| `homepage-public` | `/` | MES-005 |
| `authentication` | `app/(auth)/*` | MES-006 |
| `admin-dashboard` / `admin-modules` | `/dashboard` | MES-007 |
| `articles` | `/dashboard/articles`, `/articles` | MES-008, 025 |
| `categories-topics` | `/categories`, `/topics` | MES-009 |
| `learning-guides` | `/dashboard/guides`, `/guides` | MES-010, 026 |
| `ai-studio` | `/ai-studio` | MES-011 |
| `ai-tools` | `/dashboard/ai-tools`, `/ai-tools` | MES-012, 027 |
| `homepage-management` | `/homepage` | MES-013 |
| `media-library` | `/media` | MES-014 |
| `seo` | `/seo` | MES-015 |
| `navigation` | `/navigation` | MES-016 |
| `search` | `/search` | MES-017 |
| `recommendations` | service-backed + admin UI | MES-018 |
| `ask-mendanize` | `/ask` + public widget | MES-019 |
| `platform-settings` | `/settings` | MES-020 |
| `billing` | `/pricing`, `/billing` | MES-021 |
| `user-learning` | `/learning` | MES-022 |
| `analytics` | `/analytics` | MES-023 |
| `notifications` | `/notifications` | MES-024 |

### Shared Services (`services/*`)

Reusable domain logic with a single owner each; features orchestrate them rather than
duplicating logic:

`ai` · `content` · `media` · `search` · `recommendations` · `seo` · `settings` ·
`notification` · `analytics` · `billing` · `learning` · `navigation` · `admin`

**Canonical single-owner contracts:**

| Concern | Owner |
|---------|-------|
| Session | `features/authentication` (MES-006) |
| Recommendations | `services/recommendations` (MES-018) |
| AI configuration | `services/settings` (MES-020) |
| API envelope | `lib/api/response` — `{ data, error, meta }` |

---

## Setup instructions

**Prerequisites:** Node.js 22+, PostgreSQL (local or hosted), and Git.

```bash
# 1. Install dependencies (legacy peer deps required)
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env.local        # then fill in values (see below)

# 3. Set up the database
npx prisma generate
npx prisma migrate dev
npm run db:seed                   # optional: sample content

# 4. Start the dev server
npm run dev
```

Open http://localhost:3000.

Without `OPENAI_API_KEY`, AI Studio and Ask still run using deterministic local mock
drafts, so you can develop UI without a live key. See the
[Contributor Guide](./docs/CONTRIBUTING.md) and [ENVIRONMENT.md](./docs/ENVIRONMENT.md)
for full details, including Supabase pooler connection strings.

---

## Environment variables

Copy `.env.example` → `.env.local` and fill in values. Full reference:
[docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md).

| Variable | Group | Required | Notes |
|----------|-------|----------|-------|
| `NEXT_PUBLIC_APP_URL` | App | Yes | Public app URL (redirects, canonical URLs) |
| `DATABASE_URL` | Database | Yes | Pooled runtime connection (PgBouncer for Supabase) |
| `DIRECT_URL` | Database | Yes | Direct connection for Prisma migrate / db push |
| `AUTH_SECRET` | Auth | Yes | `openssl rand -base64 32` |
| `AUTH_URL` | Auth | Yes | Base URL for auth redirects |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Auth | Optional | Google OAuth (credentials auth works without) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Auth | Optional | GitHub OAuth |
| `OPENAI_API_KEY` | AI | For live AI | Only live provider at v1.0 (chat + DALL·E) |
| `OPENAI_STUDIO_MODEL` | AI | Optional | Defaults to `gpt-4o-mini` |
| `ANTHROPIC_API_KEY` / `GOOGLE_AI_API_KEY` / `XAI_API_KEY` | AI | Reserved | Post-v1.0 — adapters stubbed |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Optional | Storage / media integrations |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_*` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Billing | For billing | Optional until monetization |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limit | Recommended (prod) | In-memory fallback if unset |
| `SMTP_*` / `EMAIL_FROM` | Email | Optional | Notification Service placeholders |

**Rules:** never commit `.env.local` or secrets; `NEXT_PUBLIC_*` must be browser-safe;
server-only keys are imported only from server modules; rotate compromised credentials
immediately.

---

## Development workflow

```bash
npm run dev            # start dev server (http://localhost:3000)
npm test               # unit + integration (vitest)
npm run test:watch     # vitest watch mode
npm run test:integration  # integration suite only
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run build          # prisma generate && next build
npm run smoke          # smoke checks against a running server
npm run db:migrate     # prisma migrate dev
npm run db:seed        # seed sample data
npm run db:studio      # Prisma Studio GUI
```

**Quality gates** — run before opening a PR (CI runs the same via
`.github/workflows/ci.yml`; tests + build gate the merge):

```bash
npm test && npm run typecheck && npm run lint && npm run build
```

**Working conventions:**

1. **Follow the spec** — implement against the target `docs/engineering/MES-XXX.md`, one
   MES at a time when following the engineering sequence.
2. **Respect module ownership** — confirm placement in the
   [Module Map](./docs/architecture/Module-Map.md); never fork a Shared Service.
3. **Keep the contract** — return `{ data, error, meta }` and validate input with Zod.
4. **Meet the standards** — a11y, responsiveness, security baseline, and SEO on public
   surfaces (see below).

---

## Coding standards

Full standards live in [docs/standards/](./docs/standards/) and
[MSEM Appendix A](./docs/core/MSEM-Appendix-A-Engineering-Standards.md). Highlights from
[Coding Standards](./docs/standards/Coding-Standards.md):

1. **TypeScript strict** — no `any` without justification.
2. **Feature ownership** — new UI/business code lands in its mapped `features/*` folder.
3. **Shared Services** — cross-feature logic lives in `services/*`, never copied.
4. **Thin routes** — `app/**/page.tsx` and `route.ts` compose features/services.
5. **Validators** — colocate Zod schemas in `features/*/validators` or shared `validators/`.
6. **Naming** — kebab-case folders; PascalCase components; camelCase functions.
7. **Server vs client** — default to Server Components; `"use client"` only when needed.
8. **Docs sync** — architectural behavior changes update the relevant MES in the same PR.
9. **No drive-by refactors** outside the task scope.
10. **Read Next.js docs in `node_modules/next/dist/docs/`** before using APIs that may
    differ from training data — this Next.js version has breaking changes (see `AGENTS.md`).

Prefer `@/` path aliases. ESLint and repo formatting must pass in CI.

Related contracts: [API Standards](./docs/standards/API-Standards.md) ·
[Security Standards](./docs/standards/Security-Standards.md) ·
[Database](./docs/standards/Database.md) ·
[UI Standards](./docs/standards/UI-Standards.md) ·
[Component Standards](./docs/standards/Component-Standards.md) ·
[Testing Standards](./docs/standards/Testing-Standards.md)

---

## Deployment guide

Target hosting is Vercel (or equivalent). Full guide:
[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) and the
[Final Deployment Checklist (v1.0)](./docs/FINAL-DEPLOYMENT-CHECKLIST.md).

**Pipeline:**

1. **CI:** install → lint → typecheck → test → build (`.github/workflows/ci.yml`).
2. **Preview deploy** for PRs.
3. **Apply migrations** against the target DB: `npx prisma migrate deploy`.
4. **Promote to production.**
5. **Smoke test:** `npm run smoke` and the final checklist; health probe at
   `GET /api/health`.
6. **Monitor** errors and latency.

**Notes:**

- `prisma generate` runs as part of `npm run build`.
- Install with `npm ci --legacy-peer-deps` (matches CI).
- Never run destructive `migrate reset` against production; prefer expand/contract
  migrations and forward-fixes.
- Stripe, Auth, and AI keys must be environment-specific; keep `NEXT_PUBLIC_*` free of
  secrets.
- **AI at v1.0:** `OPENAI_API_KEY` only; Claude/Gemini/Grok reserved/stubbed.

---

## MES / MSEM references

Mendanize is governed by a specification hierarchy under [`docs/`](./docs/README.md):

- **[MSEM](./docs/core/MSEM.md)** — Mendanize Software Engineering Manifesto: governing
  principles, parent of all specs.
- **[MSEM Appendix A](./docs/core/MSEM-Appendix-A-Engineering-Standards.md)** — binding
  engineering standards referenced by every spec.
- **[Project Rules](./docs/core/Project-Rules.md)** — process rules.
- **[MES Index](./docs/engineering/MES-INDEX.md)** — MES-001 → MES-029, implemented in
  order. Layers:
  - **Foundation** (MES-001–007): platform, Shared Services & API, design system, public
    structure, homepage, auth, admin dashboard.
  - **Content modules** (MES-008–016): articles, categories/topics, guides, AI Studio, AI
    tools, homepage CMS, media library, SEO center, navigation manager.
  - **Platform services** (MES-017–021): search, recommendations, Ask Mendanize, platform
    settings, billing.
  - **User experience** (MES-022–024): learning personalization, analytics, notifications.
  - **Public surfaces** (MES-025–027): public articles, guides, AI tools directory.
  - **Launch** (MES-028–029): performance/security/production readiness, final QA & launch.

Per-spec completion handoffs live at `docs/MES-XXX-COMPLETION.md`.

**How to work (agents & contributors):** read the
[Cursor System Prompt](./docs/core/Cursor-System-Prompt.md) and the
[MES Index](./docs/engineering/MES-INDEX.md) first, then proceed spec by spec, confirming
folder ownership in the [Module Map](./docs/architecture/Module-Map.md).

---

## Roadmap

v1.0 covers MES-001 → MES-029. The following are **explicitly out of the current
sequence** and each becomes its own MES-03X spec once designed
([MES Index](./docs/engineering/MES-INDEX.md)):

- Real ML-based recommendations
- Real learning-progress tracking and completion certificates
- Multi-language support
- Community features
- Mobile apps
- Enterprise offerings
- AI tool submissions / reviews
- Affiliate tracking
- Final per-tier billing gates
- Multi-provider AI wiring (Claude, Gemini, Grok) — adapters are currently stubbed

---

## Contribution guide

See the [Contributor Guide](./docs/CONTRIBUTING.md) for the full workflow. In short:

1. **Set up** locally (see [Setup instructions](#setup-instructions)).
2. **Pick a spec** — implement against the target `docs/engineering/MES-XXX.md`, one at a
   time when following the sequence.
3. **Respect architecture** — Shared Services live in `services/*`; features orchestrate,
   never fork. Keep the `{ data, error, meta }` API envelope and validate input with Zod.
4. **Meet standards** — accessibility, responsiveness, security baseline, and SEO on public
   surfaces (MSEM Appendix A).
5. **Pass quality gates** — `npm test && npm run typecheck && npm run lint && npm run build`.
6. **Sync docs** — update the relevant MES in the same PR when behavior changes.

Architectural changes that alter Shared Service boundaries require an MES update before
merge; breaking API changes require notes in
[API Standards](./docs/standards/API-Standards.md) and
[CHANGELOG](./docs/CHANGELOG.md).

---

## Troubleshooting

| Symptom | Likely cause & fix |
|---------|--------------------|
| `DATABASE_URL is not set` / connection fails | Ensure `.env.local` has `DATABASE_URL`; verify PostgreSQL is running (`psql postgres -c "SELECT 1"`); test the connection string directly. |
| Prisma migrate fails on Supabase free tier | The direct host is often IPv6-only. Use the **Session pooler** (port 5432) for `DIRECT_URL` from IPv4 networks — see `.env.example`. |
| `AUTH_SECRET is not set` / auth broken | Generate with `openssl rand -base64 32`, add to `.env.local`, restart the dev server. |
| Google OAuth fails | Verify credentials in Google Cloud Console, confirm redirect URIs, and ensure `AUTH_URL` matches your domain. |
| AI features return mock/placeholder content | `OPENAI_API_KEY` is unset — Studio/Ask fall back to local mock drafts. Set the key for live generation. |
| Claude/Gemini/Grok "not connected" | Expected at v1.0 — those provider adapters are stubbed. Only OpenAI is live. |
| `Too many requests` errors | Intentional rate limiting. Locally the in-memory store resets on restart; use Upstash Redis in production. |
| `npm install` peer dependency errors | Use `npm install --legacy-peer-deps` (and `npm ci --legacy-peer-deps` in CI). |
| Next.js API behaves unexpectedly | This Next.js version has breaking changes — read the guide in `node_modules/next/dist/docs/` before using the API. |

More help: [ENVIRONMENT.md troubleshooting](./docs/ENVIRONMENT.md#troubleshooting) ·
[Deployment](./docs/DEPLOYMENT.md) · [docs/](./docs/README.md).

---

*Engineering documentation is the single source of truth. When in doubt, defer to
[`docs/`](./docs/README.md) — documentation precedes code.*
