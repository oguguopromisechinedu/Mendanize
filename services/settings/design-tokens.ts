/**
 * Design token seed defaults (MES-003).
 * Owned by Settings Service — admin persistence lands in MES-020.
 * CSS mirrors these values in styles/tokens.css.
 */

export type DesignColorTokens = {
  background: string;
  foreground: string;
  surface: string;
  card: string;
  border: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  success: string;
  warning: string;
  error: string;
  hover: string;
  focus: string;
};

export type DesignTypographyTokens = {
  fontDisplay: string;
  fontBody: string;
  display: string;
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  bodyLarge: string;
  body: string;
  small: string;
  caption: string;
};

export type DesignTokens = {
  colors: DesignColorTokens;
  colorsLight: DesignColorTokens;
  typography: DesignTypographyTokens;
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadow: Record<string, string>;
  container: Record<string, string>;
  breakpoints: Record<string, string>;
  motion: {
    durationFast: string;
    durationBase: string;
    durationSlow: string;
    easeDefault: string;
    easeOut: string;
  };
  zIndex: Record<string, string>;
};

/** Deep navy + violet neon — Mendanize brand palette. */
export const SEEDED_DESIGN_TOKENS: DesignTokens = {
  colors: {
    background: "#0A0B1E",
    foreground: "#F5F5F4",
    surface: "#12132A",
    card: "#16172E",
    border: "rgba(139, 92, 246, 0.15)",
    primary: "#8B5CF6",
    primaryForeground: "#FFFFFF",
    secondary: "#1E1F3A",
    secondaryForeground: "#F5F5F4",
    accent: "#6366F1",
    accentForeground: "#FFFFFF",
    muted: "#1A1B35",
    mutedForeground: "#A8A29E",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    hover: "rgba(139, 92, 246, 0.12)",
    focus: "#8B5CF6",
  },
  colorsLight: {
    background: "#FAFAF9",
    foreground: "#0A0B1E",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    border: "rgba(124, 58, 237, 0.15)",
    primary: "#7C3AED",
    primaryForeground: "#FFFFFF",
    secondary: "#F5F5F4",
    secondaryForeground: "#0A0B1E",
    accent: "#6366F1",
    accentForeground: "#FFFFFF",
    muted: "#F5F5F4",
    mutedForeground: "#78716C",
    success: "#16A34A",
    warning: "#D97706",
    error: "#DC2626",
    hover: "rgba(124, 58, 237, 0.1)",
    focus: "#7C3AED",
  },
  typography: {
    fontDisplay: "var(--font-display)",
    fontBody: "var(--font-body)",
    display: "clamp(2.75rem, 5vw, 4.5rem)",
    h1: "clamp(2rem, 3.5vw, 3rem)",
    h2: "clamp(1.5rem, 2.5vw, 2.25rem)",
    h3: "1.5rem",
    h4: "1.25rem",
    bodyLarge: "1.125rem",
    body: "1rem",
    small: "0.875rem",
    caption: "0.75rem",
  },
  spacing: {
    0: "0",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
  },
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.25rem",
    full: "9999px",
  },
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.35)",
    md: "0 8px 24px rgba(0,0,0,0.35)",
    lg: "0 16px 48px rgba(0,0,0,0.45)",
    glow: "0 0 0 1px rgba(139,92,246,0.35), 0 8px 40px rgba(99,102,241,0.25)",
  },
  container: {
    sm: "40rem",
    md: "48rem",
    lg: "64rem",
    xl: "80rem",
    "2xl": "90rem",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  motion: {
    durationFast: "120ms",
    durationBase: "200ms",
    durationSlow: "320ms",
    easeDefault: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  },
  zIndex: {
    base: "0",
    dropdown: "40",
    sticky: "50",
    overlay: "60",
    modal: "70",
    toast: "80",
    max: "100",
  },
};

/**
 * Canonical design-token read path (MES-003).
 * Prefer `getDesignTokens` from `services/settings` which merges MES-020 branding.
 */
export async function getDesignTokens(): Promise<DesignTokens> {
  return structuredClone(SEEDED_DESIGN_TOKENS);
}

/** Sync access for CSS-generation / build-time helpers. */
export function getSeededDesignTokens(): DesignTokens {
  return SEEDED_DESIGN_TOKENS;
}
