/** Settings Shared Service types (MES-002 / MES-003). */

import type { DesignTokens } from "./design-tokens";

export type PlatformSettings = {
  siteName: string;
  tagline?: string;
  /** Partial overrides of seeded design tokens (MES-003 / MES-020). */
  designTokens?: Partial<DesignTokens> | Record<string, string>;
  featureFlags?: Record<string, boolean>;
};

export type AiConfig = {
  defaultTextProvider?: string;
  defaultImageProvider?: string;
  models?: Record<string, string>;
  enabledProviders?: string[];
};

export type { DesignTokens, DesignColorTokens, DesignTypographyTokens } from "./design-tokens";
