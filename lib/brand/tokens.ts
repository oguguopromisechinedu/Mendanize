/**
 * Mendanize brand & design tokens
 * Dark-first premium AI SaaS visual system
 */

export const brand = {
  name: "Mendanize",
  tagline: "Create smarter. Ship faster.",
  description:
    "Premium AI workspace for creators, teams, and businesses — generate content, automate workflows, and access specialized AI tools in one place.",
  voice: {
    tone: "confident, clear, inventive",
    personality: ["premium", "intelligent", "efficient", "creative"],
  },
} as const;

export const colors = {
  /** Core brand — violet → cyan gradient axis */
  primary: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
  },
  accent: {
    cyan: "#22d3ee",
    emerald: "#34d399",
    amber: "#fbbf24",
    rose: "#fb7185",
  },
  surface: {
    base: "#030712",
    elevated: "#0f172a",
    card: "rgba(255,255,255,0.04)",
    glass: "rgba(255,255,255,0.06)",
  },
  semantic: {
    success: "#34d399",
    warning: "#fbbf24",
    error: "#f87171",
    info: "#38bdf8",
  },
} as const;

export const typography = {
  display: "var(--font-display)",
  heading: "var(--font-heading)",
  body: "var(--font-body)",
  mono: "var(--font-geist-mono)",
  scale: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
    "7xl": "4.5rem",
  },
} as const;

export const motion = {
  duration: { fast: 0.15, normal: 0.25, slow: 0.4 },
  easing: {
    default: [0.22, 1, 0.36, 1] as const,
    spring: [0.34, 1.56, 0.64, 1] as const,
  },
} as const;

export const spacing = {
  section: "py-24 sm:py-32",
  container: "mx-auto max-w-7xl px-6 sm:px-8 lg:px-10",
} as const;
