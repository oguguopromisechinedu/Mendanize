/**
 * ONLY AI-configuration accessors (MES-020).
 * features/ai-studio and features/ask-mendanize MUST import from here —
 * they must not define their own settings/config modules.
 */

import type { AiConfig } from "./types";
import { getAiConfig, updateAiConfig } from "./service";

export { getAiConfig, updateAiConfig };

/** Explicit re-export surface for MES-020 consumers. */
export async function readAiConfig(): Promise<AiConfig> {
  return getAiConfig();
}

export async function writeAiConfig(patch: Partial<AiConfig>): Promise<AiConfig> {
  return updateAiConfig(patch);
}

/**
 * Provider credentials remain env-based for this phase.
 * Returns whether a provider key appears present — never returns the secret.
 */
export async function resolveProviderCredentials(
  provider: string,
): Promise<{ configured: boolean; source: "env" | "none" }> {
  const map: Record<string, string | undefined> = {
    claude: process.env.ANTHROPIC_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    openai: process.env.OPENAI_API_KEY,
  };
  const key = map[provider]?.trim();
  return { configured: Boolean(key), source: key ? "env" : "none" };
}
