# Final Deployment Checklist — Mendanize v1.0

| Field | Value |
|-------|-------|
| **Release** | Mendanize v1.0 |
| **Status** | Production release approved — deploy preparation |
| **Date** | 2026-07-16 |
| **Companion** | [DEPLOYMENT.md](./DEPLOYMENT.md) · [ENVIRONMENT.md](./ENVIRONMENT.md) · [MES-029-COMPLETION.md](./MES-029-COMPLETION.md) |

**Do not start post-v1.0 feature work from this checklist.** Use it only to ship the approved baseline.

---

## 1. Pre-flight verification (local / CI)

| Check | Command / evidence | Expected | Status (2026-07-17) |
|-------|--------------------|----------|---------------------|
| Install | `npm ci --legacy-peer-deps` | Clean install | — |
| Lint | `npm run lint` | Exit 0 (warnings allowed) | — |
| Typecheck | `npm run typecheck` / `tsc --noEmit` | Exit 0 | Pass |
| Tests | `npm test` | All tests pass | **Pass (26/26)** |
| Production build | `npx next build --webpack` (loads `.env` / `.env.local`) | Exit 0 | **Pass** |
| CI | `.github/workflows/ci.yml` | lint → typecheck → test → build (hard fail) | — |

### Build notes (deploy-critical)

- Client/server feature barrels were split so `"use client"` modules do not import Prisma via `@/features/*/index` (e.g. `media-library`, `seo`, `homepage-public`, `articles`, `authentication`). Loaders live under `@/features/*/server`.
- Root `app/layout.tsx` sets `dynamic = "force-dynamic"` so DB-backed pages are not statically prerendered at build (required for CI placeholder `DATABASE_URL` and offline local DB).

### Build-time environment (minimum)

```env
DATABASE_URL=postgresql://…/mendanize?schema=public
AUTH_SECRET=<32+ byte secret>
AUTH_URL=https://your-production-domain
NEXT_PUBLIC_APP_URL=https://your-production-domain
```

`prisma generate` runs as part of `npm run build`. A live DB is not required for *generate*, but `DATABASE_URL` must be set for Prisma config in production.

---

## 2. Required environment variables

Validated against `.env.example`, Auth.js, Prisma, Stripe, and AI Service (OpenAI-only at v1.0).

### Required for a working production site

| Variable | Purpose | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_APP_URL` | Canonical public URL | Must match production domain (HTTPS) |
| `AUTH_URL` | Auth.js callback base | Same origin as app URL |
| `AUTH_SECRET` | Session/JWT encryption | Unique per environment; `openssl rand -base64 32` |
| `DATABASE_URL` | PostgreSQL | Required; Prisma adapter uses this |

### Required for live AI (otherwise mocks)

| Variable | Purpose | Notes |
|----------|---------|-------|
| `OPENAI_API_KEY` | Studio / Ask / assist / DALL·E | **Only live AI provider at v1.0** |

### Optional but recommended for production

| Variable | Purpose | Notes |
|----------|---------|-------|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth | Optional if credentials-only auth |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth | Wired in `auth.ts`; optional |
| `STRIPE_SECRET_KEY` | Billing | Required only if billing goes live |
| `STRIPE_WEBHOOK_SECRET` | Webhook verify | Set after creating Stripe endpoint |
| `STRIPE_PRICE_PRO` / `STRIPE_PRICE_TEAM` | Plan prices | Map to Pro / Team |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Checkout UI | Public; safe in browser |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Distributed rate limits | Falls back to in-memory if unset |
| `OPENAI_STUDIO_MODEL` | Model override | Default `gpt-4o-mini` |

### Optional / not required for v1.0 launch

| Variable | Notes |
|----------|-------|
| `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY`, `XAI_API_KEY` | **Reserved** — adapters stubbed; do not expect live routing |
| Supabase URL / anon / service role | Media cloud optional; URL/placeholder media works without |
| `SMTP_*` / `EMAIL_FROM` | Notification Service logs email; SMTP not wired at v1.0 |

### Operator checklist (copy into hosting secrets)

- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `AUTH_URL`
- [ ] `AUTH_SECRET` (production-unique)
- [ ] `DATABASE_URL` (production Postgres)
- [ ] `OPENAI_API_KEY` (if live AI desired)
- [ ] OAuth pair(s) you intend to enable
- [ ] Stripe set (if billing enabled day-one)
- [ ] Upstash Redis (recommended for multi-instance)

Confirm: no secrets in git; `NEXT_PUBLIC_*` contain no private keys.

---

## 3. Database migrations — ready for deploy

**Provider:** PostgreSQL (`prisma/migrations/migration_lock.toml`)  
**Apply command (production):** `npx prisma migrate deploy`  
**Never on production:** `prisma migrate reset`, `db push` as a substitute for migrate, or destructive SQL.

### Migration chain (apply in order — Prisma tracks this)

1. `20260621155409_init`
2. `20260701063117_add_blog_models`
3. `20260715120000_mes006_user_roles`
4. `20260715140000_mes008_article_cms`
5. `20260715150000_mes009_taxonomy`
6. `20260715160000_mes010_learning_guides`
7. `20260715170000_mes011_ai_studio`
8. `20260715180000_mes012_ai_tools`
9. `20260715190000_mes013_homepage_cms`
10. `20260715200000_mes014_media_library`
11. `20260715210000_mes015_seo_center`
12. `20260715220000_mes016_navigation`
13. `20260715230000_mes017_search`
14. `20260715240000_mes018_recommendations`
15. `20260715250000_mes019_ask`
16. `20260715260000_mes020_platform_settings`
17. `20260715270000_mes022_user_learning`
18. `20260715280000_mes023_analytics`
19. `20260715290000_mes024_notifications`

**Status:** Migration folder is complete through MES-024 schema. No pending uncommitted migration files required for v1.0 surfaces (025–029 are application-layer).

### Pre-migrate checks

- [ ] Production `DATABASE_URL` points at the intended empty or backup-safe database
- [ ] Backup / snapshot taken before first `migrate deploy`
- [ ] `npx prisma migrate status` against target DB shows pending migrations only (or already applied)
- [ ] After deploy: `npx prisma migrate status` → **Database schema is up to date**

### Optional seed (non-prod or controlled bootstrap)

```bash
npm run db:seed
```

Do **not** seed production casually — use only for controlled initial content.

---

## 4. Production configuration completeness

| Area | Status | Notes |
|------|--------|-------|
| Next.js headers / HSTS / CSP Report-Only | ✓ | `next.config.ts` |
| Health endpoint | ✓ | `GET /api/health` |
| Auth proxy protection | ✓ | `proxy.ts` — `/dashboard`, `/learning`, `/ask`, auth routes |
| CI quality gates | ✓ | Lint + typecheck hard-fail |
| AI posture | ✓ | OpenAI-only; status panels honest |
| Design tokens at runtime | ✓ | Settings branding → root layout |
| Email verification flow | ✓ | Token + Notification dispatch; SMTP deferred |
| Billing | ✓ code | Enable only if Stripe env complete |
| Observability vendor | Deferred | Logger seam only — no Sentry required for v1.0 |
| CSP enforce | Deferred | Report-Only until traffic review |

---

## 5. Manual deployment steps

Execute in order on the production host (Vercel or equivalent).

### A. Hosting project

1. Create/select the production project (e.g. Vercel) linked to this repository.
2. Set **Node.js 22** (matches CI).
3. Build command: `npm run build` (or hosting default that runs package `build`).
4. Install command: `npm ci --legacy-peer-deps` (peer deps required).
5. Output: Next.js default (no static export).

### B. Secrets & env

1. Paste all **Required** variables from §2 into the production environment.
2. Set `NEXT_PUBLIC_APP_URL` and `AUTH_URL` to the final HTTPS domain **before** first Auth OAuth test.
3. Add OAuth redirect URIs in Google/GitHub consoles:
   - `https://<domain>/api/auth/callback/google`
   - `https://<domain>/api/auth/callback/github` (if used)

### C. Database

1. Provision managed PostgreSQL.
2. Snapshot / backup policy on.
3. From a trusted machine with production `DATABASE_URL`:

   ```bash
   npx prisma migrate deploy
   npx prisma migrate status
   ```

4. Confirm no pending migrations.

### D. Deploy application

1. Deploy the approved `main`/release commit (or promote a green preview).
2. Wait for build success in the hosting dashboard.
3. Confirm `GET https://<domain>/api/health` returns `{ data: { status: "ok", … } }`.

### E. Stripe (only if billing launches)

1. Create webhook endpoint → `https://<domain>/api/webhooks/stripe`.
2. Subscribe to: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`.
3. Copy signing secret → `STRIPE_WEBHOOK_SECRET`.
4. Set live/test price IDs and secrets to match the environment.
5. Send a Stripe test event; confirm local `Subscription` sync.

### F. Post-deploy smoke

```bash
SMOKE_BASE_URL=https://<domain> npm run smoke
```

Manual:

- [ ] `/` — public layout + homepage
- [ ] `/learn`, `/categories`, `/topics` — not placeholders
- [ ] Published `/articles/[slug]`, `/guides/[slug]`, `/ai-tools/[slug]`
- [ ] `/search`
- [ ] Sign-up → verification message → (dev: check logs for verify URL if SMTP unset) → sign-in
- [ ] `/dashboard` as staff user
- [ ] AI & API Status shows OpenAI connected only if key set; stubs for Claude/Gemini/Grok
- [ ] Ask Tier 1 on a public article (mock or live OpenAI)

### G. Rollback

1. Revert hosting deployment to previous successful build.
2. Prefer **forward-fix** DB migrations; never `migrate reset` on production.
3. Use Platform Settings maintenance / feature flags if needed to pause traffic features.

---

## 6. Sign-off

| Role | Check | Initials / date |
|------|-------|-----------------|
| Engineering | Build + migrate + smoke green | |
| Ops | Env secrets + DB backup confirmed | |
| Product | Public surfaces + auth path accepted | |

**Exit criteria:** Smoke green + no elevated error rate for 15–30 minutes → production launch accepted.

---

## Related

- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ENVIRONMENT.md](./ENVIRONMENT.md)
- [LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md) (per-deploy smoke companion)
- [MES-029-COMPLETION.md](./MES-029-COMPLETION.md)
