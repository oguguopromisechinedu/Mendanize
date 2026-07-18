import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

for (const fileName of [".env", ".env.local"]) {
  const envPath = resolve(process.cwd(), fileName);
  if (!existsSync(envPath)) continue;

  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    if (!key) continue;

    const rawValue = valueParts.join("=").trim();
    const value = rawValue.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
