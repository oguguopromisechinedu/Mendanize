import type { LucideIcon } from "lucide-react";
import {
  Award,
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  Code2,
  FolderKanban,
  GraduationCap,
  Home,
  MessageSquare,
  MessageSquareText,
  Store,
  Users,
  Folder,
  Wrench,
  BriefcaseBusiness,
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
 * Learner sidebar IA — matches Public User Account mockup skeleton.
 * Visibility filtered by Admin FeatureFlags via loadLearnerShellConfig.
 */
export const LEARNER_NAV_GROUPS: LearnerNavGroup[] = [
  {
    id: "main",
    items: [
      { label: "Home", href: "/account", icon: Home },
      { label: "Learn", href: "/account/continue", icon: BookOpen, flagKey: "guides" },
      {
        label: "Courses",
        href: "/account/guides",
        icon: GraduationCap,
        flagKey: "guides",
      },
      { label: "AI Tutor", href: "/ask", icon: Bot, flagKey: "ask_mendanize" },
      { label: "Coding Workspace", href: "/account/workspace", icon: Code2 },
      { label: "Projects", href: "/account/projects", icon: FolderKanban },
      {
        label: "Prompt Library",
        href: "/account/prompts",
        icon: MessageSquareText,
      },
      { label: "AI Tools", href: "/account/ai-tools", icon: Wrench, flagKey: "ai_tools" },
      {
        label: "AI Tools Marketplace",
        href: "/account/tools-marketplace",
        icon: Store,
        badge: "New",
        soon: true,
      },
      { label: "Certificates", href: "/account/certificates", icon: Award },
      { label: "Community", href: "/community", icon: Users },
      {
        label: "Career Hub",
        href: "/account/career",
        icon: Briefcase,
        soon: true,
      },
      {
        label: "Work Marketplace",
        href: "/account/work",
        icon: BriefcaseBusiness,
        badge: "New",
        soon: true,
      },
      {
        label: "Messages",
        href: "/account/messages",
        icon: MessageSquare,
        soon: true,
      },
      { label: "Notifications", href: "/account/notifications", icon: Bell },
    ],
  },
];

/** Fallback only — runtime spaces come from Admin-published project templates. */
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
    description: "Learning paths",
    icon: GraduationCap,
    flagKey: "guides",
  },
  {
    label: "AI Tutor",
    href: "/ask",
    description: "Ask Mendanize AI",
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
    label: "Projects",
    href: "/account/projects",
    description: "Build & ship",
    icon: FolderKanban,
  },
  {
    label: "Community",
    href: "/community",
    description: "Discuss & collaborate",
    icon: Users,
  },
  {
    label: "Work Marketplace",
    href: "/account/work",
    description: "Coming soon",
    icon: BriefcaseBusiness,
    soon: true,
  },
  {
    label: "AI Tools Marketplace",
    href: "/account/tools-marketplace",
    description: "Coming soon",
    icon: Store,
    soon: true,
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
