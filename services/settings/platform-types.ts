/** Platform Settings types (MES-020). */

export type PlatformSettingRecord = {
  id: string;
  platformName: string;
  description: string | null;
  websiteUrl: string;
  contactEmail: string;
  supportEmail: string;
  timeZone: string;
  dateFormat: string;
  language: string;
  defaultHomepage: string;
  defaultUserRole: string;
  updatedAt: string;
};

export type BrandingSettingRecord = {
  id: string;
  brandName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  tokenOverridesJson: string | null;
  updatedAt: string;
};

export type LocalizationSettingRecord = {
  id: string;
  defaultLanguage: string;
  availableLanguages: string;
  timeZone: string;
  dateFormat: string;
  numberFormat: string;
  currencyCode: string;
  updatedAt: string;
};

export type AuthenticationSettingRecord = {
  id: string;
  registrationEnabled: boolean;
  emailVerification: boolean;
  passwordPolicyNote: string | null;
  sessionTimeoutMinutes: number;
  rememberMeEnabled: boolean;
  twoFactorRequired: boolean;
  twoFactorPlaceholder: boolean;
  updatedAt: string;
};

export type AIPlatformSettingRecord = {
  id: string;
  defaultTextProvider: string;
  defaultImageProvider: string;
  defaultVideoProvider: string;
  maxResponseLength: number;
  conversationHistoryOn: boolean;
  rateLimitPlaceholder: string | null;
  enabledProviders: string[];
  models: Record<string, string>;
  updatedAt: string;
};

export type SearchPlatformSettingRecord = {
  id: string;
  enabled: boolean;
  suggestionsEnabled: boolean;
  trendingEnabled: boolean;
  resultLimit: number;
  updatedAt: string;
};

export type EmailSettingRecord = {
  id: string;
  senderName: string;
  senderEmail: string;
  smtpHost: string | null;
  smtpPort: number;
  smtpUser: string | null;
  smtpPassword: string | null;
  smtpSecure: boolean;
  smtpPlaceholder: string | null;
  templatesNote: string | null;
  defaultReplyTo: string | null;
  brandLogoUrl: string | null;
  footerHtml: string | null;
  companyAddress: string | null;
  socialLinksJson: string | null;
  unsubscribeFooterHtml: string | null;
  trackingOpens: boolean;
  trackingClicks: boolean;
  updatedAt: string;
};

export type SecuritySettingRecord = {
  id: string;
  maxLoginAttempts: number;
  auditLoggingEnabled: boolean;
  apiAccessPlaceholder: string | null;
  updatedAt: string;
};

export type FeatureFlagRecord = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  enabled: boolean;
  sortOrder: number;
};

export type MaintenanceConfigurationRecord = {
  id: string;
  enabled: boolean;
  message: string | null;
  allowedAdminEmails: string | null;
  showBanner: boolean;
  updatedAt: string;
};

export type SettingsDashboardOverview = {
  general: PlatformSettingRecord;
  maintenance: MaintenanceConfigurationRecord;
  ai: AIPlatformSettingRecord;
  search: SearchPlatformSettingRecord;
  email: EmailSettingRecord;
  auth: AuthenticationSettingRecord;
  flags: FeatureFlagRecord[];
  activeFeatureCount: number;
  version: string;
  lastUpdated: string;
};
