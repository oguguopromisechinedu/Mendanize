/** Public exports — features/user-learning (MES-022) */

export { LearningNav } from "./components/learning-nav";
export { LearningDashboardView } from "./components/learning-dashboard-view";
export type { LearnerDashboardExtras } from "./components/learning-dashboard-view";
export { ProjectsView } from "./components/projects-view";
export { WorkspaceView } from "./components/workspace-view";
export { LearnerShell } from "./components/learner-shell";
export { LearnerComingSoon } from "./components/learner-coming-soon";
export { AiAssistantCard } from "./components/ai-assistant-card";
export { ContinueLearningView } from "./components/continue-learning-view";
export { SavedContentView } from "./components/saved-content-view";
export { HistoryView } from "./components/history-view";
export { RecommendedView } from "./components/recommended-view";
export { InterestsView } from "./components/interests-view";
export { PreferencesView } from "./components/preferences-view";
export {
  loadContinueLearning,
  loadHistory,
  loadInterestsPage,
  loadLearningDashboard,
  loadLearnerEcosystemExtras,
  loadPreferencesPage,
  loadRecommended,
  loadSaved,
} from "./services/service";
export type { LearnerEcosystemSnapshot } from "./services/ecosystem-dashboard";
export {
  deleteGoalAction,
  saveContentAction,
  saveGoalAction,
  savePreferencesAction,
  setInterestAction,
  unsaveContentAction,
} from "./actions/actions";
