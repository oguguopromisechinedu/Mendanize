import fs from "node:fs";
import path from "node:path";
import { frontMatter, section, writeDoc, refs, DOCS } from "./helpers.mjs";

export function generateSupporting() {
  const files = [];

  files.push(
    writeDoc(
      "APP-ROUTER-PATHS.md",
      `${frontMatter({ title: "App Router Path Resolution" })}
${section(
  "Purpose",
  `Document how Next.js App Router route groups map to URLs on Mendanize, and the binding rules that prevent duplicate routes between public and dashboard surfaces.`
)}
${section(
  "Scope",
  `Applies to \`app/(public)\`, \`app/(dashboard)\`, \`app/(auth)\`, and legacy root routes pending migration.`
)}
${section(
  "Dependencies",
  `- [MES-001-Foundation-Platform.md](./MES-001-Foundation-Platform.md)
- [MES-004-Public-Website.md](./MES-004-Public-Website.md)
- [MES-007-Admin-Dashboard.md](./MES-007-Admin-Dashboard.md)
- [MODULE-MAP.md](./MODULE-MAP.md)`
)}
${section(
  "Critical Rule",
  `Route groups \`(public)\`, \`(dashboard)\`, and \`(auth)\` **do not** appear in the URL. Two \`page.tsx\` files that resolve to the same path cannot coexist.`
)}
${section(
  "Binding Path Table",
  `| Surface | URL pattern | Folder |
|---------|-------------|--------|
| Teaching Frontend | \`/\`, \`/articles\`, \`/guides\`, \`/ai-tools\`, \`/categories\`, \`/topics\`, \`/search\`, \`/pricing\` | \`app/(public)/…\` |
| Admin content (name collision) | \`/dashboard/articles\`, \`/dashboard/guides\`, \`/dashboard/ai-tools\`, \`/dashboard/categories\` | \`app/(dashboard)/dashboard/…\` |
| Dashboard unique modules | \`/dashboard\`, \`/ai-studio\`, \`/ask\`, \`/learning\`, \`/billing\`, \`/homepage\`, \`/media\`, \`/navigation\`, \`/seo\`, \`/search-settings\`, \`/settings\`, \`/analytics\`, \`/notifications\` | \`app/(dashboard)/…\` |
| Auth | \`/sign-in\`, \`/sign-up\`, \`/forgot-password\`, \`/reset-password\` | \`app/(auth)/…\` (migrate legacy \`app/sign-in\` etc.) |
| HTTP API | \`/api/public/*\`, \`/api/dashboard/*\` | \`app/api/public\`, \`app/api/dashboard\` |`
)}
${section(
  "Implementation Notes",
  `- Prefer nesting admin twins of public resources under \`/dashboard/*\`.
- During migration, if a legacy root page still owns a URL, do not also create a route-group \`page.tsx\` for the same path — leave a README migration note instead.
- Middleware auth gates dashboard paths; public paths remain open.`
)}
${section(
  "Related Documents",
  refs([
    { label: "Module Map", file: "MODULE-MAP.md" },
    { label: "Public Website", file: "MES-004-Public-Website.md" },
    { label: "Admin Dashboard", file: "MES-007-Admin-Dashboard.md" },
  ])
)}`
    )
  );

  files.push(
    writeDoc(
      "DATABASE.md",
      `${frontMatter({ title: "Database Architecture" })}
${section(
  "Purpose",
  `Define persistence standards for Mendanize: PostgreSQL via Prisma, modeling guidelines, migration policy, and how features access data through repositories/Shared Services.`
)}
${section(
  "Scope",
  `Schema ownership, migrations, seeding, indexing, soft deletes, multi-tenancy assumptions (single-tenant SaaS), and connection configuration.`
)}
${section(
  "Dependencies",
  `- [MSEM-Appendix-A.md](./MSEM-Appendix-A.md)
- [MES-002-Shared-Services.md](./MES-002-Shared-Services.md)
- [SECURITY-STANDARDS.md](./SECURITY-STANDARDS.md)
- [ENVIRONMENT.md](./ENVIRONMENT.md)`
)}
${section(
  "Stack",
  `- **Database:** PostgreSQL (Supabase or compatible)
- **ORM:** Prisma (\`prisma/\`)
- **Access path:** Route/Action → Feature orchestration → Shared Service → Repository/Prisma
- **Forbidden:** UI components importing Prisma client directly`
)}
${section(
  "Core Domain Groups",
  `| Domain | Representative models | Owning specs |
|--------|----------------------|--------------|
| Identity | User, Account, Session | MES-006 |
| Content | Article/Post, Guide, Category, Topic, Tag | MES-008–010, 012, 013 |
| Media | Asset, AssetVariant | MES-014 |
| SEO | SeoMetadata | MES-015 |
| Learning | Progress, Bookmark | MES-022 |
| Billing | Customer, Subscription, Entitlement | MES-021 |
| Notifications | Notification, Preference | MES-024 |
| Settings | PlatformSetting | MES-020 |
| Analytics | Event (or external) | MES-023 |`
)}
${section(
  "Implementation Notes",
  `- Prefer additive migrations; destructive changes require explicit expand/contract plan.
- Use UUID or cuid IDs consistently.
- Index foreign keys and frequent filter columns (\`slug\`, \`status\`, \`publishedAt\`).
- Soft-delete content entities when public URLs must redirect or 404 intentionally.
- Seed scripts in \`prisma/seed.ts\` for local/dev only — never production secrets.
- Connection pooling required in serverless (Prisma adapter / Supabase pooler).`
)}
${section(
  "Related Documents",
  refs([
    { label: "Environment", file: "ENVIRONMENT.md" },
    { label: "Security Standards", file: "SECURITY-STANDARDS.md" },
    { label: "Deployment", file: "DEPLOYMENT.md" },
  ])
)}`
    )
  );

  files.push(
    writeDoc(
      "API-STANDARDS.md",
      `${frontMatter({ title: "API Standards" })}
${section(
  "Purpose",
  `Define the single HTTP and server-action response contract for Mendanize APIs so clients and agents never invent divergent envelopes.`
)}
${section(
  "Scope",
  `\`app/api/public/*\`, \`app/api/dashboard/*\`, shared error codes, pagination meta, versioning policy, and alignment with server actions.`
)}
${section(
  "Dependencies",
  `- [MES-002-Shared-Services.md](./MES-002-Shared-Services.md)
- [SECURITY-STANDARDS.md](./SECURITY-STANDARDS.md)
- [CODING-STANDARDS.md](./CODING-STANDARDS.md)`
)}
${section(
  "Response Contract",
  `\`\`\`ts
export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
  meta?: Record<string, unknown>;
};
\`\`\`

Canonical type: \`types/api.ts\`.

**Success:** \`error\` is \`null\`, \`data\` populated.  
**Failure:** \`data\` is \`null\`, \`error\` populated; HTTP status reflects class (400/401/403/404/409/422/429/500).`
)}
${section(
  "Meta Conventions",
  `| Key | Meaning |
|-----|---------|
| \`meta.page\`, \`meta.pageSize\`, \`meta.total\` | Pagination |
| \`meta.requestId\` | Correlation id |
| \`meta.placeholder\` | Scaffold-only endpoints (must be removed before launch) |`
)}
${section(
  "Error Codes",
  `Use stable uppercase codes: \`UNAUTHORIZED\`, \`FORBIDDEN\`, \`NOT_FOUND\`, \`VALIDATION_ERROR\`, \`RATE_LIMITED\`, \`CONFLICT\`, \`NOT_IMPLEMENTED\`, \`INTERNAL_ERROR\`. Validation details belong in \`error.details\`.`
)}
${section(
  "Implementation Notes",
  `- Public APIs never expose admin-only fields.
- Dashboard APIs require session + role checks before business logic.
- Prefer Shared Services inside handlers; keep route files thin.
- Server Actions should return an equivalent discriminated result shape for UI forms.`
)}
${section(
  "Related Documents",
  refs([
    { label: "Shared Services", file: "MES-002-Shared-Services.md" },
    { label: "Security Standards", file: "SECURITY-STANDARDS.md" },
    { label: "Authentication", file: "MES-006-Authentication.md" },
  ])
)}`
    )
  );

  files.push(
    writeDoc(
      "SECURITY-STANDARDS.md",
      `${frontMatter({ title: "Security Standards" })}
${section(
  "Purpose",
  `Establish security requirements for authentication, authorization, data protection, abuse prevention, and secure AI/tool usage across Mendanize.`
)}
${section(
  "Scope",
  `All surfaces, APIs, server actions, webhooks, media uploads, and third-party integrations (Stripe, AI providers, OAuth).`
)}
${section(
  "Dependencies",
  `- [MES-006-Authentication.md](./MES-006-Authentication.md)
- [MES-020-Platform-Settings.md](./MES-020-Platform-Settings.md)
- [MES-021-Billing-Subscriptions.md](./MES-021-Billing-Subscriptions.md)
- [ENVIRONMENT.md](./ENVIRONMENT.md)`
)}
${section(
  "Controls",
  `| Control | Requirement |
|---------|-------------|
| Authentication | Single session contract (MES-006); secure cookies; CSRF protections as provided by Auth.js |
| Authorization | Role checks on every dashboard API/action; deny by default |
| Secrets | Env/secret manager only; never commit; never return to clients |
| Validation | Zod (or equivalent) on all writes |
| Rate limiting | Auth, AI, search, webhooks |
| Uploads | MIME allowlist, size caps, private buckets by default |
| Webhooks | Signature verification (Stripe) |
| AI | Prompt injection awareness; do not execute tool actions without authZ; no secret leakage in model context |
| Logging | No passwords, tokens, or full card data in logs |`
)}
${section(
  "Implementation Notes",
  `- Prefer server-only modules for provider SDKs.
- Sanitize markdown/HTML before render when user-generated.
- Content Security Policy and secure headers configured at the edge/platform.
- Principle of least privilege for service roles and DB users.`
)}
${section(
  "Related Documents",
  refs([
    { label: "Authentication", file: "MES-006-Authentication.md" },
    { label: "API Standards", file: "API-STANDARDS.md" },
    { label: "Production Readiness", file: "MES-028-Production-Readiness.md" },
  ])
)}`
    )
  );

  files.push(
    writeDoc(
      "CODING-STANDARDS.md",
      `${frontMatter({ title: "Coding Standards" })}
${section(
  "Purpose",
  `Define coding conventions for TypeScript/React/Next.js in the Mendanize repository so modules remain consistent and reviewable.`
)}
${section(
  "Scope",
  `Language style, folder ownership, naming, imports, testing expectations, and documentation touch rules.`
)}
${section(
  "Dependencies",
  `- [MSEM-Appendix-A.md](./MSEM-Appendix-A.md)
- [API-STANDARDS.md](./API-STANDARDS.md)
- [MODULE-MAP.md](./MODULE-MAP.md)`
)}
${section(
  "Rules",
  `1. **TypeScript strict** — no \`any\` without justification.
2. **Feature ownership** — new UI/business code lands in the mapped \`features/*\` folder.
3. **Shared Services** — cross-feature logic lands in \`services/*\`, never copied.
4. **Thin routes** — \`app/**/page.tsx\` and \`route.ts\` compose features/services.
5. **Validators** — colocate Zod schemas in \`features/*/validators\` or shared \`validators/\`.
6. **Naming** — kebab-case folders; PascalCase components; camelCase functions.
7. **Server vs client** — default to Server Components; \`"use client"\` only when needed.
8. **Docs sync** — architectural behaviour changes update the relevant MES in the same PR when practical.
9. **No drive-by refactors** outside the task scope.
10. **Read Next.js docs in \`node_modules/next/dist/docs/\`** before using APIs that may differ from training data (see root \`AGENTS.md\`).`
)}
${section(
  "Implementation Notes",
  `- Prefer \`@/\` path aliases.
- Avoid \`useMemo\`/\`useCallback\` by default unless profiling or existing patterns require them (React Compiler guidance).
- ESLint + Prettier/repo formatting must pass in CI.`
)}
${section(
  "Related Documents",
  refs([
    { label: "Appendix A", file: "MSEM-Appendix-A.md" },
    { label: "Design System", file: "MES-003-Design-System.md" },
    { label: "Module Map", file: "MODULE-MAP.md" },
  ])
)}`
    )
  );

  files.push(
    writeDoc(
      "MODULE-MAP.md",
      `${frontMatter({ title: "Module Map" })}
${section(
  "Purpose",
  `Map every MES specification to its owning feature module, Shared Service, and primary App Router location.`
)}
${section(
  "Scope",
  `Complete coverage of MES-001–029 and meta docs. Source of truth for folder ownership during implementation.`
)}
${section(
  "Dependencies",
  `- [MES-INDEX.md](./MES-INDEX.md)
- [DEPENDENCY-MAP.md](./DEPENDENCY-MAP.md)
- [APP-ROUTER-PATHS.md](./APP-ROUTER-PATHS.md)`
)}
${section(
  "MES → Code Map",
  `| Spec | Feature / owner | Shared Services | Primary routes |
|------|-----------------|-----------------|----------------|
| MES-001 | Platform (cross-cutting) | — | \`app/(public)\`, \`app/(dashboard)\`, \`app/(auth)\` |
| MES-002 | \`services/*\` | all eight | \`app/api/public\`, \`app/api/dashboard\` |
| MES-003 | \`components/*\`, \`styles/*\` | — | — |
| MES-004 | public IA | content, seo | \`app/(public)/*\` |
| MES-005 | \`features/homepage-public\` | content, media, seo, recommendations | \`/\` |
| MES-006 | \`features/authentication\` | settings | \`app/(auth)/*\` |
| MES-007 | \`features/admin-dashboard\` | content, notification, media, settings | \`/dashboard\` |
| MES-008 | \`features/articles\` | content, media, seo, search | \`/dashboard/articles\` |
| MES-009 | \`features/categories-topics\` | content, seo, search | \`/dashboard/categories\`, \`/categories\`, \`/topics\` |
| MES-010 | \`features/learning-guides\` | content, media, seo, search, recommendations | \`/dashboard/guides\` |
| MES-011 | \`features/ai-studio\` | ai, content, media, **settings** | \`/ai-studio\` |
| MES-012 | \`features/ai-tools\` | ai, content, media, seo, settings | \`/dashboard/ai-tools\` |
| MES-013 | \`features/homepage-management\` | content, media, seo, settings | \`/homepage\` |
| MES-014 | \`features/media-library\` | media, ai | \`/media\` |
| MES-015 | \`features/seo\` | seo, content | \`/seo\` |
| MES-016 | \`features/navigation\` | content, settings | \`/navigation\` |
| MES-017 | \`features/search\` | search, **recommendations**, content | \`/search\`, \`/search-settings\` |
| MES-018 | \`features/recommendations\` (UI) | **recommendations** (logic) | service-only + optional admin UI |
| MES-019 | \`features/ask-mendanize\` | ai, content, **settings**, recommendations | \`/ask\` + public widget |
| MES-020 | \`features/platform-settings\` | **settings**, ai | \`/settings\` |
| MES-021 | \`features/billing\` | settings, notification | \`/pricing\`, \`/billing\` |
| MES-022 | \`features/user-learning\` | content, recommendations, settings | \`/learning\` |
| MES-023 | \`features/analytics\` | content, recommendations, settings | \`/analytics\` |
| MES-024 | \`features/notifications\` | notification, settings | \`/notifications\`, \`emails/\` |
| MES-025 | public articles UX | content, seo, media, recommendations | \`/articles\` |
| MES-026 | public guides UX | content, seo, media, recommendations | \`/guides\` |
| MES-027 | public AI tools UX | content, seo, media, ai, recommendations, settings | \`/ai-tools\` |
| MES-028 | ops cross-cutting | — | \`config/\`, \`middleware/\`, \`tests/\`, \`scripts/\` |
| MES-029 | QA cross-cutting | — | \`tests/\`, \`scripts/\` |`
)}
${section(
  "No-Duplication Summary",
  `- AI config → MES-020 / \`services/settings\` only  
- Recommendations → MES-018 / \`services/recommendations\` only  
- Session → MES-006 / \`features/authentication\` only  
- API envelope → [API-STANDARDS.md](./API-STANDARDS.md) only`
)}
${section(
  "Implementation Notes",
  `When adding a new capability, update this map in the same change that introduces folders. Do not place Shared Service logic under \`features/*/services\` beyond orchestration.`
)}
${section(
  "Related Documents",
  refs([
    { label: "Dependency Map", file: "DEPENDENCY-MAP.md" },
    { label: "MES Index", file: "MES-INDEX.md" },
    { label: "App Router Paths", file: "APP-ROUTER-PATHS.md" },
  ])
)}`
    )
  );

  files.push(
    writeDoc(
      "DEPENDENCY-MAP.md",
      `${frontMatter({ title: "Dependency Map" })}
${section(
  "Purpose",
  `Make cross-MES and Shared Service dependencies explicit so implementation order and ownership remain unambiguous.`
)}
${section(
  "Scope",
  `Hard dependencies between MES documents and runtime Shared Services.`
)}
${section(
  "Dependencies",
  `- [MES-INDEX.md](./MES-INDEX.md)
- [MODULE-MAP.md](./MODULE-MAP.md)
- [MES-002-Shared-Services.md](./MES-002-Shared-Services.md)`
)}
${section(
  "Foundational Chain",
  `\`MSEM → Appendix A → MES-001 → MES-002 → MES-003 → (surface/feature MES)\``
)}
${section(
  "Critical Deferrals",
  `| Consumer specs | Must defer to | Ownership |
|----------------|---------------|-----------|
| MES-011, MES-019, MES-012 (runtime), MES-027 (execution) | MES-020 | \`services/settings\` AI config |
| MES-017, MES-022, MES-023, MES-025, MES-026, MES-027 | MES-018 | \`services/recommendations\` |
| All dashboard modules | MES-006 + MES-007 | session + shell |
| MES-005 | MES-013 | homepage CMS vs public render |
| MES-025 / MES-026 / MES-027 | MES-008 / MES-010 / MES-012 | CMS source of content |
| MES-028 / MES-029 | all prior | launch gates |`
)}
${section(
  "Shared Service Fan-In",
  `\`\`\`
Content ← articles, guides, tools, homepage, taxonomy, public pages
AI ← ai-studio, ask-mendanize, media (generative), tool runners
Settings ← ai-studio, ask-mendanize, platform-settings UI, feature flags
Recommendations ← search, learning, analytics widgets, public related rails
Search ← publish pipeline, search UI
SEO ← all public entities
Media ← editors + public rendering
Notification ← billing, learning, system
\`\`\``
)}
${section(
  "Implementation Notes",
  `- If a new feature needs ranking, extend MES-018 — do not add a parallel engine.
- If a new AI surface needs models/keys, extend MES-020 — do not add local config.
- Prefer updating this map when introducing a new cross-module dependency.`
)}
${section(
  "Related Documents",
  refs([
    { label: "Module Map", file: "MODULE-MAP.md" },
    { label: "Shared Services", file: "MES-002-Shared-Services.md" },
    { label: "Platform Settings", file: "MES-020-Platform-Settings.md" },
  ])
)}`
    )
  );

  files.push(
    writeDoc(
      "DEPLOYMENT.md",
      `${frontMatter({ title: "Deployment Guide" })}
${section(
  "Purpose",
  `Describe how Mendanize is built, migrated, and deployed to production environments.`
)}
${section(
  "Scope",
  `Vercel (or equivalent) hosting, Prisma migrate deploy, environment promotion, rollback, and smoke checks post-deploy.`
)}
${section(
  "Dependencies",
  `- [ENVIRONMENT.md](./ENVIRONMENT.md)
- [MES-028-Production-Readiness.md](./MES-028-Production-Readiness.md)
- [MES-029-Final-QA.md](./MES-029-Final-QA.md)
- [DATABASE.md](./DATABASE.md)`
)}
${section(
  "Pipeline",
  `1. CI: install → lint → typecheck → test → build  
2. Preview deploy for PRs  
3. Apply migrations (\`prisma migrate deploy\`) against target DB  
4. Promote to production  
5. Run smoke checklist (MES-029)  
6. Monitor errors/latency`
)}
${section(
  "Implementation Notes",
  `- \`prisma generate\` runs as part of build (\`package.json\` scripts).
- Never run destructive migrate reset against production.
- Stripe, Auth, and AI keys must be environment-specific.
- Keep \`NEXT_PUBLIC_*\` free of secrets.
- Rollback: revert deployment + forward-fix DB when possible; keep expand/contract migrations.`
)}
${section(
  "Related Documents",
  refs([
    { label: "Environment", file: "ENVIRONMENT.md" },
    { label: "Final QA", file: "MES-029-Final-QA.md" },
    { label: "Changelog", file: "CHANGELOG.md" },
  ])
)}`
    )
  );

  files.push(
    writeDoc(
      "CHANGELOG.md",
      `${frontMatter({ title: "Documentation Changelog" })}
${section(
  "Purpose",
  `Record versioned changes to the Mendanize engineering documentation set.`
)}
${section(
  "Scope",
  `Docs-only history. Application release notes may mirror entries when behaviour lands.`
)}
${section(
  "Dependencies",
  `- [README.md](./README.md)
- [MES-INDEX.md](./MES-INDEX.md)`
)}
${section(
  "Releases",
  `### 1.0.0 — 2026-07-14

#### Added
- Complete Phase 1 documentation system under \`docs/\`
- MSEM + Appendix A binding standards
- MES-001 through MES-029 module specifications
- Cross-cutting standards: API, Security, Coding, Database, Environment, Deployment
- Maps: Module, Dependency, App Router Paths
- Documentation README and MES Index

#### Notes
- Application feature implementation is intentionally out of scope for this release of the docs set.
- Prior scaffold notes (\`MES-DOCUMENTS-STATUS.md\`, older \`MES-MODULE-MAP.md\`) are superseded by this Phase 1 pack.`
)}
${section(
  "Implementation Notes",
  `When changing a MES, bump its Version field and add a dated entry here describing why.`
)}
${section(
  "Related Documents",
  refs([
    { label: "Documentation README", file: "README.md" },
    { label: "MES Index", file: "MES-INDEX.md" },
  ])
)}`
    )
  );

  // ENVIRONMENT.md — rewrite with MES front matter, preserve operational value
  const existingEnvPath = path.join(DOCS, "ENVIRONMENT.md");
  let envBody = "";
  if (fs.existsSync(existingEnvPath)) {
    const prev = fs.readFileSync(existingEnvPath, "utf8");
    // Keep variable details if they look like the prior guide
    if (prev.includes("NEXT_PUBLIC_APP_URL") || prev.includes("DATABASE_URL")) {
      envBody = prev
        .replace(/^# Environment Configuration Guide\s*/m, "")
        .trim();
    }
  }

  files.push(
    writeDoc(
      "ENVIRONMENT.md",
      `${frontMatter({ title: "Environment Configuration" })}
${section(
  "Purpose",
  `Catalog required and optional environment variables for local development, preview, and production, and define how secrets are managed.`
)}
${section(
  "Scope",
  `Application URL, database, auth, Supabase, AI providers, Stripe, Redis/rate-limit, analytics. Complements [MES-020](./MES-020-Platform-Settings.md) (non-secret preferences).`
)}
${section(
  "Dependencies",
  `- [MES-006-Authentication.md](./MES-006-Authentication.md)
- [MES-020-Platform-Settings.md](./MES-020-Platform-Settings.md)
- [MES-021-Billing-Subscriptions.md](./MES-021-Billing-Subscriptions.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [SECURITY-STANDARDS.md](./SECURITY-STANDARDS.md)`
)}
${section(
  "Quick Start",
  `\`\`\`bash
cp .env.example .env.local
# fill required values
npm run dev
\`\`\``
)}
${section(
  "Variable Groups",
  `| Group | Examples | Required |
|-------|----------|----------|
| App | \`NEXT_PUBLIC_APP_URL\` | Yes |
| Database | \`DATABASE_URL\` | Yes |
| Auth | \`AUTH_SECRET\`, OAuth client IDs/secrets | Yes for auth |
| Supabase | \`NEXT_PUBLIC_SUPABASE_URL\`, \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`, service role (server-only) | Yes for storage/auth integrations |
| AI | \`OPENAI_API_KEY\`, Anthropic/Google/xAI keys as enabled | Per enabled provider |
| Stripe | \`STRIPE_SECRET_KEY\`, \`STRIPE_WEBHOOK_SECRET\`, publishable key | Yes for billing |
| Rate limit | Upstash Redis REST URL/token | Recommended in prod |
| Analytics | Vercel Analytics (platform) | Optional |`
)}
${section(
  "Implementation Notes",
  `- Never commit \`.env.local\` or production secrets.
- \`NEXT_PUBLIC_*\` must be safe for browsers.
- Server-only keys imported only from server modules.
- Platform Settings (MES-020) stores non-secret preferences; raw provider secrets remain in env/secret manager.
- Rotate compromised credentials immediately and invalidate sessions if auth secrets leak.`
)}
${envBody
  ? section(
      "Detailed Variable Reference",
      `The following reference is maintained for operators and expands each variable:\n\n${envBody}`
    )
  : ""}
${section(
  "Related Documents",
  refs([
    { label: "Deployment", file: "DEPLOYMENT.md" },
    { label: "Security Standards", file: "SECURITY-STANDARDS.md" },
    { label: "Platform Settings", file: "MES-020-Platform-Settings.md" },
  ])
)}`
    )
  );

  return files;
}
