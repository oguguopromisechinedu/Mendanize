/**
 * Reorganize docs/ into:
 *   core/ | standards/ | architecture/ | engineering/
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "docs");

function read(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, "utf8");
}

function write(rel, content) {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content.trimEnd() + "\n", "utf8");
}

function pick(...candidates) {
  for (const c of candidates) {
    const body = read(c);
    if (body && body.length > 200 && !body.includes("**Authoritative document:**")) {
      return { source: c, body };
    }
  }
  for (const c of candidates) {
    const body = read(c);
    if (body) return { source: c, body };
  }
  return null;
}

function rewriteLinks(content, fromDir) {
  // fromDir: 'core' | 'standards' | 'architecture' | 'engineering' | ''
  const depth = fromDir ? "../" : "./";

  const replacements = [
    // core
    [/\]\(\.\/MSEM\.md\)/g, `](${depth}core/MSEM.md)`],
    [/\]\(\.\/MSEM-Appendix-A(?:-Engineering-Standards)?\.md\)/g, `](${depth}core/Project-Rules.md)`],
    [/\]\(\.\/MES-INDEX\.md\)/g, `](${depth}engineering/MES-INDEX.md)`],
    [/\]\(\.\/README\.md\)/g, `](${depth}README.md)`],

    // standards
    [/\]\(\.\/API-STANDARDS\.md\)/gi, `](${depth}standards/API-Standards.md)`],
    [/\]\(\.\/CODING-STANDARDS\.md\)/gi, `](${depth}standards/Coding-Standards.md)`],
    [/\]\(\.\/SECURITY-STANDARDS\.md\)/gi, `](${depth}standards/Security-Standards.md)`],
    [/\]\(\.\/DATABASE\.md\)/gi, `](${depth}standards/Database.md)`],

    // architecture
    [/\]\(\.\/APP-ROUTER-PATHS\.md\)/gi, `](${depth}architecture/App-Router-Paths.md)`],
    [/\]\(\.\/MODULE-MAP\.md\)/gi, `](${depth}architecture/Module-Map.md)`],
    [/\]\(\.\/DEPENDENCY-MAP\.md\)/gi, `](${depth}architecture/Dependency-Map.md)`],
    [/\]\(\.\/MES-MODULE-MAP\.md\)/gi, `](${depth}architecture/MES-Module-Map.md)`],

    // ops kept at docs root
    [/\]\(\.\/ENVIRONMENT\.md\)/gi, `](${depth}ENVIRONMENT.md)`],
    [/\]\(\.\/DEPLOYMENT\.md\)/gi, `](${depth}DEPLOYMENT.md)`],
    [/\]\(\.\/CHANGELOG\.md\)/gi, `](${depth}CHANGELOG.md)`],
  ];

  let out = content;
  for (const [re, to] of replacements) out = out.replace(re, to);

  // MES-00X links (many filename variants) → engineering/MES-00X.md
  out = out.replace(
    /\]\(\.\/MES-(\d{3})(?:-[^)]+)?\.md\)/g,
    `](${depth}engineering/MES-$1.md)`
  );
  // bare MES-020 style already handled

  // When already writing inside a subfolder, fix accidental double prefixes
  if (fromDir === "engineering") {
    out = out.replace(/\]\(\.\.\/engineering\//g, "](./");
  }
  if (fromDir === "core") {
    out = out.replace(/\]\(\.\.\/core\//g, "](./");
  }
  if (fromDir === "standards") {
    out = out.replace(/\]\(\.\.\/standards\//g, "](./");
  }
  if (fromDir === "architecture") {
    out = out.replace(/\]\(\.\.\/architecture\//g, "](./");
  }

  return out;
}

const dirs = ["core", "standards", "architecture", "engineering"];
for (const d of dirs) fs.mkdirSync(path.join(ROOT, d), { recursive: true });

const moved = [];
const created = [];

function place(destRel, body, sourceNote) {
  write(destRel, body);
  moved.push({ dest: destRel, note: sourceNote });
}

// --- CORE ---
{
  const msem = pick("MSEM.md");
  if (msem) {
    place(
      "core/MSEM.md",
      rewriteLinks(msem.body, "core"),
      msem.source
    );
  }

  const appendix = pick(
    "MSEM-Appendix-A-Engineering-Standards.md",
    "MSEM-Appendix-A.md"
  );
  // Project-Rules absorbs Appendix A binding standards
  if (appendix) {
    let body = appendix.body;
    // Ensure title reflects Project Rules while preserving Appendix A content
    if (!body.startsWith("# Project Rules") && !body.includes("Project Rules")) {
      body =
        `# Project Rules (MSEM Appendix A — Engineering Standards)\n\n` +
        body.replace(/^# .+\n/, "");
    }
    place("core/Project-Rules.md", rewriteLinks(body, "core"), appendix.source);
  }

  const cursorPrompt = `# Cursor System Prompt — Mendanize

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-15 |
| **Owner** | Mendanize Platform Architecture |

## Purpose

Define how Cursor (and any coding agent) must behave when working in the Mendanize repository.

## Scope

Applies to every agent session that reads, scaffolds, or implements code under this repo.

## Dependencies

- [MSEM.md](./MSEM.md)
- [Project-Rules.md](./Project-Rules.md)
- [../engineering/MES-INDEX.md](../engineering/MES-INDEX.md)
- [../architecture/Module-Map.md](../architecture/Module-Map.md)

## System Instructions

You are a software engineer working on **Mendanize**, an AI-powered technology learning platform with two surfaces:

1. **Teaching Frontend** (\`app/(public)\`) — Learn / Discover / Explore (public)
2. **Dashboard** (\`app/(dashboard)\`) — Practice / Ask / Administer (auth-gated)

### Before writing any production code

1. Read [MES-INDEX.md](../engineering/MES-INDEX.md) and the target MES in \`docs/engineering/\`.
2. Read [Project-Rules.md](./Project-Rules.md) (binding standards).
3. Confirm ownership in [Module-Map.md](../architecture/Module-Map.md) and paths in [App-Router-Paths.md](../architecture/App-Router-Paths.md).
4. Respect Shared Services in \`/services\` — never reimplement Content, Recommendations, AI, Search, Notification, SEO, Media, or Settings inside a feature.

### Single contracts (never fork)

| Concern | Owner |
|---------|--------|
| Session / auth | \`features/authentication\` (MES-006) |
| Recommendations | \`services/recommendations\` (MES-018) |
| AI configuration | \`features/platform-settings\` + \`services/settings\` (MES-020) |
| API envelope | \`{ data, error, meta }\` — [API-Standards.md](../standards/API-Standards.md) |

### Hard rules

- Do **not** invent architecture that contradicts \`docs/\`.
- Do **not** implement features when the task is documentation or scaffolding only.
- Prefer updating a MES document over contradicting it.
- Follow Next.js docs under \`node_modules/next/dist/docs/\` when APIs may differ from training data (\`AGENTS.md\`).

## Related Documents

- [Project Rules](./Project-Rules.md)
- [MSEM](./MSEM.md)
- [Documentation README](../README.md)
`;
  place("core/Cursor-System-Prompt.md", cursorPrompt, "generated");
  created.push("core/Cursor-System-Prompt.md");
}

// --- STANDARDS ---
{
  const map = [
    ["standards/API-Standards.md", ["API-STANDARDS.md"]],
    ["standards/Coding-Standards.md", ["CODING-STANDARDS.md"]],
    ["standards/Security-Standards.md", ["SECURITY-STANDARDS.md"]],
    ["standards/Database.md", ["DATABASE.md"]],
  ];
  for (const [dest, sources] of map) {
    const picked = pick(...sources);
    if (picked) place(dest, rewriteLinks(picked.body, "standards"), picked.source);
  }

  place(
    "standards/UI-Standards.md",
    `# UI Standards

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-15 |
| **Owner** | Mendanize Platform Architecture |

## Purpose

Define cross-surface UI expectations for the Teaching Frontend and Dashboard that are not specific to a single component primitive.

## Scope

Layout shells, spacing, typography application, motion, accessibility presentation, and admin-configurable visual defaults (see MES-001 Design Customization Principle). Visual tokens and primitives also reference MES-003.

## Dependencies

- [../core/Project-Rules.md](../core/Project-Rules.md)
- [../engineering/MES-003.md](../engineering/MES-003.md)
- [Component-Standards.md](./Component-Standards.md)
- [Coding-Standards.md](./Coding-Standards.md)

## Standards

1. **Two shells, one system** — Public and dashboard share tokens; they use distinct layout shells (\`components/layout\`).
2. **Clarity over decoration** — Prefer readable hierarchy and generous spacing on learning surfaces.
3. **Motion budget** — Intentional, limited animations; honour \`prefers-reduced-motion\`.
4. **Accessibility** — WCAG 2.2 AA targets for focus, contrast, landmarks, and keyboard use.
5. **Configurable look, fixed behaviour** — Appearance may be settings-driven (MES-020 / design settings); interaction contracts are not.
6. **No hero cards** on the premium homepage first viewport (MES-005).
7. **Responsive by default** — Mobile and desktop are first-class; do not ship desktop-only layouts.

## Implementation Notes

- Tokens live in \`styles/\` and theme mapping; do not hard-code ad-hoc hex values in features when a token exists.
- Dashboard prioritizes density and keyboard efficiency; public prioritizes brand composition and readability.
- Defer primitive API details to [Component-Standards.md](./Component-Standards.md).

## Related Documents

- [Component Standards](./Component-Standards.md)
- [MES-003 Design System](../engineering/MES-003.md)
- [MES-005 Premium Homepage](../engineering/MES-005.md)
`,
    "generated"
  );
  created.push("standards/UI-Standards.md");

  place(
    "standards/Component-Standards.md",
    `# Component Standards

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-15 |
| **Owner** | Mendanize Platform Architecture |

## Purpose

Define where UI components live, how they are composed, and what may not be duplicated across features.

## Scope

\`components/ui\` primitives, \`components/layout\` shells, \`components/shared\` composites, and \`features/*/components\` feature-specific UI.

## Dependencies

- [UI-Standards.md](./UI-Standards.md)
- [Coding-Standards.md](./Coding-Standards.md)
- [../core/Project-Rules.md](../core/Project-Rules.md)
- [../engineering/MES-003.md](../engineering/MES-003.md)

## Ownership

| Layer | Location | Allowed contents |
|-------|----------|------------------|
| Primitives | \`components/ui\` | Button, Input, Dialog, etc. |
| Layout | \`components/layout\` | Public/Dashboard shells, nav chrome |
| Shared | \`components/shared\` | Cross-feature presentational pieces |
| Feature | \`features/*/components\` | Domain UI that composes primitives |

## Rules

1. Features compose primitives — they do not invent a second button/input system.
2. No Prisma or Shared Service calls inside presentational components; data enters via props or server containers.
3. Mark client components with \`"use client"\` only when required.
4. Prefer accessible Radix/shadcn-style primitives already in the repo over one-off controls.
5. Keep prop APIs typed; avoid \`any\`.
6. Story/demo coverage is encouraged for primitives; not required for every feature leaf.

## Implementation Notes

- Before adding a primitive, search \`components/ui\` for an existing match.
- Feature READMEs should not claim Shared Service ownership of visual primitives.

## Related Documents

- [UI Standards](./UI-Standards.md)
- [Coding Standards](./Coding-Standards.md)
- [Module Map](../architecture/Module-Map.md)
`,
    "generated"
  );
  created.push("standards/Component-Standards.md");

  place(
    "standards/Testing-Standards.md",
    `# Testing Standards

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-15 |
| **Owner** | Mendanize Platform Architecture |

## Purpose

Define the minimum testing expectations for Shared Services, features, APIs, and launch gates (MES-028 / MES-029).

## Scope

Unit, integration, and end-to-end tests under \`tests/\`; CI expectations; what must be covered before production.

## Dependencies

- [../core/Project-Rules.md](../core/Project-Rules.md)
- [../engineering/MES-028.md](../engineering/MES-028.md)
- [../engineering/MES-029.md](../engineering/MES-029.md)
- [Security-Standards.md](./Security-Standards.md)
- [API-Standards.md](./API-Standards.md)

## Pyramid

| Layer | Location | Focus |
|-------|----------|--------|
| Unit | \`tests/unit\` | Shared Services, validators, pure utils |
| Integration | \`tests/integration\` | Auth, billing webhooks, API contracts |
| E2E | \`tests/e2e\` | Public browse smoke + auth dashboard smoke |

## Rules

1. Shared Services require unit tests for primary happy-path and failure contracts.
2. Auth and billing changes require integration coverage.
3. API handlers must assert the \`{ data, error, meta }\` envelope on success and failure.
4. E2E smoke for launch (MES-029): home, article, guide, tool, search, pricing, sign-in, articles CMS, settings.
5. Do not test implementation trivia; test behaviour and contracts.
6. Flaky tests are release blockers — quarantine or fix before merge to main.

## Implementation Notes

- Prefer deterministic fixtures in \`tests/fixtures\`.
- Mock AI providers in unit/integration; use sandboxed keys for limited e2e if needed.
- CI must run lint, typecheck, and tests before deploy ([../DEPLOYMENT.md](../DEPLOYMENT.md)).

## Related Documents

- [MES-028 Production Readiness](../engineering/MES-028.md)
- [MES-029 Final QA](../engineering/MES-029.md)
- [API Standards](./API-Standards.md)
`,
    "generated"
  );
  created.push("standards/Testing-Standards.md");
}

// --- ARCHITECTURE ---
{
  const map = [
    ["architecture/App-Router-Paths.md", ["APP-ROUTER-PATHS.md"]],
    ["architecture/Module-Map.md", ["MODULE-MAP.md"]],
    ["architecture/Dependency-Map.md", ["DEPENDENCY-MAP.md"]],
    ["architecture/MES-Module-Map.md", ["MES-MODULE-MAP.md"]],
  ];
  for (const [dest, sources] of map) {
    const picked = pick(...sources);
    if (picked) {
      place(dest, rewriteLinks(picked.body, "architecture"), picked.source);
    }
  }
}

// --- ENGINEERING (MES-001..029 + INDEX) ---
{
  const mesSources = {
    "001": [
      "MES-001-Foundation-Product-Vision.md",
      "MES-001-Foundation-Platform.md",
    ],
    "002": [
      "MES-002-Shared-Services-API-Architecture.md",
      "MES-002-Shared-Services.md",
    ],
    "003": ["MES-003-Design-System.md"],
    "004": [
      "MES-004-Public-Website-Structure.md",
      "MES-004-Public-Website.md",
    ],
    "005": [
      "MES-005-Premium-Homepage-Experience.md",
      "MES-005-Premium-Homepage.md",
    ],
    "006": [
      "MES-006-Authentication-User-Management.md",
      "MES-006-Authentication.md",
    ],
    "007": [
      "MES-007-Admin-Dashboard-Foundation.md",
      "MES-007-Admin-Dashboard.md",
    ],
    "008": [
      "MES-008-Article-Management-System.md",
      "MES-008-Article-Management.md",
    ],
    "009": [
      "MES-009-Categories-Topics-Management.md",
      "MES-009-Categories-Topics.md",
    ],
    "010": [
      "MES-010-Learning-Guides-Management.md",
      "MES-010-Learning-Guides.md",
    ],
    "011": ["MES-011-Admin-AI-Studio.md"],
    "012": ["MES-012-AI-Tools-Management.md"],
    "013": ["MES-013-Homepage-Content-Management.md"],
    "014": ["MES-014-Media-Library-DAM.md", "MES-014-Media-Library.md"],
    "015": [
      "MES-015-SEO-Metadata-Management.md",
      "MES-015-SEO-Metadata.md",
    ],
    "016": [
      "MES-016-Navigation-Menu-Management.md",
      "MES-016-Navigation-Management.md",
    ],
    "017": [
      "MES-017-Search-Discovery-Engine.md",
      "MES-017-Search-Discovery.md",
    ],
    "018": [
      "MES-018-Recommendations-Engine.md",
      "MES-018-Recommendation-Engine.md",
    ],
    "019": ["MES-019-Ask-Mendanize-AI.md"],
    "020": [
      "MES-020-Platform-Settings-Configuration.md",
      "MES-020-Platform-Settings.md",
    ],
    "021": ["MES-021-Billing-Subscriptions.md"],
    "022": [
      "MES-022-User-Learning-Personalization.md",
      "MES-022-User-Learning.md",
    ],
    "023": [
      "MES-023-Analytics-Insights-Platform.md",
      "MES-023-Analytics.md",
    ],
    "024": [
      "MES-024-Notification-Communication-System.md",
      "MES-024-Notifications.md",
    ],
    "025": [
      "MES-025-Public-Article-Experience.md",
      "MES-025-Public-Articles.md",
    ],
    "026": [
      "MES-026-Public-Learning-Guide-Experience.md",
      "MES-026-Public-Learning.md",
    ],
    "027": [
      "MES-027-Public-AI-Tools-Directory.md",
      "MES-027-Public-AI-Tools.md",
    ],
    "028": ["MES-028-Production-Readiness.md"],
    "029": [
      "MES-029-Final-QA-Production-Launch.md",
      "MES-029-Final-QA.md",
    ],
  };

  for (const [num, sources] of Object.entries(mesSources)) {
    const picked = pick(...sources);
    if (!picked) {
      console.warn("MISSING MES-", num);
      continue;
    }
    place(
      `engineering/MES-${num}.md`,
      rewriteLinks(picked.body, "engineering"),
      picked.source
    );
  }

  const index = pick("MES-INDEX.md");
  if (index) {
    let body = index.body;
    // Update how-to-use paths for new layout
    body = body.replace(
      /Save every file to `docs\/`[\s\S]*?spec by spec in order\./,
      `Documents live under \`docs/engineering/\` (MES-001–029), with binding rules in \`docs/core/\`, contracts in \`docs/standards/\`, and maps in \`docs/architecture/\`. Give Cursor [Cursor-System-Prompt.md](../core/Cursor-System-Prompt.md) and this index first, then proceed spec by spec in order.`
    );
    body = rewriteLinks(body, "engineering");
    // Add clickable links in the sequence table where possible
    body = body.replace(
      /\| Appendix A \| Engineering Standards[^\n]*\|/,
      "| Appendix A | [Project Rules / Engineering Standards](../core/Project-Rules.md) | Referenced by every spec |"
    );
    for (let i = 1; i <= 29; i++) {
      const n = String(i).padStart(3, "0");
      body = body.replace(
        new RegExp(`\\| MES-${n} \\|`),
        `| [MES-${n}](./MES-${n}.md) |`
      );
    }
    place("engineering/MES-INDEX.md", body, index.source);
  }
}

// --- ROOT README ---
{
  const readme = `# Mendanize Engineering Documentation

| Field | Value |
|-------|-------|
| **Version** | 1.1.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-15 |
| **Owner** | Mendanize Platform Architecture |

## Purpose

This directory is the **single source of truth** for the Mendanize platform. Documentation precedes production code.

## Documentation Structure

\`\`\`
docs/
  README.md                 ← you are here
  ENVIRONMENT.md            ← runtime env (ops)
  DEPLOYMENT.md
  CHANGELOG.md

  core/                     ← governance
    MSEM.md
    Cursor-System-Prompt.md
    Project-Rules.md

  standards/                ← cross-cutting contracts
    API-Standards.md
    Coding-Standards.md
    Security-Standards.md
    Database.md
    UI-Standards.md
    Component-Standards.md
    Testing-Standards.md

  architecture/             ← structure maps
    App-Router-Paths.md
    Module-Map.md
    Dependency-Map.md
    MES-Module-Map.md

  engineering/              ← MES-001 … MES-029 + index
    MES-INDEX.md
    MES-001.md … MES-029.md
\`\`\`

| Folder | Role |
|--------|------|
| [core/](./core/) | Manifesto, agent prompt, binding project rules |
| [standards/](./standards/) | API, coding, security, database, UI, components, testing |
| [architecture/](./architecture/) | Router paths, module & dependency maps |
| [engineering/](./engineering/) | MES specifications in execution order |

## Document Hierarchy

1. **[core/MSEM.md](./core/MSEM.md)** + **[core/Project-Rules.md](./core/Project-Rules.md)** — highest authority
2. **[engineering/MES-001.md](./engineering/MES-001.md)** / **[MES-002.md](./engineering/MES-002.md)** — platform & Shared Services
3. **MES-003–MES-029** — feature and surface specs
4. **[standards/](./standards/)** — applied to every implementation
5. **[architecture/](./architecture/)** + ops docs — structural and runtime reality

## How Cursor Must Work

Follow **[core/Cursor-System-Prompt.md](./core/Cursor-System-Prompt.md)**. Then:

1. Read [engineering/MES-INDEX.md](./engineering/MES-INDEX.md)
2. Read [core/Project-Rules.md](./core/Project-Rules.md) and [engineering/MES-002.md](./engineering/MES-002.md)
3. Read the target MES and its dependencies
4. Confirm [architecture/Module-Map.md](./architecture/Module-Map.md)
5. Implement only in mapped folders — never fork Shared Services

## Single Contracts

| Concern | Document | Location |
|---------|----------|----------|
| Session | [MES-006](./engineering/MES-006.md) | \`features/authentication\` |
| Recommendations | [MES-018](./engineering/MES-018.md) | \`services/recommendations\` |
| AI configuration | [MES-020](./engineering/MES-020.md) | \`services/settings\` |
| API envelope | [API-Standards](./standards/API-Standards.md) | \`{ data, error, meta }\` |

## Related Documents

- [Cursor System Prompt](./core/Cursor-System-Prompt.md)
- [MES Index](./engineering/MES-INDEX.md)
- [Module Map](./architecture/Module-Map.md)
`;
  place("README.md", readme, "regenerated");
}

// Ops docs — rewrite internal links only, keep at root
for (const ops of ["ENVIRONMENT.md", "DEPLOYMENT.md", "CHANGELOG.md"]) {
  const body = read(ops);
  if (body) place(ops, rewriteLinks(body, ""), ops);
}

// Status note
place(
  "MES-DOCUMENTS-STATUS.md",
  `# MES Documents Status

| Field | Value |
|-------|-------|
| **Version** | 1.1.0 |
| **Status** | Reorganized |
| **Last Updated** | 2026-07-15 |

## Current layout

See [README.md](./README.md). Canonical MES files: \`docs/engineering/MES-001.md\` … \`MES-029.md\`.

Legacy flat filenames under \`docs/\` (if still present after migration) are obsolete — use the foldered paths.
`,
  "status"
);

// Remove obsolete flat MES / duplicate standards that were copied
const REMOVE = [
  "MSEM.md",
  "MSEM-Appendix-A.md",
  "MSEM-Appendix-A-Engineering-Standards.md",
  "MES-INDEX.md",
  "API-STANDARDS.md",
  "CODING-STANDARDS.md",
  "SECURITY-STANDARDS.md",
  "DATABASE.md",
  "APP-ROUTER-PATHS.md",
  "MODULE-MAP.md",
  "DEPENDENCY-MAP.md",
  "MES-MODULE-MAP.md",
  // all flat MES variants
];

const flatMes = fs
  .readdirSync(ROOT)
  .filter((f) => /^MES-\d{3}/.test(f) && f.endsWith(".md"));
const toRemove = new Set([...REMOVE, ...flatMes]);

let removed = 0;
for (const f of toRemove) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p) && fs.statSync(p).isFile()) {
    fs.unlinkSync(p);
    removed++;
  }
}

const report = {
  moved: moved.length,
  createdMissing: created,
  removedFlat: removed,
  tree: {
    core: fs.readdirSync(path.join(ROOT, "core")),
    standards: fs.readdirSync(path.join(ROOT, "standards")),
    architecture: fs.readdirSync(path.join(ROOT, "architecture")),
    engineering: fs.readdirSync(path.join(ROOT, "engineering")),
  },
};

fs.writeFileSync(
  path.join(process.cwd(), "scripts/docs-reorg-result.json"),
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
