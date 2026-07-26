/**
 * Learner shell config — Admin dashboard is the single source of truth.
 * Nav visibility, feature availability, and spaces come from Admin-managed data.
 */

import { listLearnerProjects } from "@/services/ecosystem";
import { getFeatureFlagMap } from "@/services/settings/platform";
import {
  LEARNER_NAV_GROUPS,
  LEARNER_QUICK_ACTIONS,
  type LearnerNavGroup,
  type LearnerNavItem,
} from "@/features/user-learning/constants/constants";

export type LearnerSpaceLink = {
  label: string;
  href: string;
};

export type LearnerShellConfig = {
  /** Admin FeatureFlag map (key → enabled) */
  flags: Record<string, boolean>;
  /** Nav groups filtered by Admin feature flags */
  navGroups: LearnerNavGroup[];
  /** Quick actions filtered by Admin feature flags */
  quickActions: Array<(typeof LEARNER_QUICK_ACTIONS)[number]>;
  /** Real learner projects (Admin-published templates the user started) */
  spaces: LearnerSpaceLink[];
};

function itemAllowed(item: LearnerNavItem, flags: Record<string, boolean>) {
  if (!item.flagKey) return true;
  return flags[item.flagKey] !== false;
}

export async function loadLearnerShellConfig(
  userId: string,
): Promise<LearnerShellConfig> {
  const [flags, projects] = await Promise.all([
    getFeatureFlagMap(),
    listLearnerProjects(userId).catch(() => []),
  ]);

  const navGroups = LEARNER_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => itemAllowed(item, flags)),
  })).filter((group) => group.items.length > 0);

  const quickActions = LEARNER_QUICK_ACTIONS.filter((action) => {
    const flagKey = (action as { flagKey?: string }).flagKey;
    if (!flagKey) return true;
    return flags[flagKey] !== false;
  });

  const spaces: LearnerSpaceLink[] =
    projects.length > 0
      ? projects.slice(0, 8).map((p) => ({
          label: p.template?.title ?? "Project",
          href: `/account/projects?id=${p.id}`,
        }))
      : [
          {
            label: "Browse project templates",
            href: "/account/projects",
          },
        ];

  return { flags, navGroups, quickActions, spaces };
}
