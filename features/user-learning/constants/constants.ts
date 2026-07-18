export const LEARNING_NAV = [
  { label: "Dashboard", href: "/learning" },
  { label: "Continue", href: "/learning/continue" },
  { label: "Saved", href: "/learning/saved" },
  { label: "History", href: "/learning/history" },
  { label: "For you", href: "/learning/recommended" },
  { label: "Interests", href: "/learning/interests" },
  { label: "Preferences", href: "/learning/preferences" },
] as const;

export const DIFFICULTY_OPTIONS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
] as const;

export const THEME_OPTIONS = ["system", "light", "dark"] as const;

export const SAVED_TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "article", label: "Articles" },
  { value: "guide", label: "Guides" },
  { value: "ai_tool", label: "AI Tools" },
] as const;
