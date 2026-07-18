import { generateCore } from "./generate-core.mjs";
import { generateMesA } from "./generate-mes-a.mjs";
import { generateMesB } from "./generate-mes-b.mjs";
import { generateSupporting } from "./generate-supporting.mjs";
import fs from "node:fs";
import path from "node:path";
import { DOCS } from "./helpers.mjs";

const REQUIRED = [
  "README.md",
  "MES-INDEX.md",
  "MSEM.md",
  "MSEM-Appendix-A.md",
  "MES-001-Foundation-Platform.md",
  "MES-002-Shared-Services.md",
  "MES-003-Design-System.md",
  "MES-004-Public-Website.md",
  "MES-005-Premium-Homepage.md",
  "MES-006-Authentication.md",
  "MES-007-Admin-Dashboard.md",
  "MES-008-Article-Management.md",
  "MES-009-Categories-Topics.md",
  "MES-010-Learning-Guides.md",
  "MES-011-Admin-AI-Studio.md",
  "MES-012-AI-Tools-Management.md",
  "MES-013-Homepage-Content-Management.md",
  "MES-014-Media-Library.md",
  "MES-015-SEO-Metadata.md",
  "MES-016-Navigation-Management.md",
  "MES-017-Search-Discovery.md",
  "MES-018-Recommendation-Engine.md",
  "MES-019-Ask-Mendanize-AI.md",
  "MES-020-Platform-Settings.md",
  "MES-021-Billing-Subscriptions.md",
  "MES-022-User-Learning.md",
  "MES-023-Analytics.md",
  "MES-024-Notifications.md",
  "MES-025-Public-Articles.md",
  "MES-026-Public-Learning.md",
  "MES-027-Public-AI-Tools.md",
  "MES-028-Production-Readiness.md",
  "MES-029-Final-QA.md",
  "APP-ROUTER-PATHS.md",
  "DATABASE.md",
  "API-STANDARDS.md",
  "SECURITY-STANDARDS.md",
  "ENVIRONMENT.md",
  "DEPENDENCY-MAP.md",
  "MODULE-MAP.md",
  "CODING-STANDARDS.md",
  "DEPLOYMENT.md",
  "CHANGELOG.md",
];

const written = [
  ...generateCore(),
  ...generateMesA(),
  ...generateMesB(),
  ...generateSupporting(),
];

const missing = REQUIRED.filter((f) => !fs.existsSync(path.join(DOCS, f)));
const empty = REQUIRED.filter((f) => {
  const p = path.join(DOCS, f);
  if (!fs.existsSync(p)) return true;
  return fs.statSync(p).size < 200;
});

const report = {
  writtenCount: written.length,
  requiredCount: REQUIRED.length,
  missing,
  emptyOrTiny: empty,
  files: REQUIRED.map((f) => {
    const p = path.join(DOCS, f);
    const st = fs.existsSync(p) ? fs.statSync(p) : null;
    return { file: f, bytes: st?.size ?? 0, ok: !!st && st.size >= 200 };
  }),
};

fs.writeFileSync(
  path.join(process.cwd(), "scripts/docs-gen/phase1-result.json"),
  JSON.stringify(report, null, 2)
);

console.log(`Wrote ${written.length} documentation files to docs/`);
console.log(`Required: ${REQUIRED.length}`);
console.log(`Missing: ${missing.length ? missing.join(", ") : "none"}`);
console.log(`Empty/tiny (<200B): ${empty.length ? empty.join(", ") : "none"}`);
console.log("Report: scripts/docs-gen/phase1-result.json");

if (missing.length || empty.length) process.exitCode = 1;
