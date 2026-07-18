/**
 * Architecture scaffold verifier/completer — structure + placeholders only.
 * Honours docs/APP-ROUTER-PATHS.md (admin content under /dashboard/*).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const created = [];
const skipped = [];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeIfMissing(rel, contents) {
  const full = path.join(ROOT, rel);
  if (fs.existsSync(full)) {
    skipped.push(rel);
    return false;
  }
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, contents, "utf8");
  created.push(rel);
  return true;
}

const PAGE = (label) => `/**
 * Placeholder — ${label}
 * Architecture scaffold only. No business logic.
 */
export default function Page() {
  return (
    <main>
      <p>${label} — placeholder</p>
    </main>
  );
}
`;

const LAYOUT = (label) => `/**
 * Placeholder layout — ${label}
 * Architecture scaffold only. No business logic.
 */
export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
`;

const LOADING = `/** Placeholder loading UI — architecture scaffold only. */
export default function Loading() {
  return <p>Loading…</p>;
}
`;

const ERROR = `"use client";

/** Placeholder error UI — architecture scaffold only. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <p>Something went wrong.</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
      {process.env.NODE_ENV === "development" ? (
        <pre>{error.message}</pre>
      ) : null}
    </main>
  );
}
`;

const ROUTE = (label) => `/**
 * Placeholder API route — ${label}
 * Response contract: { data, error, meta } (MES-002 / API-STANDARDS)
 */
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";

export async function GET() {
  const body: ApiResponse<null> = {
    data: null,
    error: {
      code: "NOT_IMPLEMENTED",
      message: "${label} — architecture placeholder",
    },
    meta: { placeholder: true },
  };
  return NextResponse.json(body, { status: 501 });
}
`;

const ACTIONS = (label) => `"use server";

/** Server actions placeholder — ${label} */
export async function placeholderAction() {
  throw new Error("${label}: not implemented");
}
`;

const TYPES = (label) => `/** Types placeholder — ${label} */
export type Placeholder = never;
`;

const CONSTANTS = (label) => `/** Constants placeholder — ${label} */
export const PLACEHOLDER = "${label}" as const;
`;

const SCHEMA = (label) => `/** Validators / schema placeholder — ${label} */
export const placeholderSchema = null;
`;

const SERVICE = (label) => `/** Service placeholder — ${label} */
export async function placeholderService() {
  throw new Error("${label}: not implemented");
}
`;

const REPOSITORY = (label) => `/** Repository placeholder — ${label} */
export async function placeholderRepository() {
  throw new Error("${label}: not implemented");
}
`;

function contentFor(file, label) {
  if (file === "layout.tsx") return LAYOUT(label);
  if (file === "page.tsx") return PAGE(label);
  if (file === "loading.tsx") return LOADING;
  if (file === "error.tsx") return ERROR;
  if (file === "route.ts") return ROUTE(label);
  if (file === "actions.ts") return ACTIONS(label);
  if (file === "types.ts") return TYPES(label);
  if (file === "constants.ts") return CONSTANTS(label);
  if (file === "schema.ts") return SCHEMA(label);
  if (file === "service.ts") return SERVICE(label);
  if (file === "repository.ts") return REPOSITORY(label);
  return `/** Placeholder — ${label} */\n`;
}

/** Avoid writing page.tsx when another page already owns the URL (legacy or sibling). */
function urlPathFromAppFile(rel) {
  let p = rel.replace(/\\/g, "/");
  if (!p.startsWith("app/")) return null;
  p = p.slice(4);
  p = p.replace(/\([^)]+\)\//g, "");
  p = p.replace(/\/page\.tsx$/, "");
  if (!p || p === "page.tsx") return "/";
  return "/" + p;
}

function existingUrlOwners() {
  const owners = new Map();
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === "node_modules" || ent.name === "_legacy") continue;
        walk(full);
      } else if (ent.name === "page.tsx") {
        const rel = path.relative(ROOT, full).replace(/\\/g, "/");
        const url = urlPathFromAppFile(rel);
        if (url) {
          if (!owners.has(url)) owners.set(url, []);
          owners.get(url).push(rel);
        }
      }
    }
  }
  walk(path.join(ROOT, "app"));
  return owners;
}

const urlOwners = existingUrlOwners();

function writePageIfNoConflict(rel, label) {
  const url = urlPathFromAppFile(rel);
  if (url && urlOwners.has(url)) {
    const existing = urlOwners.get(url);
    if (!existing.includes(rel.replace(/\\/g, "/"))) {
      // Write README migration note instead of conflicting page
      const readme = rel.replace(/page\.tsx$/, "README.md");
      writeIfMissing(
        readme,
        `# ${label}\n\nTarget route for this module. URL \`${url}\` is currently owned by:\n\n${existing
          .map((e) => `- \`${e}\``)
          .join("\n")}\n\nMigrate here, then remove the legacy owner. Do not add a second \`page.tsx\` for the same URL.\n`
      );
      skipped.push(`${rel} (URL conflict ${url})`);
      return false;
    }
  }
  const ok = writeIfMissing(rel, contentFor("page.tsx", label));
  if (ok && url) {
    if (!urlOwners.has(url)) urlOwners.set(url, []);
    urlOwners.get(url).push(rel.replace(/\\/g, "/"));
  }
  return ok;
}

// --- Top-level ---
const TOP = [
  "app",
  "components",
  "features",
  "services",
  "providers",
  "hooks",
  "contexts",
  "lib",
  "utils",
  "types",
  "config",
  "styles",
  "emails",
  "actions",
  "middleware",
  "validators",
  "repositories",
  "stores",
  "prisma",
  "public",
  "docs",
  "tests",
  "scripts",
];
for (const d of TOP) ensureDir(path.join(ROOT, d));

writeIfMissing(
  "types/api.ts",
  `/**
 * Shared API response contract (MES-002 / API-STANDARDS).
 * All app/api/public/* and app/api/dashboard/* routes MUST use this shape.
 */

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiMeta = Record<string, unknown>;

export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
  meta?: ApiMeta;
};
`
);

writeIfMissing(
  "types/index.ts",
  `export type { ApiError, ApiMeta, ApiResponse } from "./api";\n`
);

// Component / lib / test scaffolding dirs
for (const d of [
  "components/ui",
  "components/layout",
  "components/shared",
  "components/providers",
  "lib/api",
  "lib/auth",
  "lib/db",
  "lib/design",
  "tests/unit",
  "tests/integration",
  "tests/e2e",
  "tests/fixtures",
]) {
  ensureDir(path.join(ROOT, d));
}

// --- Public routes ---
const publicRoutes = [
  { segment: "", files: ["layout.tsx", "page.tsx", "loading.tsx", "error.tsx"] },
  { segment: "articles", files: ["page.tsx", "loading.tsx", "error.tsx"] },
  { segment: "articles/[slug]", files: ["page.tsx", "loading.tsx"] },
  { segment: "guides", files: ["page.tsx", "loading.tsx", "error.tsx"] },
  { segment: "guides/[slug]", files: ["page.tsx", "loading.tsx"] },
  { segment: "ai-tools", files: ["page.tsx", "loading.tsx", "error.tsx"] },
  { segment: "ai-tools/[slug]", files: ["page.tsx", "loading.tsx"] },
  { segment: "categories", files: ["page.tsx", "loading.tsx"] },
  { segment: "categories/[slug]", files: ["page.tsx"] },
  { segment: "topics", files: ["page.tsx", "loading.tsx"] },
  { segment: "topics/[slug]", files: ["page.tsx"] },
  { segment: "search", files: ["page.tsx", "loading.tsx"] },
  { segment: "pricing", files: ["page.tsx", "loading.tsx"] },
];

for (const route of publicRoutes) {
  const base = path.join("app/(public)", route.segment);
  ensureDir(path.join(ROOT, base));
  const label = `app/(public)/${route.segment || "root"}`;
  for (const file of route.files) {
    const rel = path.join(base, file).replace(/\\/g, "/");
    if (file === "page.tsx") writePageIfNoConflict(rel, label);
    else writeIfMissing(rel, contentFor(file, label));
  }
}

// --- Dashboard routes (APP-ROUTER-PATHS) ---
// Unique modules as siblings; content twins nested under dashboard/
const dashboardUnique = [
  { segment: "", files: ["layout.tsx", "loading.tsx", "error.tsx"] },
  { segment: "dashboard", files: ["page.tsx", "loading.tsx", "error.tsx"] },
  { segment: "ai-studio", files: ["page.tsx", "loading.tsx", "error.tsx"] },
  { segment: "homepage", files: ["page.tsx", "loading.tsx"] },
  { segment: "media", files: ["page.tsx", "loading.tsx"] },
  { segment: "navigation", files: ["page.tsx"] },
  { segment: "seo", files: ["page.tsx"] },
  { segment: "search-settings", files: ["page.tsx"] },
  { segment: "settings", files: ["page.tsx", "loading.tsx"] },
  { segment: "billing", files: ["page.tsx"] },
  { segment: "ask", files: ["page.tsx", "loading.tsx"] },
  { segment: "learning", files: ["page.tsx", "loading.tsx"] },
  { segment: "analytics", files: ["page.tsx", "loading.tsx"] },
  { segment: "notifications", files: ["page.tsx"] },
];

const dashboardNested = [
  { segment: "dashboard/articles", files: ["page.tsx", "loading.tsx", "error.tsx"] },
  { segment: "dashboard/articles/new", files: ["page.tsx"] },
  { segment: "dashboard/articles/[id]", files: ["page.tsx"] },
  { segment: "dashboard/categories", files: ["page.tsx", "loading.tsx"] },
  { segment: "dashboard/guides", files: ["page.tsx", "loading.tsx"] },
  { segment: "dashboard/ai-tools", files: ["page.tsx", "loading.tsx"] },
];

for (const route of [...dashboardUnique, ...dashboardNested]) {
  const base = path.join("app/(dashboard)", route.segment);
  ensureDir(path.join(ROOT, base));
  const label = `app/(dashboard)/${route.segment || "root"}`;
  for (const file of route.files) {
    const rel = path.join(base, file).replace(/\\/g, "/");
    if (file === "page.tsx") writePageIfNoConflict(rel, label);
    else writeIfMissing(rel, contentFor(file, label));
  }
}

// Structural README for brief's flat names (pointing to nested paths)
for (const name of ["articles", "categories", "guides", "ai-tools"]) {
  writeIfMissing(
    `app/(dashboard)/${name}/README.md`,
    `# Admin ${name} (MES module)

Per [APP-ROUTER-PATHS.md](../../../docs/APP-ROUTER-PATHS.md), admin content routes that share names with public paths live at:

\`app/(dashboard)/dashboard/${name}/\` → \`/dashboard/${name}\`

Do not add \`page.tsx\` here — it would collide with \`app/(public)/${name}\`.
`
  );
}

// --- Auth ---
const authRoutes = [
  { segment: "", files: ["layout.tsx"] },
  { segment: "sign-in", files: ["page.tsx"] },
  { segment: "sign-up", files: ["page.tsx"] },
  { segment: "reset-password", files: ["page.tsx"] },
  { segment: "forgot-password", files: ["page.tsx"] },
];
for (const route of authRoutes) {
  const base = path.join("app/(auth)", route.segment);
  ensureDir(path.join(ROOT, base));
  const label = `app/(auth)/${route.segment || "root"}`;
  for (const file of route.files) {
    const rel = path.join(base, file).replace(/\\/g, "/");
    if (file === "page.tsx") writePageIfNoConflict(rel, label);
    else writeIfMissing(rel, contentFor(file, label));
  }
}

// --- API ---
const apiPublic = [
  "articles",
  "guides",
  "ai-tools",
  "categories",
  "topics",
  "search",
  "recommendations",
  "ask",
  "pricing",
  "homepage",
];
const apiDashboard = [
  "articles",
  "categories",
  "guides",
  "ai-tools",
  "ai-studio",
  "homepage",
  "media",
  "navigation",
  "seo",
  "search-settings",
  "settings",
  "billing",
  "ask",
  "learning",
  "analytics",
  "notifications",
];
for (const name of apiPublic) {
  writeIfMissing(`app/api/public/${name}/route.ts`, ROUTE(`api/public/${name}`));
}
for (const name of apiDashboard) {
  writeIfMissing(
    `app/api/dashboard/${name}/route.ts`,
    ROUTE(`api/dashboard/${name}`)
  );
}
writeIfMissing(
  "app/api/public/README.md",
  `# Public API\n\nContract: \`{ data, error, meta }\` via \`@/types/api\` (MES-002).\n`
);
writeIfMissing(
  "app/api/dashboard/README.md",
  `# Dashboard API\n\nAuth-gated. Contract: \`{ data, error, meta }\` via \`@/types/api\` (MES-002).\n`
);

// --- Shared services ---
const SHARED = [
  {
    id: "content",
    mes: "MES-002",
    note: "Content Shared Service — articles, guides, taxonomy, homepage content.",
  },
  {
    id: "recommendations",
    mes: "MES-018 via MES-002",
    note: "ONLY recommendation implementation in the codebase.",
  },
  {
    id: "ai",
    mes: "MES-002",
    note: "Multi-provider AI client: Claude, OpenAI, Gemini, Grok, DALL-E.",
  },
  {
    id: "search",
    mes: "MES-002 / MES-017",
    note: "Search Shared Service.",
  },
  {
    id: "notification",
    mes: "MES-002 / MES-024",
    note: "Notification Shared Service.",
  },
  {
    id: "seo",
    mes: "MES-002 / MES-015",
    note: "SEO Shared Service.",
  },
  {
    id: "media",
    mes: "MES-002 / MES-014",
    note: "Media / DAM Shared Service.",
  },
  {
    id: "settings",
    mes: "MES-020 via MES-002",
    note: "ONLY AI-configuration and platform settings storage.",
  },
];

for (const svc of SHARED) {
  const base = `services/${svc.id}`;
  ensureDir(path.join(ROOT, base));
  writeIfMissing(
    `${base}/README.md`,
    `# ${svc.id} Shared Service\n\nImplements / backs: ${svc.mes}\n\n${svc.note}\n\nFeature modules call this service; they must not reimplement it.\n`
  );
  writeIfMissing(`${base}/service.ts`, SERVICE(`services/${svc.id}`));
  writeIfMissing(`${base}/types.ts`, TYPES(`services/${svc.id}`));
  writeIfMissing(
    `${base}/index.ts`,
    `export * from "./service";\nexport * from "./types";\n`
  );
}
for (const provider of ["claude", "openai", "gemini", "grok", "dalle"]) {
  writeIfMissing(
    `services/ai/providers/${provider}.ts`,
    SERVICE(`services/ai/providers/${provider}`)
  );
}
writeIfMissing(
  "services/settings/ai-config.ts",
  `/**
 * ONLY AI-configuration accessors (MES-020).
 * features/ai-studio and features/ask-mendanize MUST import from here.
 */
${SERVICE("services/settings/ai-config")}
`
);

// --- Features ---
const FEATURES = [
  {
    id: "authentication",
    mes: "MES-006",
    services: ["settings"],
    note: "Single session/auth contract. No other feature owns sessions.",
  },
  {
    id: "admin-dashboard",
    mes: "MES-007",
    services: ["content", "settings", "notification", "media"],
    note: "Auth-gated dashboard shell and admin foundation.",
  },
  {
    id: "articles",
    mes: "MES-008",
    services: ["content", "media", "seo", "search", "recommendations"],
    note: "Article management (admin). Public experience is MES-025.",
  },
  {
    id: "categories-topics",
    mes: "MES-009",
    services: ["content", "seo", "search"],
    note: "Categories and topics taxonomy management.",
  },
  {
    id: "learning-guides",
    mes: "MES-010",
    services: ["content", "media", "seo", "search", "recommendations"],
    note: "Learning guides management (admin). Public experience is MES-026.",
  },
  {
    id: "ai-studio",
    mes: "MES-011",
    services: ["ai", "content", "media", "settings"],
    note: "Admin AI content generation. AI config ONLY via MES-020 / services/settings.",
  },
  {
    id: "ai-tools",
    mes: "MES-012",
    services: ["ai", "content", "media", "seo", "settings"],
    note: "AI tools directory management. Distinct from AI Studio (MES-011).",
  },
  {
    id: "homepage-public",
    mes: "MES-005",
    services: ["content", "recommendations", "media", "seo"],
    note: "Public premium homepage. CMS is homepage-management (MES-013).",
  },
  {
    id: "homepage-management",
    mes: "MES-013",
    services: ["content", "media", "seo", "settings"],
    note: "Homepage CMS (admin). Distinct from public rendering (MES-005).",
  },
  {
    id: "media-library",
    mes: "MES-014",
    services: ["media", "ai"],
    note: "Digital asset management. Calls Shared Media service.",
  },
  {
    id: "seo",
    mes: "MES-015",
    services: ["seo", "content"],
    note: "SEO / metadata management UI. Logic in services/seo.",
  },
  {
    id: "navigation",
    mes: "MES-016",
    services: ["content", "settings"],
    note: "Navigation / menu management.",
  },
  {
    id: "search",
    mes: "MES-017",
    services: ["search", "recommendations", "content"],
    note: "Search UI. Recommendations from services/recommendations only.",
  },
  {
    id: "recommendations",
    mes: "MES-018",
    services: ["recommendations"],
    note: "Feature-level UI only. ALL recommendation logic in /services/recommendations.",
  },
  {
    id: "ask-mendanize",
    mes: "MES-019",
    services: ["ai", "content", "settings", "recommendations"],
    note: "Tier 1 public widget + Tier 2 dashboard. AI config from MES-020 only.",
  },
  {
    id: "platform-settings",
    mes: "MES-020",
    services: ["settings", "ai"],
    note: "ONLY AI-configuration and platform settings storage location.",
  },
  {
    id: "billing",
    mes: "MES-021",
    services: ["settings", "notification"],
    note: "Billing & subscriptions. Public pricing under app/(public)/pricing.",
  },
  {
    id: "user-learning",
    mes: "MES-022",
    services: ["content", "recommendations", "settings"],
    note: "Learner personalization. Distinct from authentication. Uses MES-018.",
  },
  {
    id: "analytics",
    mes: "MES-023",
    services: ["content", "recommendations", "settings"],
    note: "Analytics & insights. Recommendations from services/recommendations only.",
  },
  {
    id: "notifications",
    mes: "MES-024",
    services: ["notification", "settings"],
    note: "Notification UI. Logic in services/notification.",
  },
];

const FEATURE_SUBS = [
  "components",
  "hooks",
  "services",
  "actions",
  "types",
  "validators",
  "utils",
  "constants",
];

for (const feature of FEATURES) {
  const base = path.join("features", feature.id);
  for (const sub of FEATURE_SUBS) {
    ensureDir(path.join(ROOT, base, sub));
    writeIfMissing(`${base}/${sub}/.gitkeep`, "");
  }
  writeIfMissing(
    `${base}/README.md`,
    `# ${feature.id}\n\n**Implements:** ${feature.mes}\n\n**Shared Services:** ${feature.services
      .map((s) => `\`${s}\``)
      .join(", ")}\n\n${feature.note}\n\n## Structure\n\n- \`components/\`, \`hooks/\`, \`actions/\`, \`types/\`, \`validators/\`, \`utils/\`, \`constants/\`\n- \`services/\` — feature-local orchestration only (calls \`/services/\`, does not duplicate Shared Services)\n`
  );
  writeIfMissing(`${base}/actions/actions.ts`, ACTIONS(`features/${feature.id}`));
  writeIfMissing(`${base}/types/types.ts`, TYPES(`features/${feature.id}`));
  writeIfMissing(
    `${base}/constants/constants.ts`,
    CONSTANTS(`features/${feature.id}`)
  );
  writeIfMissing(
    `${base}/validators/schema.ts`,
    SCHEMA(`features/${feature.id}`)
  );
  writeIfMissing(
    `${base}/services/service.ts`,
    SERVICE(`features/${feature.id} (orchestration → /services)`)
  );
  writeIfMissing(
    `${base}/index.ts`,
    `/** Public exports for features/${feature.id} — ${feature.mes} */\nexport {};\n`
  );
}

// Forbid notes
const forbids = [
  [
    "features/ai-studio/NO_SETTINGS.md",
    `# No local AI settings\n\nAI configuration is owned exclusively by \`features/platform-settings\` + \`services/settings\` (MES-020).\n`,
  ],
  [
    "features/ask-mendanize/NO_SETTINGS.md",
    `# No local AI settings\n\nAI configuration is owned exclusively by MES-020.\n`,
  ],
  [
    "features/search/NO_RECOMMENDATIONS.md",
    `# No local recommendations\n\nUse \`services/recommendations\` (MES-018) only.\n`,
  ],
  [
    "features/user-learning/NO_RECOMMENDATIONS.md",
    `# No local recommendations\n\nUse \`services/recommendations\` (MES-018) only.\n`,
  ],
  [
    "features/analytics/NO_RECOMMENDATIONS.md",
    `# No local recommendations\n\nUse \`services/recommendations\` (MES-018) only.\n`,
  ],
];
for (const [rel, body] of forbids) writeIfMissing(rel, body);

// Root placeholders
writeIfMissing("config/index.ts", CONSTANTS("config"));
writeIfMissing("repositories/index.ts", REPOSITORY("root repositories"));
writeIfMissing("validators/index.ts", SCHEMA("root validators"));
writeIfMissing("actions/index.ts", ACTIONS("root actions"));
writeIfMissing(
  "middleware/index.ts",
  `/** Auth / routing middleware helpers — MES-006 / MES-028 */\nexport {};\n`
);
writeIfMissing(
  "emails/README.md",
  `# Emails\n\nTransactional templates (MES-024). Placeholder — no templates yet.\n`
);
writeIfMissing(
  "tests/README.md",
  `# Tests\n\nProduction readiness & QA (MES-028, MES-029).\n`
);
writeIfMissing(
  "components/README.md",
  `# Components\n\nDesign system & shared UI (MES-003).\n`
);
writeIfMissing(
  "styles/README.md",
  `# Styles\n\nDesign tokens (MES-003).\n`
);
writeIfMissing(
  "styles/tokens.css",
  `/* Design system tokens — MES-003 (placeholder) */\n:root {\n  /* tokens TBD */\n}\n`
);

// Doc filename aliases for Step 1 exact names → Phase 1 docs
const ALIASES = {
  "MSEM-Appendix-A-Engineering-Standards.md": "MSEM-Appendix-A.md",
  "MES-001-Foundation-Product-Vision.md": "MES-001-Foundation-Platform.md",
  "MES-002-Shared-Services-API-Architecture.md": "MES-002-Shared-Services.md",
  "MES-004-Public-Website-Structure.md": "MES-004-Public-Website.md",
  "MES-005-Premium-Homepage-Experience.md": "MES-005-Premium-Homepage.md",
  "MES-006-Authentication-User-Management.md": "MES-006-Authentication.md",
  "MES-007-Admin-Dashboard-Foundation.md": "MES-007-Admin-Dashboard.md",
  "MES-008-Article-Management-System.md": "MES-008-Article-Management.md",
  "MES-009-Categories-Topics-Management.md": "MES-009-Categories-Topics.md",
  "MES-010-Learning-Guides-Management.md": "MES-010-Learning-Guides.md",
  "MES-014-Media-Library-DAM.md": "MES-014-Media-Library.md",
  "MES-015-SEO-Metadata-Management.md": "MES-015-SEO-Metadata.md",
  "MES-016-Navigation-Menu-Management.md": "MES-016-Navigation-Management.md",
  "MES-017-Search-Discovery-Engine.md": "MES-017-Search-Discovery.md",
  "MES-018-Recommendations-Engine.md": "MES-018-Recommendation-Engine.md",
  "MES-020-Platform-Settings-Configuration.md": "MES-020-Platform-Settings.md",
  "MES-022-User-Learning-Personalization.md": "MES-022-User-Learning.md",
  "MES-023-Analytics-Insights-Platform.md": "MES-023-Analytics.md",
  "MES-024-Notification-Communication-System.md": "MES-024-Notifications.md",
  "MES-025-Public-Article-Experience.md": "MES-025-Public-Articles.md",
  "MES-026-Public-Learning-Guide-Experience.md": "MES-026-Public-Learning.md",
  "MES-027-Public-AI-Tools-Directory.md": "MES-027-Public-AI-Tools.md",
  "MES-029-Final-QA-Production-Launch.md": "MES-029-Final-QA.md",
};

for (const [alias, target] of Object.entries(ALIASES)) {
  writeIfMissing(
    `docs/${alias}`,
    `# ${alias.replace(/\\.md$/, "")}\n\n| Field | Value |\n|-------|-------|\n| **Version** | 1.0.0 |\n| **Status** | Alias |\n\n## Purpose\n\nCanonical filename alias for engineering initialization checklists.\n\n**Authoritative document:** [${target}](./${target})\n\nRead and follow \`${target}\` as the source of truth. Do not maintain duplicate content in this alias file.\n`
  );
}

// --- Verification ---
function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

const verification = {
  topLevel: Object.fromEntries(TOP.map((d) => [d, exists(d)])),
  sharedServices: SHARED.map((s) => s.id).filter((id) =>
    exists(`services/${id}`)
  ),
  features: FEATURES.map((f) => f.id).filter((id) => exists(`features/${id}`)),
  noDuplication: {
    aiConfigFoldersInAiStudio: fs
      .readdirSync(path.join(ROOT, "features/ai-studio"), {
        withFileTypes: true,
      })
      .filter((d) => d.isDirectory() && /^(settings|config)$/.test(d.name))
      .map((d) => d.name),
    aiConfigFoldersInAsk: fs
      .readdirSync(path.join(ROOT, "features/ask-mendanize"), {
        withFileTypes: true,
      })
      .filter((d) => d.isDirectory() && /^(settings|config)$/.test(d.name))
      .map((d) => d.name),
    servicesSettingsAiConfig: exists("services/settings/ai-config.ts"),
    servicesRecommendations: exists("services/recommendations"),
    platformSettings: exists("features/platform-settings"),
    authentication: exists("features/authentication"),
    typesApi: exists("types/api.ts"),
  },
  createdCount: created.length,
  skippedCount: skipped.length,
  created,
};

// Check stray recommendations folders under forbidden features
const recStrays = [];
for (const f of ["search", "user-learning", "analytics"]) {
  const dir = path.join(ROOT, "features", f);
  function walk(d, prefix) {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      if (ent.isDirectory()) {
        if (ent.name === "recommendations")
          recStrays.push(`${prefix}/${ent.name}`);
        walk(path.join(d, ent.name), `${prefix}/${ent.name}`);
      }
    }
  }
  if (fs.existsSync(dir)) walk(dir, `features/${f}`);
}
verification.noDuplication.strayRecommendationFolders = recStrays;

// Session folders outside authentication
const sessionStrays = [];
for (const f of FEATURES.map((x) => x.id).filter((id) => id !== "authentication")) {
  const dir = path.join(ROOT, "features", f);
  function walk(d, prefix) {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      if (
        ent.isDirectory() &&
        /^(session|auth|authentication)$/.test(ent.name)
      ) {
        sessionStrays.push(`${prefix}/${ent.name}`);
      }
      if (ent.isDirectory()) walk(path.join(d, ent.name), `${prefix}/${ent.name}`);
    }
  }
  if (fs.existsSync(dir)) walk(dir, `features/${f}`);
}
verification.noDuplication.straySessionFolders = sessionStrays;

// API contract check
const apiMissingContract = [];
function walkApi(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkApi(full);
    else if (ent.name === "route.ts" && /api[\\/](public|dashboard)/.test(full)) {
      const text = fs.readFileSync(full, "utf8");
      if (!text.includes("ApiResponse")) {
        apiMissingContract.push(path.relative(ROOT, full));
      }
    }
  }
}
walkApi(path.join(ROOT, "app/api"));
verification.noDuplication.apiRoutesMissingContract = apiMissingContract;

fs.writeFileSync(
  path.join(ROOT, "scripts/scaffold-architecture.result.json"),
  JSON.stringify(verification, null, 2)
);

console.log(`Created ${created.length} files; skipped ${skipped.length}.`);
console.log(
  "AI-config dirs in ai-studio:",
  verification.noDuplication.aiConfigFoldersInAiStudio
);
console.log(
  "AI-config dirs in ask:",
  verification.noDuplication.aiConfigFoldersInAsk
);
console.log(
  "Stray recommendations:",
  verification.noDuplication.strayRecommendationFolders
);
console.log(
  "Stray session folders:",
  verification.noDuplication.straySessionFolders
);
console.log(
  "API missing contract:",
  verification.noDuplication.apiRoutesMissingContract
);
console.log("Wrote scripts/scaffold-architecture.result.json");
