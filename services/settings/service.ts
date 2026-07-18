/**
 * Settings Shared Service (MES-002 / MES-003 / MES-004 / MES-020)
 * Platform configuration including AI config, design tokens, and navigation seeds.
 */

import {
  getDesignTokens as getPersistedDesignTokens,
  getSeededDesignTokens,
  type DesignTokens,
} from "./design-tokens";
import {
  getNavigationConfig,
  getSeededNavigationConfig,
  type NavigationConfig,
} from "./navigation";
import {
  loadAiConfig,
  loadDesignTokensWithOverrides,
  loadPlatformSettingsSummary,
  saveAiConfig,
} from "./platform";
import type { AiConfig, PlatformSettings } from "./types";

export {
  getSeededDesignTokens,
  getNavigationConfig,
  getSeededNavigationConfig,
};
export type { DesignTokens, NavigationConfig };

export async function getPlatformSettings(): Promise<PlatformSettings> {
  return loadPlatformSettingsSummary();
}

export async function getAiConfig(): Promise<AiConfig> {
  return loadAiConfig();
}

export async function updatePlatformSettings(
  _patch: Partial<PlatformSettings>,
): Promise<PlatformSettings> {
  // Specific section updates go through dedicated platform setters.
  return loadPlatformSettingsSummary();
}

export async function updateAiConfig(
  patch: Partial<AiConfig>,
): Promise<AiConfig> {
  return saveAiConfig(patch);
}

/** Prefer branding-aware tokens (MES-020). */
export async function getDesignTokens(): Promise<DesignTokens> {
  try {
    return await loadDesignTokensWithOverrides();
  } catch {
    return getPersistedDesignTokens();
  }
}

export * from "./platform";
export * from "./platform-types";
