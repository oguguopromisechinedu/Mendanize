import { frontMatter, section, writeDoc, refs, VERSION } from "./helpers.mjs";

export function generateCore() {
  const files = [];

  files.push(
    writeDoc(
      "README.md",
      `${frontMatter({ title: "Mendanize Engineering Documentation" })}
${section(
  "Purpose",
  `This directory is the **single source of truth** for the Mendanize platform. All product architecture, shared services, feature modules, API contracts, security rules, and delivery standards are defined here before application code is written or changed.`
)}
${section(
  "Documentation Structure",
  `| Layer | Documents | Role |
|-------|-----------|------|
| Entry | [README.md](./README.md), [MES-INDEX.md](./MES-INDEX.md) | Orientation and execution order |
| Meta standards | [MSEM.md](./MSEM.md), [MSEM-Appendix-A.md](./MSEM-Appendix-A.md) | Binding engineering rules for every module |
| Module specs | [MES-001](./MES-001-Foundation-Platform.md)–[MES-029](./MES-029-Final-QA.md) | Feature and platform specifications |
| Cross-cutting | [API-STANDARDS.md](./API-STANDARDS.md), [SECURITY-STANDARDS.md](./SECURITY-STANDARDS.md), [CODING-STANDARDS.md](./CODING-STANDARDS.md), [DATABASE.md](./DATABASE.md) | Contracts applied to all modules |
| Operations | [ENVIRONMENT.md](./ENVIRONMENT.md), [DEPLOYMENT.md](./DEPLOYMENT.md), [CHANGELOG.md](./CHANGELOG.md) | Runtime and release |
| Maps | [MODULE-MAP.md](./MODULE-MAP.md), [DEPENDENCY-MAP.md](./DEPENDENCY-MAP.md), [APP-ROUTER-PATHS.md](./APP-ROUTER-PATHS.md) | Structure and dependency graph |`
)}
${section(
  "Document Hierarchy",
  `1. **MSEM + Appendix A** — highest authority for engineering patterns (layers, Shared Services, no-duplication rules).
2. **MES-001 / MES-002** — platform foundation and Shared Services topology.
3. **MES-003–MES-029** — surface and feature modules; must defer to higher authority when overlap exists.
4. **Cross-cutting standards** (API, Security, Coding, Database) — apply to every implementation.
5. **Maps / Environment / Deployment** — operational reality of the repo.

If two documents conflict, resolve in this order: Appendix A → MES-002 Shared Services → the more foundational MES number → the feature MES.`
)}
${section(
  "Document Priority",
  `| Priority | Document set | When it wins |
|----------|--------------|--------------|
| P0 | MSEM-Appendix-A, MES-002, API-STANDARDS, SECURITY-STANDARDS | Always |
| P1 | MES-001, MES-006, MES-018, MES-020 | Session, recommendations, AI config ownership |
| P2 | Feature MES (007–017, 019, 021–027) | Feature-local behaviour |
| P3 | MES-028 / MES-029, DEPLOYMENT | Launch gates |
| P4 | CHANGELOG | Historical record |`
)}
${section(
  "Engineering Workflow",
  `1. Read [MES-INDEX.md](./MES-INDEX.md) for execution order.
2. Read [MSEM-Appendix-A.md](./MSEM-Appendix-A.md) and [MES-002-Shared-Services.md](./MES-002-Shared-Services.md).
3. Read the target feature MES and every document it lists under Dependencies.
4. Confirm ownership in [MODULE-MAP.md](./MODULE-MAP.md) and [DEPENDENCY-MAP.md](./DEPENDENCY-MAP.md).
5. Implement only in the mapped folders (\`features/*\`, \`services/*\`, \`app/*\`).
6. Never reimplement Shared Services inside a feature.
7. Update [CHANGELOG.md](./CHANGELOG.md) when a MES version changes.`
)}
${section(
  "How Cursor (and any agent) Must Use These Specs",
  `Before writing production code:

1. **Do not invent architecture.** If behaviour is unspecified, stop and extend the relevant MES document first.
2. **Resolve Shared Service ownership.** Content, Recommendations, AI, Search, Notification, SEO, Media, and Settings live under \`/services\` only ([MES-002](./MES-002-Shared-Services.md)).
3. **Respect single contracts:**
   - Session/auth → [MES-006](./MES-006-Authentication.md) / \`features/authentication\`
   - Recommendations → [MES-018](./MES-018-Recommendation-Engine.md) / \`services/recommendations\`
   - AI configuration → [MES-020](./MES-020-Platform-Settings.md) / \`services/settings\`
   - API responses → [API-STANDARDS.md](./API-STANDARDS.md) \`{ data, error, meta }\`
4. **Honour the two-surface App Router layout** ([APP-ROUTER-PATHS.md](./APP-ROUTER-PATHS.md)): public Teaching Frontend vs auth-gated Dashboard.
5. **Scaffold before features** only when the MES phase explicitly allows structure work; never skip reading Dependencies.
6. **Prefer updating docs over contradicting them** when requirements change.`
)}
${section(
  "Versioning",
  `Documentation set version: **${VERSION}**. Individual MES files carry their own version field. Breaking architectural changes require a minor/major bump on both the affected MES and this README.`
)}
${section(
  "Related Documents",
  refs([
    { label: "MES Index", file: "MES-INDEX.md" },
    { label: "MSEM", file: "MSEM.md" },
    { label: "Module Map", file: "MODULE-MAP.md" },
  ])
)}`
    )
  );

  files.push(
    writeDoc(
      "MES-INDEX.md",
      `${frontMatter({ title: "MES Index — Execution Order" })}
${section(
  "Purpose",
  `Define the authoritative reading and implementation order for every Mendanize Engineering Specification (MES). Agents and engineers must follow this sequence when onboarding, scaffolding, or delivering features.`
)}
${section(
  "Scope",
  `Covers MES-001 through MES-029 plus binding meta documents (MSEM, Appendix A). Does not define feature behaviour — each linked MES owns that detail.`
)}
${section(
  "Dependencies",
  `- [MSEM.md](./MSEM.md)
- [MSEM-Appendix-A.md](./MSEM-Appendix-A.md)`
)}
${section(
  "Execution Order",
  `| Order | Document | Responsibility |
|------:|----------|----------------|
| 0 | [MSEM.md](./MSEM.md) | Platform engineering manifesto and governance |
| 0a | [MSEM-Appendix-A.md](./MSEM-Appendix-A.md) | Binding standards (layers, Shared Services, quality gates) |
| 1 | [MES-001-Foundation-Platform.md](./MES-001-Foundation-Platform.md) | Product vision, two-surface architecture, platform goals |
| 2 | [MES-002-Shared-Services.md](./MES-002-Shared-Services.md) | Eight Shared Services and API response contract |
| 3 | [MES-003-Design-System.md](./MES-003-Design-System.md) | Visual language, tokens, component primitives |
| 4 | [MES-004-Public-Website.md](./MES-004-Public-Website.md) | Public Teaching Frontend information architecture |
| 5 | [MES-005-Premium-Homepage.md](./MES-005-Premium-Homepage.md) | Public homepage experience |
| 6 | [MES-006-Authentication.md](./MES-006-Authentication.md) | Single session and identity contract |
| 7 | [MES-007-Admin-Dashboard.md](./MES-007-Admin-Dashboard.md) | Auth-gated dashboard foundation and shell |
| 8 | [MES-008-Article-Management.md](./MES-008-Article-Management.md) | Admin article lifecycle |
| 9 | [MES-009-Categories-Topics.md](./MES-009-Categories-Topics.md) | Taxonomy management |
| 10 | [MES-010-Learning-Guides.md](./MES-010-Learning-Guides.md) | Admin learning-guide management |
| 11 | [MES-011-Admin-AI-Studio.md](./MES-011-Admin-AI-Studio.md) | Admin AI content generation (uses MES-020 config) |
| 12 | [MES-012-AI-Tools-Management.md](./MES-012-AI-Tools-Management.md) | AI tools directory CMS |
| 13 | [MES-013-Homepage-Content-Management.md](./MES-013-Homepage-Content-Management.md) | Homepage CMS (controls MES-005) |
| 14 | [MES-014-Media-Library.md](./MES-014-Media-Library.md) | DAM for all surfaces |
| 15 | [MES-015-SEO-Metadata.md](./MES-015-SEO-Metadata.md) | SEO metadata management |
| 16 | [MES-016-Navigation-Management.md](./MES-016-Navigation-Management.md) | Menu and navigation CMS |
| 17 | [MES-017-Search-Discovery.md](./MES-017-Search-Discovery.md) | Search UX (uses MES-018 for recommendations) |
| 18 | [MES-018-Recommendation-Engine.md](./MES-018-Recommendation-Engine.md) | Sole recommendation implementation |
| 19 | [MES-019-Ask-Mendanize-AI.md](./MES-019-Ask-Mendanize-AI.md) | Public + dashboard AI assistant (uses MES-020) |
| 20 | [MES-020-Platform-Settings.md](./MES-020-Platform-Settings.md) | Sole AI / platform configuration store |
| 21 | [MES-021-Billing-Subscriptions.md](./MES-021-Billing-Subscriptions.md) | Plans, Stripe, public pricing |
| 22 | [MES-022-User-Learning.md](./MES-022-User-Learning.md) | Learner personalization dashboard |
| 23 | [MES-023-Analytics.md](./MES-023-Analytics.md) | Analytics and insights |
| 24 | [MES-024-Notifications.md](./MES-024-Notifications.md) | Notification and communication system |
| 25 | [MES-025-Public-Articles.md](./MES-025-Public-Articles.md) | Public article reading experience |
| 26 | [MES-026-Public-Learning.md](./MES-026-Public-Learning.md) | Public learning-guide experience |
| 27 | [MES-027-Public-AI-Tools.md](./MES-027-Public-AI-Tools.md) | Public AI tools directory |
| 28 | [MES-028-Production-Readiness.md](./MES-028-Production-Readiness.md) | Observability, hardening, ops readiness |
| 29 | [MES-029-Final-QA.md](./MES-029-Final-QA.md) | Launch QA and go/no-go gates |`
)}
${section(
  "Cross-Reference Rule",
  `When a later MES defers to an earlier one (for example MES-011 and MES-019 defer to MES-020 for AI configuration), **do not duplicate** that logic in the later module. Implement once at the owning location listed in [MODULE-MAP.md](./MODULE-MAP.md).`
)}
${section(
  "Implementation Notes",
  `- Read Appendix A before any feature MES.
- Prefer [DEPENDENCY-MAP.md](./DEPENDENCY-MAP.md) when planning multi-module work.
- Public experiences (025–027) consume Content/SEO/Recommendations Shared Services; they do not own CMS behaviour (008–013).`
)}
${section(
  "Related Documents",
  refs([
    { label: "Documentation README", file: "README.md" },
    { label: "Module Map", file: "MODULE-MAP.md" },
    { label: "Dependency Map", file: "DEPENDENCY-MAP.md" },
  ])
)}`
    )
  );

  files.push(
    writeDoc(
      "MSEM.md",
      `${frontMatter({ title: "Mendanize Software Engineering Manifesto (MSEM)" })}
${section(
  "Purpose",
  `Establish the governing principles for how Mendanize is designed, built, tested, and evolved. MSEM is the parent of all MES documents.`
)}
${section(
  "Scope",
  `Applies to every engineer, agent, and contractor contributing to the Mendanize monorepo. Detailed norms live in [MSEM-Appendix-A.md](./MSEM-Appendix-A.md).`
)}
${section(
  "Dependencies",
  `None — this document is foundational. All MES documents depend on MSEM and Appendix A.`
)}
${section(
  "Platform Thesis",
  `Mendanize is an AI-native learning and content platform with two primary surfaces:

1. **Teaching Frontend (public)** — Learn / Discover / Explore without requiring authentication.
2. **Dashboard (auth-gated)** — Practice / Ask / Create / Administer for signed-in users and operators.

These surfaces share data and Shared Services but intentionally separate routing, layouts, and permission boundaries.`
)}
${section(
  "Core Principles",
  `1. **Specification first** — Documentation in \`docs/\` precedes production code.
2. **Shared Services over duplication** — Cross-cutting capabilities are implemented once under \`/services\`.
3. **Feature modules orchestrate** — \`/features/*\` may orchestrate Shared Services; they must not fork them.
4. **Single contracts** — One API shape, one session model, one recommendations engine, one AI-configuration store.
5. **Security by default** — AuthZ checks at the edge of every dashboard API and server action.
6. **Accessibility and SEO are product features** — not optional polish.
7. **Observability is mandatory** before production (MES-028).
8. **Prefer clarity over cleverness** in folder structure and naming.`
)}
${section(
  "Governance",
  `- Architectural changes that alter Shared Service boundaries require an MES update before merge.
- Breaking API contract changes require version notes in [API-STANDARDS.md](./API-STANDARDS.md) and [CHANGELOG.md](./CHANGELOG.md).
- Appendix A is binding on every feature scaffold and pull request review.`
)}
${section(
  "Implementation Notes",
  `- Stack baseline: Next.js App Router, React, TypeScript, Prisma, PostgreSQL (Supabase), Auth.js/NextAuth, Stripe, multi-provider AI clients.
- Folder ownership is fixed in [MODULE-MAP.md](./MODULE-MAP.md).
- Agents must refuse feature work that contradicts MSEM or Appendix A.`
)}
${section(
  "Related Documents",
  refs([
    { label: "Appendix A — Engineering Standards", file: "MSEM-Appendix-A.md" },
    { label: "MES Index", file: "MES-INDEX.md" },
    { label: "Coding Standards", file: "CODING-STANDARDS.md" },
  ])
)}`
    )
  );

  files.push(
    writeDoc(
      "MSEM-Appendix-A.md",
      `${frontMatter({ title: "MSEM Appendix A — Engineering Standards" })}
${section(
  "Purpose",
  `Provide the binding engineering standards referenced by every MES instead of restating them in each module. Treat this appendix as law for scaffolding and implementation.`
)}
${section(
  "Scope",
  `Application layers, Shared Services usage, routing conventions, reusable components, database access, API shape, authentication boundaries, permissions, testing expectations, and code organization.`
)}
${section(
  "Dependencies",
  `- [MSEM.md](./MSEM.md)
- [MES-002-Shared-Services.md](./MES-002-Shared-Services.md)
- [API-STANDARDS.md](./API-STANDARDS.md)
- [SECURITY-STANDARDS.md](./SECURITY-STANDARDS.md)
- [CODING-STANDARDS.md](./CODING-STANDARDS.md)`
)}
${section(
  "Application Layers",
  `| Layer | Location | Responsibility |
|-------|----------|----------------|
| Presentation | \`app/\`, \`features/*/components\` | Routes, layouts, UI |
| Feature orchestration | \`features/*/services\`, \`features/*/actions\` | Use-cases; call Shared Services |
| Shared Services | \`services/*\` | Reusable domain capabilities |
| Data access | \`repositories/\`, Prisma | Persistence only |
| Cross-cutting | \`middleware/\`, \`lib/\`, \`validators/\` | Auth helpers, utilities, schemas |
| State | \`stores/\`, \`contexts/\` | Client state when necessary |

**Rule:** UI never talks to Prisma directly. Features never reimplement Shared Services.`
)}
${section(
  "Shared Services (Mandatory)",
  `Exactly eight Shared Services exist ([MES-002](./MES-002-Shared-Services.md)):

1. Content  
2. Recommendations  
3. AI (Claude, OpenAI, Gemini, Grok, DALL·E)  
4. Search  
5. Notification  
6. SEO  
7. Media  
8. Settings  

Feature modules may wrap them; they may not fork them.`
)}
${section(
  "No-Duplication Contracts",
  `| Concern | Sole owner | Forbidden |
|---------|------------|-----------|
| AI configuration | \`features/platform-settings\` + \`services/settings\` | Settings folders under AI Studio or Ask Mendanize |
| Recommendations | \`services/recommendations\` | Per-feature recommenders |
| Session / auth | \`features/authentication\` | Feature-local session modules |
| API response shape | [API-STANDARDS.md](./API-STANDARDS.md) | Ad-hoc JSON envelopes |`
)}
${section(
  "Routing Standards",
  `- Two surfaces: \`app/(public)\` and \`app/(dashboard)\`; auth screens in \`app/(auth)\`.
- Route groups do not affect URLs — see [APP-ROUTER-PATHS.md](./APP-ROUTER-PATHS.md).
- Admin content twins of public paths live under \`/dashboard/*\`.`
)}
${section(
  "Quality Gates",
  `- TypeScript strict mode enabled.
- Zod (or equivalent) validation at every write boundary.
- Server Actions and Route Handlers return the standard API envelope or typed ActionResult.
- Unit tests for Shared Services; integration tests for auth and billing; e2e for public browse + auth smoke (MES-028/029).`
)}
${section(
  "Implementation Notes",
  `- Design tokens and primitives follow [MES-003](./MES-003-Design-System.md).
- Environment variables follow [ENVIRONMENT.md](./ENVIRONMENT.md); secrets never commit to git.
- Database migrations are additive and reviewed via [DATABASE.md](./DATABASE.md).`
)}
${section(
  "Related Documents",
  refs([
    { label: "MSEM", file: "MSEM.md" },
    { label: "Shared Services", file: "MES-002-Shared-Services.md" },
    { label: "Coding Standards", file: "CODING-STANDARDS.md" },
  ])
)}`
    )
  );

  return files;
}
