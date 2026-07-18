import { z } from "zod";

export const generalSchema = z.object({
  platformName: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  websiteUrl: z.string().min(1).max(300),
  contactEmail: z.string().email(),
  supportEmail: z.string().email(),
  timeZone: z.string().min(1).max(80),
  dateFormat: z.string().min(1).max(40),
  language: z.string().min(1).max(20),
  defaultHomepage: z.string().min(1).max(200),
  defaultUserRole: z.string().min(1).max(40),
});

export const brandingSchema = z.object({
  brandName: z.string().min(1).max(120),
  logoUrl: z.string().max(500).nullable().optional(),
  faviconUrl: z.string().max(500).nullable().optional(),
  primaryColor: z.string().min(1).max(40),
  secondaryColor: z.string().min(1).max(40),
  accentColor: z.string().min(1).max(40),
  tokenOverridesJson: z.string().max(8000).nullable().optional(),
});

export const localizationSchema = z.object({
  defaultLanguage: z.string().min(1).max(20),
  availableLanguages: z.string().min(1).max(200),
  timeZone: z.string().min(1).max(80),
  dateFormat: z.string().min(1).max(40),
  numberFormat: z.string().min(1).max(40),
  currencyCode: z.string().min(1).max(10),
});

export const authSettingsSchema = z.object({
  registrationEnabled: z.boolean(),
  emailVerification: z.boolean(),
  passwordPolicyNote: z.string().max(2000).nullable().optional(),
  sessionTimeoutMinutes: z.number().int().min(5).max(525600),
  rememberMeEnabled: z.boolean(),
  twoFactorPlaceholder: z.boolean(),
});

export const aiSettingsSchema = z.object({
  defaultTextProvider: z.string().min(1).max(40),
  defaultImageProvider: z.string().min(1).max(40),
  defaultVideoProvider: z.string().min(1).max(40),
  maxResponseLength: z.number().int().min(256).max(32000),
  conversationHistoryOn: z.boolean(),
  rateLimitPlaceholder: z.string().max(2000).nullable().optional(),
  enabledProviders: z.array(z.string()),
  models: z.record(z.string(), z.string()),
});

export const searchSettingsSchema = z.object({
  enabled: z.boolean(),
  suggestionsEnabled: z.boolean(),
  trendingEnabled: z.boolean(),
  resultLimit: z.number().int().min(5).max(50),
});

export const emailSettingsSchema = z.object({
  senderName: z.string().min(1).max(120),
  senderEmail: z.string().email(),
  smtpPlaceholder: z.string().max(2000).nullable().optional(),
  templatesNote: z.string().max(2000).nullable().optional(),
});

export const securitySettingsSchema = z.object({
  maxLoginAttempts: z.number().int().min(1).max(50),
  auditLoggingEnabled: z.boolean(),
  apiAccessPlaceholder: z.string().max(2000).nullable().optional(),
});

export const maintenanceSchema = z.object({
  enabled: z.boolean(),
  message: z.string().max(2000).nullable().optional(),
  allowedAdminEmails: z.string().max(2000).nullable().optional(),
  showBanner: z.boolean(),
});

export const featureFlagSchema = z.object({
  key: z.string().min(1),
  enabled: z.boolean(),
});
