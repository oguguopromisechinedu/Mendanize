import { mesShell, writeDoc } from "./helpers.mjs";

const R = (label, file) => ({ label, file });

function mes(id, file, title, body) {
  return writeDoc(
    file,
    mesShell({
      id,
      title,
      ...body,
    })
  );
}

export function generateMesA() {
  const files = [];

  files.push(
    mes("MES-001", "MES-001-Foundation-Platform.md", "Foundation & Platform Vision", {
      purpose:
        "Define why Mendanize exists, the two-surface product architecture, primary user journeys, and non-negotiable platform constraints that every subsequent MES must honour.",
      scope: `Product vision; Learning pillars (Learn / Discover / Explore / Practice / Ask); surface split between public Teaching Frontend and auth-gated Dashboard; high-level technology baseline; success metrics; explicit non-goals for v1.`,
      dependencies: `- [MSEM.md](./MSEM.md)
- [MSEM-Appendix-A.md](./MSEM-Appendix-A.md)`,
      outOfScope: `Feature UX details (owned by later MES), billing plan design (MES-021), AI prompt libraries (MES-011 / MES-019).`,
      architecture: `### Two-surface architecture

| Surface | Route group | Audience | Primary jobs |
|---------|-------------|----------|--------------|
| Teaching Frontend | \`app/(public)\` | Anonymous + signed-out | Learn, Discover, Explore |
| Dashboard | \`app/(dashboard)\` | Authenticated users & admins | Practice, Ask, Create, Administer |
| Auth | \`app/(auth)\` | Shared | Sign-in, sign-up, recovery |

### Platform pillars
- **Content** — articles, guides, tools, taxonomy
- **Intelligence** — multi-provider AI + Ask Mendanize
- **Discovery** — search + recommendations
- **Growth** — billing, notifications, analytics

### Technical baseline
Next.js App Router, TypeScript, Prisma + PostgreSQL, Auth.js, Supabase storage, Stripe, Shared Services under \`/services\`.`,
      implementation: `- Resolve the \`app/\` two-surface layout before adding feature folders ([APP-ROUTER-PATHS.md](./APP-ROUTER-PATHS.md)).
- Map every capability to a Shared Service or feature module ([MODULE-MAP.md](./MODULE-MAP.md)).
- Public first-viewport homepage rules live in MES-005; CMS control in MES-013.
- Do not place Practice/Ask capabilities on the unauthenticated surface.`,
      acceptance: `- Documented surface map matches \`app/(public)\`, \`app/(dashboard)\`, \`app/(auth)\`.
- Module map covers MES-001→029 responsibilities.
- No Shared Service duplicated inside a feature.`,
      related: [
        R("Shared Services", "MES-002-Shared-Services.md"),
        R("Public Website", "MES-004-Public-Website.md"),
        R("Authentication", "MES-006-Authentication.md"),
        R("Module Map", "MODULE-MAP.md"),
      ],
    })
  );

  files.push(
    mes("MES-002", "MES-002-Shared-Services.md", "Shared Services & API Architecture", {
      purpose:
        "Specify the eight Shared Services every feature must call, and the canonical API response contract used by public and dashboard HTTP endpoints.",
      scope: `Service boundaries; ownership folders; request/response contract; error model; pagination meta; provider abstraction for AI; when to add a new Shared Service (rarely).`,
      dependencies: `- [MES-001-Foundation-Platform.md](./MES-001-Foundation-Platform.md)
- [MSEM-Appendix-A.md](./MSEM-Appendix-A.md)
- [API-STANDARDS.md](./API-STANDARDS.md)`,
      architecture: `### Shared Services

| Service | Folder | Consumers (examples) |
|---------|--------|----------------------|
| Content | \`services/content\` | Articles, guides, taxonomy, homepage |
| Recommendations | \`services/recommendations\` | Search, learning, analytics, public pages |
| AI | \`services/ai\` | AI Studio, Ask, media generation |
| Search | \`services/search\` | Public/admin search |
| Notification | \`services/notification\` | Billing, learning, system alerts |
| SEO | \`services/seo\` | Articles, guides, tools, homepage |
| Media | \`services/media\` | DAM, content editors |
| Settings | \`services/settings\` | AI config, feature flags, platform knobs |

### API contract
All \`app/api/public/*\` and \`app/api/dashboard/*\` handlers return:

\`\`\`ts
type ApiResponse<T> = {
  data: T | null;
  error: { code: string; message: string; details?: unknown } | null;
  meta?: Record<string, unknown>;
};
\`\`\`

Type source of truth: \`types/api.ts\` (see [API-STANDARDS.md](./API-STANDARDS.md)).`,
      implementation: `- Features import Shared Services; they do not copy provider SDKs into feature folders.
- AI providers (Claude, OpenAI, Gemini, Grok, DALL·E) are adapters under \`services/ai/providers\`.
- AI model/key/configuration persistence is **only** via Settings (MES-020).
- Recommendations ranking logic exists **only** in \`services/recommendations\` (MES-018).
- Prefer server-side calls for secrets-bearing providers.`,
      acceptance: `- Exactly eight Shared Service folders under \`services/\`.
- Every new dashboard/public route uses \`ApiResponse<T>\`.
- No feature ships a second recommendations or AI-config store.`,
      related: [
        R("API Standards", "API-STANDARDS.md"),
        R("Recommendations", "MES-018-Recommendation-Engine.md"),
        R("Platform Settings", "MES-020-Platform-Settings.md"),
        R("Dependency Map", "DEPENDENCY-MAP.md"),
      ],
    })
  );

  files.push(
    mes("MES-003", "MES-003-Design-System.md", "Design System", {
      purpose:
        "Define the visual and interaction system for Teaching Frontend and Dashboard so UI remains coherent as modules grow.",
      scope: `Tokens (color, type, space, motion), typography policy, component primitive ownership (\`components/ui\`), layout shells, accessibility targets, dark/light strategy if any, motion budget.`,
      dependencies: `- [MES-001-Foundation-Platform.md](./MES-001-Foundation-Platform.md)
- [CODING-STANDARDS.md](./CODING-STANDARDS.md)`,
      architecture: `### Ownership
- Tokens: \`styles/tokens.css\` (+ Tailwind theme mapping)
- Primitives: \`components/ui\`
- Layout shells: \`components/layout\`
- Feature composites: \`features/*/components\` (compose primitives; avoid new base controls)

### Surfaces
Public marketing/learning pages prioritize brand-forward composition (see MES-005). Dashboard prioritizes density, clarity, and keyboard efficiency.

### Accessibility
Target WCAG 2.2 AA for public and dashboard shells. Focus rings, contrast, and landmarks are required.`,
      implementation: `- Prefer existing primitives over new one-offs.
- Avoid purple-on-white / cream-terracotta clichés when inventing brand direction unless product brand explicitly requires them.
- Motion: intentional, limited (2–3 hero motions on promotional surfaces); respect \`prefers-reduced-motion\`.
- Do not put cards in the homepage hero (MES-005).`,
      acceptance: `- Token file documented and referenced by UI primitives.
- Shared layout components used by \`(public)\` and \`(dashboard)\` shells.
- No feature invents a parallel button/input system.`,
      related: [
        R("Premium Homepage", "MES-005-Premium-Homepage.md"),
        R("Admin Dashboard", "MES-007-Admin-Dashboard.md"),
        R("Coding Standards", "CODING-STANDARDS.md"),
      ],
    })
  );

  files.push(
    mes("MES-004", "MES-004-Public-Website.md", "Public Website Structure", {
      purpose:
        "Specify the public Teaching Frontend information architecture, route map, shared layout responsibilities, and content discovery paths.",
      scope: `Public IA for homepage, articles, guides, AI tools, categories, topics, search, pricing; shared public layout (nav/footer); SEO shell responsibilities deferred to MES-015 where detailed.`,
      dependencies: `- [MES-001-Foundation-Platform.md](./MES-001-Foundation-Platform.md)
- [MES-003-Design-System.md](./MES-003-Design-System.md)
- [APP-ROUTER-PATHS.md](./APP-ROUTER-PATHS.md)`,
      architecture: `### Primary public routes
| Path | Spec |
|------|------|
| \`/\` | MES-005 |
| \`/articles\`, \`/articles/[slug]\` | MES-025 |
| \`/guides\`, \`/guides/[slug]\` | MES-026 |
| \`/ai-tools\`, \`/ai-tools/[slug]\` | MES-027 |
| \`/categories\`, \`/topics\` | MES-009 (data) + public listing UX |
| \`/search\` | MES-017 |
| \`/pricing\` | MES-021 |

Folder root: \`app/(public)/\`.`,
      implementation: `- Public layout owns marketing nav composed from Navigation Shared Content (MES-016).
- Anonymous users can complete Learn/Discover/Explore without auth walls.
- CTAs may deep-link to auth or dashboard but must not block reading.
- Prefer SSR/RSC for SEO-critical pages.`,
      acceptance: `- Route map matches APP-ROUTER-PATHS public table.
- Shared public layout exists and wraps public pages.
- No dashboard-only controls leaked into public shell.`,
      related: [
        R("Premium Homepage", "MES-005-Premium-Homepage.md"),
        R("Public Articles", "MES-025-Public-Articles.md"),
        R("Navigation", "MES-016-Navigation-Management.md"),
      ],
    })
  );

  files.push(
    mes("MES-005", "MES-005-Premium-Homepage.md", "Premium Homepage Experience", {
      purpose:
        "Specify the public homepage experience as a single composition — brand-forward, performance-conscious, and driven by CMS content from MES-013.",
      scope: `First viewport composition; subsequent homepage sections; performance budgets; content slots; analytics hooks; motion guidance.`,
      dependencies: `- [MES-004-Public-Website.md](./MES-004-Public-Website.md)
- [MES-003-Design-System.md](./MES-003-Design-System.md)
- [MES-013-Homepage-Content-Management.md](./MES-013-Homepage-Content-Management.md)
- Content, Media, SEO Shared Services`,
      architecture: `### Feature ownership
- Public rendering: \`features/homepage-public\`
- CMS editing: \`features/homepage-management\` (MES-013) — kept separate

### First-viewport budget
Brand, one headline, one supporting sentence, one CTA group, one dominant visual. No stats strips, schedule cards, or promo chips in the hero.`,
      implementation: `- Fetch published homepage document via Content service.
- Images via Media service with explicit dimensions and modern formats.
- SEO fields via SEO service.
- Optional recommendation rails below the fold call MES-018 — never implement ranking locally.`,
      acceptance: `- Homepage renders from CMS-backed content, not hard-coded marketing copy alone.
- Lighthouse performance targets defined in MES-028 are met for \`/\`.
- CMS changes in MES-013 reflect on public homepage after publish.`,
      related: [
        R("Homepage CMS", "MES-013-Homepage-Content-Management.md"),
        R("Design System", "MES-003-Design-System.md"),
        R("Recommendations", "MES-018-Recommendation-Engine.md"),
      ],
    })
  );

  files.push(
    mes("MES-006", "MES-006-Authentication.md", "Authentication & User Management", {
      purpose:
        "Define the single session and identity contract for Mendanize — credentials, OAuth, session lifecycle, roles, and account recovery.",
      scope: `Sign-up/in/out; password reset; OAuth providers; session cookies; roles (learner, author, admin); profile basics; route protection.`,
      dependencies: `- [MES-001-Foundation-Platform.md](./MES-001-Foundation-Platform.md)
- [SECURITY-STANDARDS.md](./SECURITY-STANDARDS.md)
- Settings service for auth feature flags when needed`,
      outOfScope: `Billing entitlements (MES-021), notification email templates detail (MES-024).`,
      architecture: `### Ownership
- Feature: \`features/authentication\` — **sole session contract**
- Routes: \`app/(auth)/sign-in|sign-up|forgot-password|reset-password\`
- Middleware helpers: \`middleware/\`

### Session model
One Auth.js/NextAuth session across surfaces. Dashboard layouts require a valid session; public does not.`,
      implementation: `- No other feature may create a \`session/\` or \`auth/\` subfolder for session handling.
- Server Components/actions obtain session through the authentication feature helpers.
- Role checks for admin modules occur in dashboard layout/guards + API handlers.
- Rate-limit auth endpoints (Upstash or equivalent).`,
      acceptance: `- Sign-in/up/reset flows work end-to-end.
- Unauthenticated users cannot access dashboard routes.
- Exactly one session implementation path exists.`,
      related: [
        R("Admin Dashboard", "MES-007-Admin-Dashboard.md"),
        R("Security Standards", "SECURITY-STANDARDS.md"),
        R("Billing", "MES-021-Billing-Subscriptions.md"),
      ],
    })
  );

  files.push(
    mes("MES-007", "MES-007-Admin-Dashboard.md", "Admin Dashboard Foundation", {
      purpose:
        "Define the auth-gated dashboard shell: navigation, layout, home overview, permission-aware modules list, and patterns for nested admin pages.",
      scope: `Dashboard layout; sidebar/top nav; overview widgets; module entry points; loading/error boundaries; admin RBAC integration.`,
      dependencies: `- [MES-006-Authentication.md](./MES-006-Authentication.md)
- [MES-003-Design-System.md](./MES-003-Design-System.md)
- Content, Notification, Media, Settings services as needed for overview cards`,
      architecture: `### Ownership
- Feature: \`features/admin-dashboard\`
- Routes: \`app/(dashboard)/\` layout + \`/dashboard\` overview
- Nested admin content under \`/dashboard/*\` for public-name collisions`,
      implementation: `- Dashboard layout performs auth gate once; child pages assume session.
- Module links reflect role permissions.
- Prefer server-fetched overview metrics (MES-023) rather than client fan-out.
- Keep shell chrome in admin-dashboard; feature pages own their body UI.`,
      acceptance: `- Authenticated users land on a functional dashboard shell.
- Unauthorized roles cannot open admin CMS modules.
- Consistent loading/error UI across dashboard segments.`,
      related: [
        R("Article Management", "MES-008-Article-Management.md"),
        R("Analytics", "MES-023-Analytics.md"),
        R("App Router Paths", "APP-ROUTER-PATHS.md"),
      ],
    })
  );

  files.push(
    mes("MES-008", "MES-008-Article-Management.md", "Article Management System", {
      purpose:
        "Specify admin lifecycle for articles: create, edit, review, publish, unpublish, archive, and schedule.",
      scope: `Editor UX; statuses; authors; categories/topics association; media attach; SEO fields; draft autosave expectations.`,
      dependencies: `- [MES-007-Admin-Dashboard.md](./MES-007-Admin-Dashboard.md)
- [MES-009-Categories-Topics.md](./MES-009-Categories-Topics.md)
- Content, Media, SEO, Search Shared Services
- Public rendering: [MES-025](./MES-025-Public-Articles.md)`,
      architecture: `### Ownership
- Feature: \`features/articles\`
- Admin routes: \`/dashboard/articles\`
- Persistence via Content service / repositories — not direct ad-hoc SQL in UI`,
      implementation: `- Writes go through validated server actions + Content service.
- Publishing triggers search index update (Search service) and SEO snapshot.
- AI-assisted drafting may call AI service but config comes from MES-020.
- Recommendations are never computed here; public pages call MES-018.`,
      acceptance: `- Full article CRUD + publish pipeline works for authorized roles.
- Published articles appear on public routes (MES-025).
- Invalid payloads rejected by validators.`,
      related: [
        R("Public Articles", "MES-025-Public-Articles.md"),
        R("SEO Metadata", "MES-015-SEO-Metadata.md"),
        R("AI Studio", "MES-011-Admin-AI-Studio.md"),
      ],
    })
  );

  files.push(
    mes("MES-009", "MES-009-Categories-Topics.md", "Categories & Topics Management", {
      purpose:
        "Define taxonomy models and admin tooling for categories and topics used across articles, guides, and tools.",
      scope: `Category/topic CRUD; hierarchy rules; slug policy; assignment to content; public listing data contracts.`,
      dependencies: `- [MES-007-Admin-Dashboard.md](./MES-007-Admin-Dashboard.md)
- Content, SEO, Search Shared Services`,
      architecture: `### Ownership
- Feature: \`features/categories-topics\`
- Admin routes: \`/dashboard/categories\` (+ topics as nested or sibling UI)
- Public listings: \`/categories\`, \`/topics\` under \`(public)\``,
      implementation: `- Taxonomy is canonical in Content service.
- Deleting a category must define reassignment or block-if-in-use policy.
- Slugs immutable after publish preferred; redirects if changed.`,
      acceptance: `- Admins can manage taxonomy without orphaning content unexpectedly.
- Public listings resolve published taxonomy pages.
- Search facets can consume taxonomy IDs.`,
      related: [
        R("Articles Admin", "MES-008-Article-Management.md"),
        R("Learning Guides", "MES-010-Learning-Guides.md"),
        R("Search", "MES-017-Search-Discovery.md"),
      ],
    })
  );

  files.push(
    mes("MES-010", "MES-010-Learning-Guides.md", "Learning Guides Management", {
      purpose:
        "Specify admin management of structured learning guides (multi-step curricula) distinct from single articles.",
      scope: `Guide CRUD; ordered steps/lessons; prerequisites; publish lifecycle; media; SEO; relationship to articles/tools.`,
      dependencies: `- [MES-007-Admin-Dashboard.md](./MES-007-Admin-Dashboard.md)
- [MES-008-Article-Management.md](./MES-008-Article-Management.md) (for linked lessons when applicable)
- Content, Media, SEO, Search, Recommendations services
- Public: [MES-026](./MES-026-Public-Learning.md)`,
      architecture: `### Ownership
- Feature: \`features/learning-guides\`
- Admin routes: \`/dashboard/guides\`
- Learner progress owned by MES-022, not this CMS module.`,
      implementation: `- Guide structure stored via Content service.
- Step ordering is first-class; drag-and-drop UI may be added later without schema fork.
- Recommendations for “next guide” come from MES-018.`,
      acceptance: `- Admins publish guides visible on public learning routes.
- Step order persists correctly.
- No local recommendation engine inside this feature.`,
      related: [
        R("Public Learning", "MES-026-Public-Learning.md"),
        R("User Learning", "MES-022-User-Learning.md"),
        R("Recommendations", "MES-018-Recommendation-Engine.md"),
      ],
    })
  );

  files.push(
    mes("MES-011", "MES-011-Admin-AI-Studio.md", "Admin AI Studio", {
      purpose:
        "Specify the admin content-generation studio for drafting and refining content with multi-provider AI — without owning AI configuration.",
      scope: `Generation workflows for articles/outlines/images; provider selection UI that reads MES-020 config; prompt templates; output insertion into CMS.`,
      dependencies: `- [MES-007-Admin-Dashboard.md](./MES-007-Admin-Dashboard.md)
- [MES-020-Platform-Settings.md](./MES-020-Platform-Settings.md) — **sole AI configuration**
- AI, Content, Media Shared Services
- Distinct from tools CMS: [MES-012](./MES-012-AI-Tools-Management.md)`,
      outOfScope: `Storing API keys or default models locally — forbidden; use Settings service.`,
      architecture: `### Ownership
- Feature: \`features/ai-studio\`
- Route: \`/ai-studio\` (dashboard surface)
- Runtime calls: \`services/ai\` using config from \`services/settings\``,
      implementation: `- **Do not** create \`features/ai-studio/settings\` or \`config\` for AI keys/models.
- Log generations for analytics/usage (MES-023) without storing secrets.
- Respect plan/usage limits from billing entitlements when present (MES-021).`,
      acceptance: `- Operators can generate content using configured providers.
- Changing MES-020 settings changes Studio behaviour without code changes.
- No duplicated AI-config persistence in this module.`,
      related: [
        R("Platform Settings", "MES-020-Platform-Settings.md"),
        R("Ask Mendanize", "MES-019-Ask-Mendanize-AI.md"),
        R("AI Tools Management", "MES-012-AI-Tools-Management.md"),
      ],
    })
  );

  files.push(
    mes("MES-012", "MES-012-AI-Tools-Management.md", "AI Tools Management", {
      purpose:
        "Specify CMS for the AI tools directory entries (metadata, capabilities, links), distinct from AI Studio generation workflows.",
      scope: `Tool CRUD; categorization; status; media; SEO; relationship to public directory (MES-027).`,
      dependencies: `- [MES-007-Admin-Dashboard.md](./MES-007-Admin-Dashboard.md)
- AI, Content, Media, SEO, Settings services
- Public: [MES-027](./MES-027-Public-AI-Tools.md)`,
      architecture: `### Ownership
- Feature: \`features/ai-tools\`
- Admin routes: \`/dashboard/ai-tools\`
- Runtime tool execution may call AI service; catalog records live in Content.`,
      implementation: `- Keep catalog management separate from Studio prompts (MES-011).
- Public directory reads published tools only.
- Recommendations (“similar tools”) via MES-018.`,
      acceptance: `- Admins manage tool catalog end-to-end.
- Published tools appear on public AI tools routes.
- No second AI settings store.`,
      related: [
        R("Public AI Tools", "MES-027-Public-AI-Tools.md"),
        R("AI Studio", "MES-011-Admin-AI-Studio.md"),
        R("SEO Metadata", "MES-015-SEO-Metadata.md"),
      ],
    })
  );

  files.push(
    mes("MES-013", "MES-013-Homepage-Content-Management.md", "Homepage Content Management", {
      purpose:
        "Specify the CMS that editors use to control the public homepage experience defined in MES-005.",
      scope: `Homepage document model; section editors; publish/preview; media selection; SEO fields for \`/\`.`,
      dependencies: `- [MES-005-Premium-Homepage.md](./MES-005-Premium-Homepage.md)
- [MES-007-Admin-Dashboard.md](./MES-007-Admin-Dashboard.md)
- Content, Media, SEO, Settings services`,
      architecture: `### Ownership
- Feature: \`features/homepage-management\` (**separate from** \`features/homepage-public\`)
- Admin route: \`/homepage\` (dashboard surface)`,
      implementation: `- Preview must reflect public rendering rules of MES-005.
- Draft vs published states required.
- Do not hard-code homepage section logic only in the public feature — prefer shared content schema via Content service.`,
      acceptance: `- Editors can update and publish homepage content safely.
- Public homepage updates after publish.
- Invalid section configs blocked by validators.`,
      related: [
        R("Premium Homepage", "MES-005-Premium-Homepage.md"),
        R("Media Library", "MES-014-Media-Library.md"),
        R("SEO Metadata", "MES-015-SEO-Metadata.md"),
      ],
    })
  );

  files.push(
    mes("MES-014", "MES-014-Media-Library.md", "Media Library (DAM)", {
      purpose:
        "Specify the digital asset management experience and Media Shared Service integration for uploads, transforms, and reuse.",
      scope: `Upload; browse; tag; delete/archive; derivative generation; CDN/storage paths; attachment APIs for editors.`,
      dependencies: `- [MES-007-Admin-Dashboard.md](./MES-007-Admin-Dashboard.md)
- Media Shared Service (primary)
- AI service optional for generative images
- [SECURITY-STANDARDS.md](./SECURITY-STANDARDS.md)`,
      architecture: `### Ownership
- Feature UI: \`features/media-library\`
- Logic/storage: \`services/media\`
- Route: \`/media\``,
      implementation: `- Validate MIME/size server-side; virus scanning when available in prod.
- Store objects in Supabase Storage (or configured bucket); metadata in DB.
- Editors attach assets by ID — never by raw unverified URL alone for trusted content.`,
      acceptance: `- Authorized users upload and reuse assets in article/guide/homepage editors.
- Public pages resolve only published/allowed assets.
- Media service is the only storage abstraction.`,
      related: [
        R("Articles Admin", "MES-008-Article-Management.md"),
        R("Homepage CMS", "MES-013-Homepage-Content-Management.md"),
        R("Security Standards", "SECURITY-STANDARDS.md"),
      ],
    })
  );

  files.push(
    mes("MES-015", "MES-015-SEO-Metadata.md", "SEO & Metadata Management", {
      purpose:
        "Specify SEO metadata models, admin editing, and the SEO Shared Service used by all public entities.",
      scope: `Title/description/OG/canonical/robots; sitemap/robots.txt integration points; per-entity overrides; structured data hooks.`,
      dependencies: `- [MES-002-Shared-Services.md](./MES-002-Shared-Services.md)
- Content service for entity linkage
- Public pages MES-004/005/025–027`,
      architecture: `### Ownership
- Feature UI: \`features/seo\`
- Logic: \`services/seo\`
- Admin route: \`/seo\` (+ inline fields in editors)`,
      implementation: `- Every public entity resolves metadata through SEO service helpers.
- Defaults fall back sensibly when overrides missing.
- Sitemap generation aggregates published entities.`,
      acceptance: `- Editors can set and preview SEO fields.
- Public pages emit correct metadata tags.
- No per-feature divergent SEO schema.`,
      related: [
        R("Public Website", "MES-004-Public-Website.md"),
        R("Production Readiness", "MES-028-Production-Readiness.md"),
        R("Shared Services", "MES-002-Shared-Services.md"),
      ],
    })
  );

  return files;
}
