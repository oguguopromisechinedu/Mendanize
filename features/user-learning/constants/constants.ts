import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Bot,
  Code2,
  Folder,
  FolderKanban,
  GraduationCap,
  Home,
  Library,
  MessageSquareText,
  NotebookPen,
  Users,
  Wrench,
} from "lucide-react";

/**
 * Serializable icon keys — required because LearnerShell is a Client Component
 * and Server layouts cannot pass LucideIcon functions across the RSC boundary.
 */
export type LearnerIconName =
  | "award"
  | "bookOpen"
  | "bot"
  | "code2"
  | "folder"
  | "folderKanban"
  | "graduationCap"
  | "home"
  | "library"
  | "messageSquareText"
  | "notebookPen"
  | "users"
  | "wrench";

export const LEARNER_ICON_MAP: Record<LearnerIconName, LucideIcon> = {
  award: Award,
  bookOpen: BookOpen,
  bot: Bot,
  code2: Code2,
  folder: Folder,
  folderKanban: FolderKanban,
  graduationCap: GraduationCap,
  home: Home,
  library: Library,
  messageSquareText: MessageSquareText,
  notebookPen: NotebookPen,
  users: Users,
  wrench: Wrench,
};

export type LearnerNavItem = {
  label: string;
  href: string;
  icon: LearnerIconName;
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
 */
export const LEARNER_NAV_GROUPS: LearnerNavGroup[] = [
  {
    id: "main",
    items: [
      { label: "Home", href: "/account", icon: "home" },
      { label: "Learn", href: "/account/continue", icon: "bookOpen", flagKey: "guides" },
      { label: "Courses", href: "/account/guides", icon: "graduationCap", flagKey: "guides" },
      { label: "AI Tutor", href: "/ask", icon: "bot", flagKey: "ask_mendanize" },
      { label: "Coding Workspace", href: "/account/workspace", icon: "code2" },
      { label: "Projects", href: "/account/projects", icon: "folderKanban" },
      { label: "Prompt Library", href: "/account/prompts", icon: "messageSquareText" },
      { label: "Notes", href: "/account/notes", icon: "notebookPen" },
      { label: "AI Tools", href: "/account/ai-tools", icon: "wrench", flagKey: "ai_tools" },
      { label: "Resources", href: "/account/articles", icon: "library", flagKey: "articles" },
      { label: "Certificates", href: "/account/certificates", icon: "award" },
      {
        label: "Community",
        href: "/account/community",
        icon: "users",
        badge: "Soon",
        soon: true,
      },
    ],
  },
];

/** Fallback only — runtime spaces come from Admin-published project templates. */
export const LEARNER_SPACES = [
  {
    label: "Browse project templates",
    href: "/account/projects",
    icon: "folder" as const satisfies LearnerIconName,
  },
] as const;

export const LEARNER_QUICK_ACTIONS = [
  {
    label: "Browse Courses",
    href: "/account/guides",
    description: "Admin-published learning paths",
    icon: "graduationCap" as const satisfies LearnerIconName,
    flagKey: "guides",
  },
  {
    label: "AI Tutor",
    href: "/ask",
    description: "Powered by Admin AI settings",
    icon: "bot" as const satisfies LearnerIconName,
    flagKey: "ask_mendanize",
  },
  {
    label: "Coding Workspace",
    href: "/account/workspace",
    description: "Practice in context",
    icon: "code2" as const satisfies LearnerIconName,
  },
  {
    label: "Create Project",
    href: "/account/projects",
    description: "From Admin templates",
    icon: "folderKanban" as const satisfies LearnerIconName,
  },
  {
    label: "Prompt Library",
    href: "/account/prompts",
    description: "Admin-published packs",
    icon: "messageSquareText" as const satisfies LearnerIconName,
  },
  {
    label: "Explore Tools",
    href: "/account/ai-tools",
    description: "Admin-published tools",
    icon: "wrench" as const satisfies LearnerIconName,
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
