import {
  getAiPlatformSettings,
  getAuthenticationSettings,
  getBrandingSettings,
  getEmailSettings,
  getGeneralSettings,
  getLocalizationSettings,
  getMaintenanceConfiguration,
  getSearchPlatformSettings,
  getSecuritySettings,
  getSettingsDashboard,
  listFeatureFlags,
} from "@/services/settings";

export async function loadSettingsDashboard() {
  return getSettingsDashboard();
}

export async function loadGeneral() {
  return getGeneralSettings();
}

export async function loadBranding() {
  return getBrandingSettings();
}

export async function loadLocalization() {
  return getLocalizationSettings();
}

export async function loadAuthSettings() {
  return getAuthenticationSettings();
}

export async function loadAiSettings() {
  return getAiPlatformSettings();
}

export async function loadSearchPlatform() {
  return getSearchPlatformSettings();
}

export async function loadEmail() {
  return getEmailSettings();
}

export async function loadSecurity() {
  return getSecuritySettings();
}

export async function loadMaintenance() {
  return getMaintenanceConfiguration();
}

export async function loadFeatureFlags() {
  return listFeatureFlags();
}
