import fs from "node:fs";
import path from "node:path";

export const DOCS = path.resolve(process.cwd(), "docs");
export const VERSION = "1.0.0";
export const DATE = "2026-07-14";

export function frontMatter({ title, version = VERSION, status = "Approved" }) {
  return `# ${title}

| Field | Value |
|-------|-------|
| **Version** | ${version} |
| **Status** | ${status} |
| **Last Updated** | ${DATE} |
| **Owner** | Mendanize Platform Architecture |
`;
}

export function section(name, body) {
  return `\n## ${name}\n\n${body.trim()}\n`;
}

export function writeDoc(filename, content) {
  fs.mkdirSync(DOCS, { recursive: true });
  const target = path.join(DOCS, filename);
  fs.writeFileSync(target, content.trimEnd() + "\n", "utf8");
  return target;
}

export function refs(links) {
  return links.map((l) => `- [${l.label}](./${l.file})`).join("\n");
}

export function mesShell({
  title,
  id,
  purpose,
  scope,
  dependencies,
  outOfScope,
  architecture,
  implementation,
  acceptance,
  related,
}) {
  return [
    frontMatter({ title: `${id}: ${title}` }),
    section("Purpose", purpose),
    section("Scope", scope),
    section("Out of Scope", outOfScope || "Deferred items are explicitly listed in related MES documents."),
    section("Dependencies", dependencies),
    section("Architecture", architecture),
    section("Implementation Notes", implementation),
    section("Acceptance Criteria", acceptance),
    section("Related Documents", refs(related)),
  ].join("\n");
}
