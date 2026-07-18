# Launch Checklist (MES-029)

Use this after every production (or preview) deploy. Companion to [DEPLOYMENT.md](./DEPLOYMENT.md) and the v1.0 [FINAL-DEPLOYMENT-CHECKLIST.md](./FINAL-DEPLOYMENT-CHECKLIST.md).

## Pre-deploy

- [ ] `npm ci --legacy-peer-deps` (or `npm install --legacy-peer-deps`)
- [ ] `npm test` passes
- [ ] `npm run typecheck` passes (CI hard gate)
- [ ] `npm run lint` passes with exit 0 (warnings OK)
- [ ] `npm run build` succeeds with production-like env
- [ ] Prisma migrations reviewed; `npx prisma migrate deploy` plan clear
- [ ] Secrets present in hosting env (never commit): see [ENVIRONMENT.md](./ENVIRONMENT.md)

## Required environment groups

- [ ] App: `NEXT_PUBLIC_APP_URL`, `AUTH_URL`, `AUTH_SECRET`
- [ ] Database: `DATABASE_URL`
- [ ] Auth providers (as used): credentials and/or Google / GitHub OAuth
- [ ] AI (v1.0): `OPENAI_API_KEY` for live generation — OpenAI only; other providers are stubs
- [ ] Stripe (if billing live): secret, publishable, webhook secret, price IDs
- [ ] Optional: Upstash Redis for distributed rate limits
- [ ] Optional: Supabase storage URL + keys

## Post-deploy smoke

With the app running:

```bash
npm run smoke
# or: SMOKE_BASE_URL=https://your.domain npm run smoke
```

Manual checks:

- [ ] `GET /api/health` → `{ data: { status: "ok", ... } }`
- [ ] Public home renders header/footer from Navigation settings
- [ ] `/learn`, `/categories`, `/topics` render real content (not placeholders)
- [ ] `/articles/[slug]`, `/guides/[slug]`, `/ai-tools/[slug]` render for a published entity
- [ ] Public Ask Tier 1 widget responds (or graceful mock/error if AI key absent)
- [ ] Sign-in / dashboard shell loads for a test account
- [ ] Dashboard **AI & API Status** shows OpenAI live only when keyed; Claude/Gemini/Grok as stubs
- [ ] Stripe webhook endpoint reachable (test event in Stripe dashboard) — if billing enabled

## Rollback

- [ ] Revert hosting deployment to previous successful build
- [ ] Prefer forward-fix DB migrations; never `migrate reset` on production
- [ ] Disable feature flags / maintenance announcement via Platform Settings if needed

## Exit criteria

Smoke green + no elevated error rate for 15–30 minutes → launch accepted.
