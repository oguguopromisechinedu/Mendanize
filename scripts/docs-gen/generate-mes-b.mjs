import { mesShell, writeDoc } from "./helpers.mjs";

const R = (label, file) => ({ label, file });

function mes(id, file, title, body) {
  return writeDoc(file, mesShell({ id, title, ...body }));
}

export function generateMesB() {
  const files = [];

  files.push(
    mes("MES-016", "MES-016-Navigation-Management.md", "Navigation & Menu Management", {
      purpose:
        "Specify CMS control of public and dashboard navigation menus, including structure, visibility rules, and publish workflow.",
      scope: `Menu trees; item types (link, route, external); role visibility; ordering; localization hooks if any.`,
      dependencies: `- [MES-007-Admin-Dashboard.md](./MES-007-Admin-Dashboard.md)
- Content + Settings Shared Services
- Consumed by [MES-004](./MES-004-Public-Website.md) public layout`,
      architecture: `### Ownership
- Feature: \`features/navigation\`
- Admin route: \`/navigation\`
- Runtime menus resolved via Content/Settings — cached for public layout`,
      implementation: `- Public nav reads published menu documents only.
- Dashboard nav may be code-defined + permission filtered (acceptable) or CMS-driven; document the chosen approach in implementation PRs.
- Guard against open-redirect external links (http(s) only).`,
      acceptance: `- Editors can update public navigation without deploys.
- Invalid trees rejected by validators.
- Public layout consumes the published menu.`,
      related: [
        R("Public Website", "MES-004-Public-Website.md"),
        R("Admin Dashboard", "MES-007-Admin-Dashboard.md"),
        R("Security Standards", "SECURITY-STANDARDS.md"),
      ],
    })
  );

  files.push(
    mes("MES-017", "MES-017-Search-Discovery.md", "Search & Discovery Engine", {
      purpose:
        "Specify search UX and the Search Shared Service integration for query, filters, facets, and empty states — while deferring recommendations to MES-018.",
      scope: `Public search page; admin search settings; indexing triggers; query parsing; result types (articles, guides, tools).`,
      dependencies: `- Search Shared Service
- [MES-018-Recommendation-Engine.md](./MES-018-Recommendation-Engine.md) for related/suggested results
- Content service as source of truth for documents`,
      outOfScope: `Recommendation ranking algorithms — owned exclusively by MES-018.`,
      architecture: `### Ownership
- Feature UI: \`features/search\`
- Logic: \`services/search\`
- Routes: public \`/search\`; admin \`/search-settings\``,
      implementation: `- **Do not** implement recommendations inside \`features/search\`.
- Index updates fire on publish/unpublish events from Content.
- Rate-limit abusive query patterns.`,
      acceptance: `- Users can search and filter published content.
- Zero-result states offer MES-018 suggestions when configured.
- Admin can adjust searchable fields/weights via settings without forking the engine.`,
      related: [
        R("Recommendations", "MES-018-Recommendation-Engine.md"),
        R("Platform Settings", "MES-020-Platform-Settings.md"),
        R("Public Website", "MES-004-Public-Website.md"),
      ],
    })
  );

  files.push(
    mes("MES-018", "MES-018-Recommendation-Engine.md", "Recommendation Engine", {
      purpose:
        "Define the **only** recommendation implementation in the codebase: ranking inputs, APIs, and consumer contracts for all surfaces.",
      scope: `Similarity, popularity, personalization hooks, cold-start behaviour, caching, explainability metadata.`,
      dependencies: `- [MES-002-Shared-Services.md](./MES-002-Shared-Services.md)
- Content service for candidate entities
- Optional learning signals from [MES-022](./MES-022-User-Learning.md)`,
      architecture: `### Ownership
- Logic: \`services/recommendations\` — **sole implementation**
- Feature UI (optional admin previews): \`features/recommendations\`
- Consumers: search, learning, analytics, public article/guide/tool pages

### API sketch
\`getRecommendations({ surface, entityType, entityId?, userId?, limit }) → ApiResponse<Recommendation[]>\``,
      implementation: `- Features/search, user-learning, analytics, and public pages **call** this service; they must not ship local rankers.
- Personalization must degrade gracefully for anonymous users.
- Cache aggressively for anonymous popularity lists.`,
      acceptance: `- Single recommendations folder under \`services/\`.
- All listed consumers integrate without local ranking code.
- Cold-start returns sensible popular/editorial fallbacks.`,
      related: [
        R("Search", "MES-017-Search-Discovery.md"),
        R("User Learning", "MES-022-User-Learning.md"),
        R("Public Articles", "MES-025-Public-Articles.md"),
        R("Dependency Map", "DEPENDENCY-MAP.md"),
      ],
    })
  );

  files.push(
    mes("MES-019", "MES-019-Ask-Mendanize-AI.md", "Ask Mendanize AI", {
      purpose:
        "Specify Tier 1 (public widget) and Tier 2 (dashboard workspace) AI assistant experiences, both reading AI configuration exclusively from MES-020.",
      scope: `Chat UX; grounding in published content; safety filters; rate limits; history for authenticated users; provider routing.`,
      dependencies: `- [MES-020-Platform-Settings.md](./MES-020-Platform-Settings.md) — **sole AI configuration**
- AI, Content, Recommendations Shared Services
- Auth for Tier 2 ([MES-006](./MES-006-Authentication.md))`,
      outOfScope: `Local settings/config folders under this feature — forbidden.`,
      architecture: `### Ownership
- Feature: \`features/ask-mendanize\` (both tiers)
- Dashboard route: \`/ask\`
- Public widget mounts on Teaching Frontend layouts as configured`,
      implementation: `- Call \`services/ai\` with Settings-derived model/provider choices.
- Prefer RAG over published Content; never invent unpaid gated content.
- Tier 1 stricter/safer; Tier 2 may allow longer context for members.
- Recommendations may suggest follow-up reading via MES-018.`,
      acceptance: `- Tier 1 available without auth when enabled.
- Tier 2 requires session.
- Provider/model changes via MES-020 apply without code changes.
- No AI-config duplication.`,
      related: [
        R("Platform Settings", "MES-020-Platform-Settings.md"),
        R("AI Studio", "MES-011-Admin-AI-Studio.md"),
        R("Security Standards", "SECURITY-STANDARDS.md"),
      ],
    })
  );

  files.push(
    mes("MES-020", "MES-020-Platform-Settings.md", "Platform Settings & Configuration", {
      purpose:
        "Specify the **only** platform settings and AI-configuration storage location — defaults, provider keys references, feature flags, and operational knobs.",
      scope: `AI provider enablement; default models; feature flags; site-wide settings; secrets references (not plaintext in DB when vault/env preferred).`,
      dependencies: `- [MES-002-Shared-Services.md](./MES-002-Shared-Services.md)
- [SECURITY-STANDARDS.md](./SECURITY-STANDARDS.md)
- [ENVIRONMENT.md](./ENVIRONMENT.md)`,
      architecture: `### Ownership
- Feature UI: \`features/platform-settings\`
- Persistence/accessors: \`services/settings\` (+ \`ai-config.ts\`)
- Admin route: \`/settings\` (dashboard)

### Consumers that must not fork config
MES-011 AI Studio, MES-019 Ask Mendanize, MES-012 tool runners, any AI caller.`,
      implementation: `- Store secret values in environment/secret manager; DB holds non-secret preferences and key *references* where needed.
- Expose typed getters for AI config used by \`services/ai\`.
- Audit log setting changes for admin actions.`,
      acceptance: `- Single settings owner confirmed by MODULE-MAP.
- AI Studio and Ask import settings; no local config modules.
- Unauthorized users cannot read secret-bearing settings.`,
      related: [
        R("Shared Services", "MES-002-Shared-Services.md"),
        R("AI Studio", "MES-011-Admin-AI-Studio.md"),
        R("Ask Mendanize", "MES-019-Ask-Mendanize-AI.md"),
        R("Environment", "ENVIRONMENT.md"),
      ],
    })
  );

  files.push(
    mes("MES-021", "MES-021-Billing-Subscriptions.md", "Billing & Subscriptions", {
      purpose:
        "Specify plans, Stripe integration, entitlements, customer portal, and the public pricing page.",
      scope: `Plan catalog; checkout; webhooks; customer portal; entitlement checks; invoices; public \`/pricing\`.`,
      dependencies: `- [MES-006-Authentication.md](./MES-006-Authentication.md)
- Settings + Notification services
- [SECURITY-STANDARDS.md](./SECURITY-STANDARDS.md)
- [ENVIRONMENT.md](./ENVIRONMENT.md) for Stripe keys`,
      architecture: `### Ownership
- Feature: \`features/billing\`
- Public pricing: \`app/(public)/pricing\` (or migrated legacy route)
- Dashboard billing: \`/billing\`
- Stripe webhook under secured API route`,
      implementation: `- Verify Stripe webhooks with signing secret.
- Entitlements gate AI usage / premium content as product defines.
- Never trust client-reported plan state; derive from Stripe + DB.`,
      acceptance: `- Users can view plans, checkout, and manage subscription.
- Webhooks update entitlements reliably.
- Public pricing page reflects plan catalog.`,
      related: [
        R("Authentication", "MES-006-Authentication.md"),
        R("Notifications", "MES-024-Notifications.md"),
        R("Production Readiness", "MES-028-Production-Readiness.md"),
      ],
    })
  );

  files.push(
    mes("MES-022", "MES-022-User-Learning.md", "User Learning & Personalization", {
      purpose:
        "Specify the authenticated learner dashboard: progress, bookmarks, continue-learning, and personalization — distinct from authentication itself.",
      scope: `Progress tracking; bookmarks; goals; continue rails; preference capture.`,
      dependencies: `- [MES-006-Authentication.md](./MES-006-Authentication.md)
- Content + Recommendations (MES-018) services
- Guide public experience [MES-026](./MES-026-Public-Learning.md)`,
      outOfScope: `Recommendation ranking — call MES-018 only.`,
      architecture: `### Ownership
- Feature: \`features/user-learning\`
- Route: \`/learning\`
- Progress events written via feature actions → Content/learning repositories`,
      implementation: `- Do not create a recommendations sub-engine.
- Anonymous personalization is limited; full dashboard requires auth.
- Emit analytics events to MES-023 pipeline where applicable.`,
      acceptance: `- Learners see accurate progress and continue rails.
- Recommendations come from Shared Service only.
- No session handling fork (use MES-006).`,
      related: [
        R("Recommendations", "MES-018-Recommendation-Engine.md"),
        R("Learning Guides Admin", "MES-010-Learning-Guides.md"),
        R("Public Learning", "MES-026-Public-Learning.md"),
      ],
    })
  );

  files.push(
    mes("MES-023", "MES-023-Analytics.md", "Analytics & Insights Platform", {
      purpose:
        "Specify product analytics capture, admin insights dashboards, and privacy-aware aggregation.",
      scope: `Event taxonomy; dashboards; content performance; AI usage metrics; export hooks.`,
      dependencies: `- [MES-007-Admin-Dashboard.md](./MES-007-Admin-Dashboard.md)
- Content service; Recommendations (for insight widgets only)
- [SECURITY-STANDARDS.md](./SECURITY-STANDARDS.md)`,
      architecture: `### Ownership
- Feature: \`features/analytics\`
- Route: \`/analytics\` (or \`/dashboard/analytics\`)
- Prefer first-party events + Vercel Analytics where configured`,
      implementation: `- Do not embed a local recommendations algorithm for “suggested content” widgets — call MES-018.
- PII minimization: aggregate where possible.
- Admin-only access for sensitive metrics.`,
      acceptance: `- Key funnels visible to admins.
- Event names documented and stable.
- No unauthorized access to analytics APIs.`,
      related: [
        R("Production Readiness", "MES-028-Production-Readiness.md"),
        R("Recommendations", "MES-018-Recommendation-Engine.md"),
        R("Admin Dashboard", "MES-007-Admin-Dashboard.md"),
      ],
    })
  );

  files.push(
    mes("MES-024", "MES-024-Notifications.md", "Notification & Communication System", {
      purpose:
        "Specify in-app notifications, email communications, and the Notification Shared Service.",
      scope: `Notification center UI; email templates; preference center; delivery providers; event triggers from billing/learning/system.`,
      dependencies: `- Notification Shared Service
- [MES-006-Authentication.md](./MES-006-Authentication.md)
- Templates under \`emails/\`
- Settings for provider configuration`,
      architecture: `### Ownership
- Feature UI: \`features/notifications\`
- Logic: \`services/notification\`
- Route: \`/notifications\`
- Templates: \`emails/\``,
      implementation: `- All outbound email goes through Notification service.
- Respect user preferences and unsubscribe.
- Idempotent delivery for webhook-driven notices.`,
      acceptance: `- Users receive and can manage notifications.
- Email templates render consistently.
- No ad-hoc nodemailer calls from random features.`,
      related: [
        R("Billing", "MES-021-Billing-Subscriptions.md"),
        R("Platform Settings", "MES-020-Platform-Settings.md"),
        R("Security Standards", "SECURITY-STANDARDS.md"),
      ],
    })
  );

  files.push(
    mes("MES-025", "MES-025-Public-Articles.md", "Public Article Experience", {
      purpose:
        "Specify the public article reading experience: listing, detail, TOC, related content, and SEO rendering.",
      scope: `\`/articles\` index; \`/articles/[slug]\` detail; reading UX; related rails; share metadata.`,
      dependencies: `- [MES-004-Public-Website.md](./MES-004-Public-Website.md)
- [MES-008-Article-Management.md](./MES-008-Article-Management.md) for CMS source
- Content, SEO, Media, Recommendations (MES-018)`,
      architecture: `### Ownership
- Routes: \`app/(public)/articles\`
- Presentation may live in \`features/articles/components\` (read-only) or shared public components — prefer shared read components without importing admin editors.`,
      implementation: `- Related articles via MES-018 only.
- 404 for unpublished/unknown slugs.
- Structured data + metadata via SEO service.`,
      acceptance: `- Published articles render with correct SEO and media.
- Related rail uses Shared Recommendations service.
- Performance acceptable per MES-028 budgets.`,
      related: [
        R("Article Management", "MES-008-Article-Management.md"),
        R("Recommendations", "MES-018-Recommendation-Engine.md"),
        R("SEO Metadata", "MES-015-SEO-Metadata.md"),
      ],
    })
  );

  files.push(
    mes("MES-026", "MES-026-Public-Learning.md", "Public Learning Guide Experience", {
      purpose:
        "Specify the public learning-guide consumption experience for Discover/Learn journeys.",
      scope: `Guide index/detail; step navigation; CTA to authenticated progress (MES-022); SEO.`,
      dependencies: `- [MES-010-Learning-Guides.md](./MES-010-Learning-Guides.md)
- [MES-022-User-Learning.md](./MES-022-User-Learning.md)
- Content, SEO, Media, Recommendations`,
      architecture: `### Ownership
- Routes: \`app/(public)/guides\`
- Progress persistence requires auth via MES-022`,
      implementation: `- Anonymous users can read; saving progress prompts auth.
- Next-step suggestions from MES-018.
- Do not embed admin editor UI on public routes.`,
      acceptance: `- Published guides readable end-to-end.
- Auth handoff to \`/learning\` works.
- Recommendations not duplicated locally.`,
      related: [
        R("Learning Guides Admin", "MES-010-Learning-Guides.md"),
        R("User Learning", "MES-022-User-Learning.md"),
        R("Recommendations", "MES-018-Recommendation-Engine.md"),
      ],
    })
  );

  files.push(
    mes("MES-027", "MES-027-Public-AI-Tools.md", "Public AI Tools Directory", {
      purpose:
        "Specify the public AI tools directory experience for Explore journeys.",
      scope: `Tools index/detail; filters; SEO; CTAs into authenticated tool runners when required.`,
      dependencies: `- [MES-012-AI-Tools-Management.md](./MES-012-AI-Tools-Management.md)
- Content, SEO, Media, AI, Recommendations, Settings`,
      architecture: `### Ownership
- Routes: \`app/(public)/ai-tools\`
- Execution of gated tools may require auth + entitlements (MES-006/021)`,
      implementation: `- Catalog from published CMS records.
- Similar tools via MES-018.
- AI execution uses Settings-configured providers (MES-020).`,
      acceptance: `- Directory lists published tools with working detail pages.
- Gated actions enforce auth/plan rules.
- No local recommendations/config forks.`,
      related: [
        R("AI Tools Management", "MES-012-AI-Tools-Management.md"),
        R("Billing", "MES-021-Billing-Subscriptions.md"),
        R("Ask Mendanize", "MES-019-Ask-Mendanize-AI.md"),
      ],
    })
  );

  files.push(
    mes("MES-028", "MES-028-Production-Readiness.md", "Production Readiness", {
      purpose:
        "Define hardening, observability, performance, compliance, and operational requirements required before production traffic.",
      scope: `Logging; metrics; error tracking; rate limits; backups; CI checks; performance budgets; secret management; uptime.`,
      dependencies: `- [SECURITY-STANDARDS.md](./SECURITY-STANDARDS.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ENVIRONMENT.md](./ENVIRONMENT.md)
- All feature MES for surface coverage`,
      architecture: `### Ownership
- Cross-cutting: \`config/\`, \`middleware/\`, \`scripts/\`, \`tests/\`
- No single feature owns production readiness`,
      implementation: `- Enforce lint/typecheck/test in CI.
- Configure rate limits on auth, AI, and search endpoints.
- Database backups and migration strategy documented.
- Health checks and structured logs required.`,
      acceptance: `- CI green on main.
- Secrets only via environment/secret manager.
- Performance budgets for homepage and article detail defined and measured.
- Incident runbooks linked from DEPLOYMENT.`,
      related: [
        R("Final QA", "MES-029-Final-QA.md"),
        R("Deployment", "DEPLOYMENT.md"),
        R("Security Standards", "SECURITY-STANDARDS.md"),
      ],
    })
  );

  files.push(
    mes("MES-029", "MES-029-Final-QA.md", "Final QA & Production Launch", {
      purpose:
        "Define the go/no-go QA protocol, launch checklist, and sign-off matrix for production release.",
      scope: `Test plans; accessibility audit; SEO smoke; billing sandbox; AI safety smoke; rollback plan; launch communications.`,
      dependencies: `- [MES-028-Production-Readiness.md](./MES-028-Production-Readiness.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- End-to-end coverage across MES-004–027`,
      architecture: `### Ownership
- QA artifacts under \`tests/\`
- Launch scripts under \`scripts/\`
- Sign-off tracked in CHANGELOG release notes`,
      implementation: `- Execute public smoke (home, article, guide, tool, search, pricing).
- Execute auth + dashboard smoke (sign-in, articles CMS, settings).
- Execute billing test mode checkout + webhook.
- Execute Ask Tier 1/Tier 2 safety prompts.
- Record evidence before go-live.`,
      acceptance: `- Checklist 100% complete or explicitly waived with owner.
- Rollback procedure rehearsed.
- CHANGELOG entry published for the release.`,
      related: [
        R("Production Readiness", "MES-028-Production-Readiness.md"),
        R("Changelog", "CHANGELOG.md"),
        R("Deployment", "DEPLOYMENT.md"),
      ],
    })
  );

  return files;
}
