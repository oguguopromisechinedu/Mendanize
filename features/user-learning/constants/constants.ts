import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Bot,
  Code2,
  FolderKanban,
  GraduationCap,
  Home,
  Library,
  MessageSquareText,
  NotebookPen,
  Wrench,
  Users,
  Folder,
} from "lucide-react";

export type LearnerNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  soon?: boolean;
  /** Admin FeatureFlag key — item hidden when Admin disables the flag */
  flagKey?: string;
};

export type LearnerNavGroup = {
  id: string;
  label?: string;
  items: LearnerNavItem[];
};

/**
 * Default learner IA skeleton.
 * Visibility is filtered at runtime by Admin FeatureFlags via loadLearnerShellConfig.
 * Content behind these routes must be Admin-published (guides, tools, articles, templates).
 */
export const LEARNER_NAV_GROUPS: LearnerNavGroup[] = [
  {
    id: "main",
    items: [
      { label: "Home", href: "/account", icon: Home },
      { label: "Learn", href: "/account/continue", icon: BookOpen, flagKey: "guides" },
      { label: "Courses", href: "/account/guides", icon: GraduationCap, flagKey: "guides" },
      { label: "AI Tutor", href: "/ask", icon: Bot, flagKey: "ask_mendanize" },
      { label: "Coding Workspace", href: "/account/workspace", icon: Code2 },
      { label: "Projects", href: "/account/projects", icon: FolderKanban },
      { label: "Prompt Library", href: "/account/prompts", icon: MessageSquareText },
      { label: "Notes", href: "/account/notes", icon: NotebookPen },
      { label: "AI Tools", href: "/account/ai-tools", icon: Wrench, flagKey: "ai_tools" },
      { label: "Resources", href: "/account/articles", icon: Library, flagKey: "articles" },
      { label: "Certificates", href: "/account/certificates", icon: Award },
      {
        label: "Community",
        href: "/account/community",
        icon: Users,
        badge: "Soon",
        soon: true,
      },
    ],
  },
];

/** Fallback only — runtime spaces come from Admin-published project templates the learner started. */
export const LEARNER_SPACES = [
  {
    label: "Browse project templates",
    href: "/account/projects",
    icon: Folder,
  },
] as const;

export const LEARNER_QUICK_ACTIONS = [
  {
    label: "Browse Courses",
    href: "/account/guides",
    description: "Admin-published learning paths",
    icon: GraduationCap,
    flagKey: "guides",
  },
  {
    label: "AI Tutor",
    href: "/ask",
    description: "Powered by Admin AI settings",
    icon: Bot,
    flagKey: "ask_mendanize",
  },
  {
    label: "Coding Workspace",
    href: "/account/workspace",
    description: "Practice in context",
    icon: Code2,
  },
  {
    label: "Create Project",
    href: "/account/projects",
    description: "From Admin templates",
    icon: FolderKanban,
  },
  {
    label: "Prompt Library",
    href: "/account/prompts",
    description: "Admin-published packs",
    icon: MessageSquareText,
  },
  {
    label: "Explore Tools",
    href: "/account/ai-tools",
    description: "Admin-published tools",
    icon: Wrench,
    flagKey: "ai_tools",
  },
] as const;

/** Keep existing flat nav for secondary pages that still use LearningNav. */
export const LEARNING_NAV = [
  { label: "Dashboard", href: "/account" },
  { label: "Continue", href: "/account/continue" },
  { label: "Saved", href: "/account/saved" },
  { label: "History", href: "/account/history" },
  { label: "For you", href: "/account/recommended" },
  { label: "Interests", href: "/account/interests" },
  { label: "Preferences", href: "/account/preferences" },
  { label: "Billing", href: "/account/billing" },
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
