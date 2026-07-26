import type { LucideIcon } from "lucide-react";
import {
  Award,
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  BriefcaseBusiness,
  Code2,
  Folder,
  FolderKanban,
  GraduationCap,
  Home,
  MessageSquare,
  MessageSquareText,
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
  | "briefcaseBusiness"
  | "code2"
  | "folder"
  | "folderKanban"
  | "graduationCap"
  | "home"
  | "messageSquare"
  | "messageSquareText"
  | "store"
  | "users"
  | "wrench";

export const LEARNER_ICON_MAP: Record<LearnerIconName, LucideIcon> = {
  award: Award,
  bell: Bell,
  bookOpen: BookOpen,
  bot: Bot,
  briefcase: Briefcase,
  briefcaseBusiness: BriefcaseBusiness,
  code2: Code2,
  folder: Folder,
  folderKanban: FolderKanban,
  graduationCap: GraduationCap,
  home: Home,
  messageSquare: MessageSquare,
  messageSquareText: MessageSquareText,
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
 * Learner sidebar IA — matches Public User Account mockup skeleton.
 * Visibility filtered by Admin FeatureFlags via loadLearnerShellConfig.
 */
export const LEARNER_NAV_GROUPS: LearnerNavGroup[] = [
  {
    id: "main",
    items: [
      { label: "Home", href: "/account", icon: "home" },
      {
        label: "Learn",
        href: "/account/continue",
        icon: "bookOpen",
        flagKey: "guides",
      },
      {
        label: "Courses",
        href: "/account/guides",
        icon: "graduationCap",
        flagKey: "guides",
      },
      {
        label: "AI Tutor",
        href: "/ask",
        icon: "bot",
        flagKey: "ask_mendanize",
      },
      {
        label: "Coding Workspace",
        href: "/account/workspace",
        icon: "code2",
      },
      { label: "Projects", href: "/account/projects", icon: "folderKanban" },
      {
        label: "Prompt Library",
        href: "/account/prompts",
        icon: "messageSquareText",
      },
      {
        label: "AI Tools",
        href: "/account/ai-tools",
        icon: "wrench",
        flagKey: "ai_tools",
      },
      {
        label: "AI Tools Marketplace",
        href: "/account/tools-marketplace",
        icon: "store",
        badge: "New",
      },
      {
        label: "Certificates",
        href: "/account/certificates",
        icon: "award",
      },
      { label: "Community", href: "/community", icon: "users" },
      {
        label: "Career Hub",
        href: "/account/career",
        icon: "briefcase",
      },
      {
        label: "Work Marketplace",
        href: "/account/work",
        icon: "briefcaseBusiness",
        badge: "New",
      },
      {
        label: "Messages",
        href: "/account/messages",
        icon: "messageSquare",
        soon: true,
      },
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
    description: "Learning paths",
    icon: "graduationCap" as const satisfies LearnerIconName,
    flagKey: "guides",
  },
  {
    label: "AI Tutor",
    href: "/ask",
    description: "Ask Mendanize AI",
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
    label: "Projects",
    href: "/account/projects",
    description: "Build & ship",
    icon: "folderKanban" as const satisfies LearnerIconName,
  },
  {
    label: "Community",
    href: "/community",
    description: "Discuss & collaborate",
    icon: "users" as const satisfies LearnerIconName,
  },
  {
    label: "Work Marketplace",
    href: "/account/work",
    description: "Find paid work",
    icon: "briefcaseBusiness" as const satisfies LearnerIconName,
  },
  {
    label: "AI Tools Marketplace",
    href: "/account/tools-marketplace",
    description: "Buy & sell AI tools",
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
  { label: "Notes", href: "/account/notes" },
  { label: "Articles", href: "/account/articles" },
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

/** Your Journey stepper on the account home (mockup skeleton). */
export const LEARNER_JOURNEY_STEPS = [
  {
    step: 1,
    title: "Learn",
    description: "Take courses and master skills",
    href: "/account/guides",
  },
  {
    step: 2,
    title: "Build",
    description: "Build projects in the coding workspace",
    href: "/account/workspace",
  },
  {
    step: 3,
    title: "Get Certified",
    description: "Earn certificates and verified badges",
    href: "/account/certificates",
  },
  {
    step: 4,
    title: "Build Portfolio",
    description: "Showcase your projects and skills",
    href: "/account/projects",
  },
  {
    step: 5,
    title: "Get Hired",
    description: "Find work and complete real projects",
    href: "/account/work",
  },
  {
    step: 6,
    title: "Earn & Grow",
    description: "Build reputation and earn online income",
    href: "/account/career",
  },
] as const;
