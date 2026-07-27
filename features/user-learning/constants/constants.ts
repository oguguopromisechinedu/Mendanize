import type { LucideIcon } from "lucide-react";
import {
  Award,
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  Cloud,
  Code2,
  Folder,
  FolderKanban,
  GraduationCap,
  Home,
  Library,
  Mail,
  MessageSquareText,
  NotebookPen,
  Rocket,
  ShoppingBag,
  Store,
  Users,
  Wrench,
} from "lucide-react";

/**
 * Serializable icon keys — required because LearnerShell is a Client Component
 * and Server layouts cannot pass LucideIcon functions across the RSC boundary.
 */
export type LearnerIconName =
  | "award"
  | "bell"
  | "bookOpen"
  | "bot"
  | "briefcase"
  | "cloud"
  | "code2"
  | "folder"
  | "folderKanban"
  | "graduationCap"
  | "home"
  | "library"
  | "mail"
  | "messageSquareText"
  | "notebookPen"
  | "rocket"
  | "shoppingBag"
  | "store"
  | "users"
  | "wrench";

export const LEARNER_ICON_MAP: Record<LearnerIconName, LucideIcon> = {
  award: Award,
  bell: Bell,
  bookOpen: BookOpen,
  bot: Bot,
  briefcase: Briefcase,
  cloud: Cloud,
  code2: Code2,
  folder: Folder,
  folderKanban: FolderKanban,
  graduationCap: GraduationCap,
  home: Home,
  library: Library,
  mail: Mail,
  messageSquareText: MessageSquareText,
  notebookPen: NotebookPen,
  rocket: Rocket,
  shoppingBag: ShoppingBag,
  store: Store,
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
      { label: "AI Tools", href: "/account/ai-tools", icon: "wrench", flagKey: "ai_tools" },
      { label: "AI Tools Marketplace", href: "/account/tools-marketplace", icon: "store", badge: "New" },
      { label: "Certificates", href: "/account/certificates", icon: "award" },
      { label: "Portfolio", href: "/account/portfolio", icon: "library" },
      { label: "Mendanize Cloud", href: "/account/cloud", icon: "cloud" },
      { label: "Community", href: "/account/community", icon: "users" },
      { label: "Career Hub", href: "/account/career", icon: "rocket" },
      { label: "Work Marketplace", href: "/account/work", icon: "briefcase", badge: "New" },
      { label: "Company", href: "/account/employer", icon: "store", badge: "New" },
      { label: "Messages", href: "/account/messages", icon: "mail" },
      { label: "Notifications", href: "/account/notifications", icon: "bell" },
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
    description: "Explore topics",
    icon: "graduationCap" as const satisfies LearnerIconName,
    flagKey: "guides",
  },
  {
    label: "AI Tutor",
    href: "/ask",
    description: "Ask anything",
    icon: "bot" as const satisfies LearnerIconName,
    flagKey: "ask_mendanize",
  },
  {
    label: "Coding Workspace",
    href: "/account/workspace",
    description: "Build & code",
    icon: "code2" as const satisfies LearnerIconName,
  },
  {
    label: "Projects",
    href: "/account/projects",
    description: "Build portfolio",
    icon: "folderKanban" as const satisfies LearnerIconName,
  },
  {
    label: "Community",
    href: "/community",
    description: "Connect & learn",
    icon: "users" as const satisfies LearnerIconName,
  },
  {
    label: "Work Marketplace",
    href: "/account/work",
    description: "Find work",
    icon: "briefcase" as const satisfies LearnerIconName,
  },
  {
    label: "AI Tools Marketplace",
    href: "/account/tools-marketplace",
    description: "Discover & sell tools",
    icon: "store" as const satisfies LearnerIconName,
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
