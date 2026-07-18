/** Public exports — features/platform-settings (MES-020) */

export { SettingsDashboardView } from "./components/settings-dashboard-view";
export { SettingsCmsNav } from "./components/settings-cms-nav";
export {
  AiSettingsView,
  AuthSettingsView,
  BackupSettingsView,
  BrandingSettingsView,
  EmailSettingsView,
  FeatureFlagsView,
  GeneralSettingsView,
  LocalizationSettingsView,
  MaintenanceSettingsView,
  SearchPlatformSettingsView,
  SecuritySettingsView,
} from "./components/settings-forms";
export {
  loadAiSettings,
  loadAuthSettings,
  loadBranding,
  loadEmail,
  loadFeatureFlags,
  loadGeneral,
  loadLocalization,
  loadMaintenance,
  loadSearchPlatform,
  loadSecurity,
  loadSettingsDashboard,
} from "./services/service";
