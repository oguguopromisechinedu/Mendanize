/**
 * Platform Settings Shared Service — MES-020.
 * Canonical owner of AI config, branding overrides, feature flags, etc.
 */

import "server-only";

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import {
  SEEDED_DESIGN_TOKENS,
  type DesignTokens,
} from "./design-tokens";
import type { AiConfig, PlatformSettings } from "./types";
import type {
  AIPlatformSettingRecord,
  AuthenticationSettingRecord,
  BrandingSettingRecord,
  EmailSettingRecord,
  FeatureFlagRecord,
  LocalizationSettingRecord,
  MaintenanceConfigurationRecord,
  PlatformSettingRecord,
  SearchPlatformSettingRecord,
  SecuritySettingRecord,
  SettingsDashboardOverview,
} from "./platform-types";

const KEY = "main";
const VERSION = "1.0.0";

const DEFAULT_FLAGS: Array<Omit<FeatureFlagRecord, "id">> = [
  { key: "articles", label: "Articles", description: "Article CMS & public articles", enabled: true, sortOrder: 0 },
  { key: "guides", label: "Learning Guides", description: "Guides module", enabled: true, sortOrder: 1 },
  { key: "ai_tools", label: "AI Tools", description: "AI tools directory", enabled: true, sortOrder: 2 },
  { key: "ask_mendanize", label: "Ask Mendanize AI", description: "Tier 1 + Tier 2 Ask", enabled: true, sortOrder: 3 },
  { key: "search", label: "Search", description: "Search & discovery", enabled: true, sortOrder: 4 },
  { key: "analytics", label: "Analytics", description: "Analytics (MES-023)", enabled: true, sortOrder: 5 },
  { key: "notifications", label: "Notifications", description: "Notifications (MES-024)", enabled: true, sortOrder: 6 },
];

function db() {
  return getPrisma();
}

function parseJsonArray(raw: string | null | undefined, fallback: string[]): string[] {
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : fallback;
  } catch {
    return fallback;
  }
}

function parseJsonObject(
  raw: string | null | undefined,
  fallback: Record<string, string>,
): Record<string, string> {
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, string>)
      : fallback;
  } catch {
    return fallback;
  }
}

export async function ensurePlatformSettingsSeeded(): Promise<void> {
  if (!isDatabaseConfigured()) return;

  await db().$transaction(async (tx) => {
    const general = await tx.platformSetting.findUnique({ where: { key: KEY } });
    if (!general) {
      await tx.platformSetting.create({
        data: {
          key: KEY,
          description: "Learn modern technology with clarity.",
        },
      });
    }
    if (!(await tx.brandingSetting.findUnique({ where: { key: KEY } }))) {
      await tx.brandingSetting.create({ data: { key: KEY } });
    }
    if (!(await tx.localizationSetting.findUnique({ where: { key: KEY } }))) {
      await tx.localizationSetting.create({ data: { key: KEY } });
    }
    if (!(await tx.authenticationSetting.findUnique({ where: { key: KEY } }))) {
      await tx.authenticationSetting.create({
        data: {
          key: KEY,
          passwordPolicyNote:
            "Minimum 8 characters; complexity rules land with auth hardening.",
        },
      });
    }
    if (!(await tx.aiPlatformSetting.findUnique({ where: { key: KEY } }))) {
      await tx.aiPlatformSetting.create({
        data: {
          key: KEY,
          enabledProvidersJson: JSON.stringify(["claude", "openai"]),
          modelsJson: JSON.stringify({
            writing: "claude-sonnet",
            image: "gpt-image",
            ask: "claude-sonnet",
          }),
          defaultTextProvider: "claude",
          defaultImageProvider: "openai",
          rateLimitPlaceholder:
            "Rate limits enforced when Billing (MES-021) gates usage.",
        },
      });
    }
    if (!(await tx.searchPlatformSetting.findUnique({ where: { key: KEY } }))) {
      await tx.searchPlatformSetting.create({ data: { key: KEY } });
    }
    if (!(await tx.emailSetting.findUnique({ where: { key: KEY } }))) {
      await tx.emailSetting.create({
        data: {
          key: KEY,
          templatesNote: "Transactional templates via notification service.",
        },
      });
    }
    if (!(await tx.securitySetting.findUnique({ where: { key: KEY } }))) {
      await tx.securitySetting.create({
        data: {
          key: KEY,
          apiAccessPlaceholder: "API key management placeholder.",
        },
      });
    }
    if (!(await tx.maintenanceConfiguration.findUnique({ where: { key: KEY } }))) {
      await tx.maintenanceConfiguration.create({
        data: {
          key: KEY,
          message: "Mendanize is undergoing scheduled maintenance.",
        },
      });
    }
    const flagCount = await tx.featureFlag.count();
    if (flagCount === 0) {
      await tx.featureFlag.createMany({
        data: DEFAULT_FLAGS.map((f) => ({
          key: f.key,
          label: f.label,
          description: f.description,
          enabled: f.enabled,
          sortOrder: f.sortOrder,
          updatedAt: new Date(),
        })),
      });
    }
  });
}

function mapGeneral(row: {
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
  updatedAt: Date;
}): PlatformSettingRecord {
  return {
    id: row.id,
    platformName: row.platformName,
    description: row.description,
    websiteUrl: row.websiteUrl,
    contactEmail: row.contactEmail,
    supportEmail: row.supportEmail,
    timeZone: row.timeZone,
    dateFormat: row.dateFormat,
    language: row.language,
    defaultHomepage: row.defaultHomepage,
    defaultUserRole: row.defaultUserRole,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapAi(row: {
  id: string;
  defaultTextProvider: string;
  defaultImageProvider: string;
  defaultVideoProvider: string;
  maxResponseLength: number;
  conversationHistoryOn: boolean;
  rateLimitPlaceholder: string | null;
  enabledProvidersJson: string | null;
  modelsJson: string | null;
  updatedAt: Date;
}): AIPlatformSettingRecord {
  const enabled = parseJsonArray(row.enabledProvidersJson, ["claude", "openai"])
    .map((p) => p.toLowerCase())
    .filter((p) => p !== "dalle" && p !== "gemini" && p !== "grok")
    .map((p) => (p === "anthropic" ? "claude" : p));
  return {
    id: row.id,
    defaultTextProvider: "claude",
    defaultImageProvider: "openai",
    defaultVideoProvider: row.defaultVideoProvider,
    maxResponseLength: row.maxResponseLength,
    conversationHistoryOn: row.conversationHistoryOn,
    rateLimitPlaceholder: row.rateLimitPlaceholder,
    enabledProviders: [...new Set(["claude", "openai", ...enabled])],
    models: parseJsonObject(row.modelsJson, {
      writing: "claude-sonnet",
      image: "gpt-image",
    }),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getGeneralSettings(): Promise<PlatformSettingRecord> {
  await ensurePlatformSettingsSeeded();
  if (!isDatabaseConfigured()) {
    return {
      id: "local",
      platformName: "Mendanize",
      description: "Learn modern technology with clarity.",
      websiteUrl: "https://mendanize.com",
      contactEmail: "hello@mendanize.com",
      supportEmail: "support@mendanize.com",
      timeZone: "UTC",
      dateFormat: "YYYY-MM-DD",
      language: "en",
      defaultHomepage: "/",
      defaultUserRole: "LEARNER",
      updatedAt: new Date().toISOString(),
    };
  }
  return mapGeneral(
    await db().platformSetting.findUniqueOrThrow({ where: { key: KEY } }),
  );
}

export async function updateGeneralSettings(
  input: Partial<Omit<PlatformSettingRecord, "id" | "updatedAt">>,
): Promise<PlatformSettingRecord> {
  await ensurePlatformSettingsSeeded();
  const row = await db().platformSetting.update({
    where: { key: KEY },
    data: {
      ...(input.platformName !== undefined
        ? { platformName: input.platformName.trim() }
        : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.websiteUrl !== undefined
        ? { websiteUrl: input.websiteUrl.trim() }
        : {}),
      ...(input.contactEmail !== undefined
        ? { contactEmail: input.contactEmail.trim() }
        : {}),
      ...(input.supportEmail !== undefined
        ? { supportEmail: input.supportEmail.trim() }
        : {}),
      ...(input.timeZone !== undefined ? { timeZone: input.timeZone.trim() } : {}),
      ...(input.dateFormat !== undefined
        ? { dateFormat: input.dateFormat.trim() }
        : {}),
      ...(input.language !== undefined ? { language: input.language.trim() } : {}),
      ...(input.defaultHomepage !== undefined
        ? { defaultHomepage: input.defaultHomepage.trim() }
        : {}),
      ...(input.defaultUserRole !== undefined
        ? { defaultUserRole: input.defaultUserRole.trim() }
        : {}),
    },
  });
  return mapGeneral(row);
}

export async function getBrandingSettings(): Promise<BrandingSettingRecord> {
  await ensurePlatformSettingsSeeded();
  if (!isDatabaseConfigured()) {
    return {
      id: "local",
      brandName: "Mendanize",
      logoUrl: null,
      faviconUrl: null,
      primaryColor: "#8B5CF6",
      secondaryColor: "#1E1F3A",
      accentColor: "#6366F1",
      tokenOverridesJson: null,
      updatedAt: new Date().toISOString(),
    };
  }
  const row = await db().brandingSetting.findUniqueOrThrow({ where: { key: KEY } });
  return {
    id: row.id,
    brandName: row.brandName,
    logoUrl: row.logoUrl,
    faviconUrl: row.faviconUrl,
    primaryColor: row.primaryColor,
    secondaryColor: row.secondaryColor,
    accentColor: row.accentColor,
    tokenOverridesJson: row.tokenOverridesJson,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateBrandingSettings(
  input: Partial<Omit<BrandingSettingRecord, "id" | "updatedAt">>,
): Promise<BrandingSettingRecord> {
  await ensurePlatformSettingsSeeded();
  const row = await db().brandingSetting.update({
    where: { key: KEY },
    data: {
      ...(input.brandName !== undefined ? { brandName: input.brandName.trim() } : {}),
      ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl?.trim() || null } : {}),
      ...(input.faviconUrl !== undefined
        ? { faviconUrl: input.faviconUrl?.trim() || null }
        : {}),
      ...(input.primaryColor !== undefined
        ? { primaryColor: input.primaryColor.trim() }
        : {}),
      ...(input.secondaryColor !== undefined
        ? { secondaryColor: input.secondaryColor.trim() }
        : {}),
      ...(input.accentColor !== undefined
        ? { accentColor: input.accentColor.trim() }
        : {}),
      ...(input.tokenOverridesJson !== undefined
        ? { tokenOverridesJson: input.tokenOverridesJson?.trim() || null }
        : {}),
    },
  });
  return getBrandingSettings().then(() => ({
    id: row.id,
    brandName: row.brandName,
    logoUrl: row.logoUrl,
    faviconUrl: row.faviconUrl,
    primaryColor: row.primaryColor,
    secondaryColor: row.secondaryColor,
    accentColor: row.accentColor,
    tokenOverridesJson: row.tokenOverridesJson,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getLocalizationSettings(): Promise<LocalizationSettingRecord> {
  await ensurePlatformSettingsSeeded();
  if (!isDatabaseConfigured()) {
    return {
      id: "local",
      defaultLanguage: "en",
      availableLanguages: "en",
      timeZone: "UTC",
      dateFormat: "YYYY-MM-DD",
      numberFormat: "en-US",
      currencyCode: "USD",
      updatedAt: new Date().toISOString(),
    };
  }
  const row = await db().localizationSetting.findUniqueOrThrow({
    where: { key: KEY },
  });
  return {
    id: row.id,
    defaultLanguage: row.defaultLanguage,
    availableLanguages: row.availableLanguages,
    timeZone: row.timeZone,
    dateFormat: row.dateFormat,
    numberFormat: row.numberFormat,
    currencyCode: row.currencyCode,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateLocalizationSettings(
  input: Partial<Omit<LocalizationSettingRecord, "id" | "updatedAt">>,
): Promise<LocalizationSettingRecord> {
  await ensurePlatformSettingsSeeded();
  const row = await db().localizationSetting.update({
    where: { key: KEY },
    data: {
      ...(input.defaultLanguage !== undefined
        ? { defaultLanguage: input.defaultLanguage.trim() }
        : {}),
      ...(input.availableLanguages !== undefined
        ? { availableLanguages: input.availableLanguages.trim() }
        : {}),
      ...(input.timeZone !== undefined ? { timeZone: input.timeZone.trim() } : {}),
      ...(input.dateFormat !== undefined
        ? { dateFormat: input.dateFormat.trim() }
        : {}),
      ...(input.numberFormat !== undefined
        ? { numberFormat: input.numberFormat.trim() }
        : {}),
      ...(input.currencyCode !== undefined
        ? { currencyCode: input.currencyCode.trim() }
        : {}),
    },
  });
  return {
    id: row.id,
    defaultLanguage: row.defaultLanguage,
    availableLanguages: row.availableLanguages,
    timeZone: row.timeZone,
    dateFormat: row.dateFormat,
    numberFormat: row.numberFormat,
    currencyCode: row.currencyCode,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getAuthenticationSettings(): Promise<AuthenticationSettingRecord> {
  await ensurePlatformSettingsSeeded();
  if (!isDatabaseConfigured()) {
    return {
      id: "local",
      registrationEnabled: true,
      emailVerification: true,
      passwordPolicyNote: null,
      sessionTimeoutMinutes: 10080,
      rememberMeEnabled: true,
      twoFactorRequired: false,
      twoFactorPlaceholder: false,
      updatedAt: new Date().toISOString(),
    };
  }
  const row = await db().authenticationSetting.findUniqueOrThrow({
    where: { key: KEY },
  });
  return {
    id: row.id,
    registrationEnabled: row.registrationEnabled,
    emailVerification: row.emailVerification,
    passwordPolicyNote: row.passwordPolicyNote,
    sessionTimeoutMinutes: row.sessionTimeoutMinutes,
    rememberMeEnabled: row.rememberMeEnabled,
    twoFactorRequired: row.twoFactorRequired,
    twoFactorPlaceholder: row.twoFactorPlaceholder,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateAuthenticationSettings(
  input: Partial<Omit<AuthenticationSettingRecord, "id" | "updatedAt">>,
): Promise<AuthenticationSettingRecord> {
  await ensurePlatformSettingsSeeded();
  const row = await db().authenticationSetting.update({
    where: { key: KEY },
    data: {
      ...(input.registrationEnabled !== undefined
        ? { registrationEnabled: input.registrationEnabled }
        : {}),
      ...(input.emailVerification !== undefined
        ? { emailVerification: input.emailVerification }
        : {}),
      ...(input.passwordPolicyNote !== undefined
        ? { passwordPolicyNote: input.passwordPolicyNote?.trim() || null }
        : {}),
      ...(input.sessionTimeoutMinutes !== undefined
        ? { sessionTimeoutMinutes: input.sessionTimeoutMinutes }
        : {}),
      ...(input.rememberMeEnabled !== undefined
        ? { rememberMeEnabled: input.rememberMeEnabled }
        : {}),
      ...(input.twoFactorRequired !== undefined
        ? { twoFactorRequired: input.twoFactorRequired }
        : {}),
      ...(input.twoFactorPlaceholder !== undefined
        ? { twoFactorPlaceholder: input.twoFactorPlaceholder }
        : {}),
    },
  });
  return {
    id: row.id,
    registrationEnabled: row.registrationEnabled,
    emailVerification: row.emailVerification,
    passwordPolicyNote: row.passwordPolicyNote,
    sessionTimeoutMinutes: row.sessionTimeoutMinutes,
    rememberMeEnabled: row.rememberMeEnabled,
    twoFactorRequired: row.twoFactorRequired,
    twoFactorPlaceholder: row.twoFactorPlaceholder,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getAiPlatformSettings(): Promise<AIPlatformSettingRecord> {
  await ensurePlatformSettingsSeeded();
  if (!isDatabaseConfigured()) {
    return {
      id: "local",
      defaultTextProvider: "claude",
      defaultImageProvider: "openai",
      defaultVideoProvider: "video_tbd",
      maxResponseLength: 4000,
      conversationHistoryOn: true,
      rateLimitPlaceholder: null,
      enabledProviders: ["claude", "openai"],
      models: { writing: "claude-sonnet", image: "gpt-image" },
      updatedAt: new Date().toISOString(),
    };
  }
  return mapAi(
    await db().aiPlatformSetting.findUniqueOrThrow({ where: { key: KEY } }),
  );
}

export async function updateAiPlatformSettings(input: {
  defaultTextProvider?: string;
  defaultImageProvider?: string;
  defaultVideoProvider?: string;
  maxResponseLength?: number;
  conversationHistoryOn?: boolean;
  rateLimitPlaceholder?: string | null;
  enabledProviders?: string[];
  models?: Record<string, string>;
}): Promise<AIPlatformSettingRecord> {
  await ensurePlatformSettingsSeeded();
  // Ownership lock: Anthropic = articles; OpenAI = images.
  const textProvider =
    input.defaultTextProvider !== undefined ? "claude" : undefined;
  const imageProvider =
    input.defaultImageProvider !== undefined ? "openai" : undefined;
  const enabledProviders =
    input.enabledProviders !== undefined
      ? [
          ...new Set([
            "claude",
            "openai",
            ...input.enabledProviders
              .map((p) => p.trim().toLowerCase())
              .filter((p) => ["claude", "openai"].includes(p)),
          ]),
        ]
      : undefined;
  const row = await db().aiPlatformSetting.update({
    where: { key: KEY },
    data: {
      ...(textProvider !== undefined
        ? { defaultTextProvider: textProvider }
        : {}),
      ...(imageProvider !== undefined
        ? { defaultImageProvider: imageProvider }
        : {}),
      ...(input.defaultVideoProvider !== undefined
        ? { defaultVideoProvider: input.defaultVideoProvider.trim() }
        : {}),
      ...(input.maxResponseLength !== undefined
        ? { maxResponseLength: input.maxResponseLength }
        : {}),
      ...(input.conversationHistoryOn !== undefined
        ? { conversationHistoryOn: input.conversationHistoryOn }
        : {}),
      ...(input.rateLimitPlaceholder !== undefined
        ? { rateLimitPlaceholder: input.rateLimitPlaceholder?.trim() || null }
        : {}),
      ...(enabledProviders !== undefined
        ? { enabledProvidersJson: JSON.stringify(enabledProviders) }
        : {}),
      ...(input.models !== undefined
        ? { modelsJson: JSON.stringify(input.models) }
        : {}),
    },
  });
  return mapAi(row);
}

export async function getSearchPlatformSettings(): Promise<SearchPlatformSettingRecord> {
  await ensurePlatformSettingsSeeded();
  if (!isDatabaseConfigured()) {
    return {
      id: "local",
      enabled: true,
      suggestionsEnabled: true,
      trendingEnabled: true,
      resultLimit: 12,
      updatedAt: new Date().toISOString(),
    };
  }
  const row = await db().searchPlatformSetting.findUniqueOrThrow({
    where: { key: KEY },
  });
  return {
    id: row.id,
    enabled: row.enabled,
    suggestionsEnabled: row.suggestionsEnabled,
    trendingEnabled: row.trendingEnabled,
    resultLimit: row.resultLimit,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateSearchPlatformSettings(
  input: Partial<Omit<SearchPlatformSettingRecord, "id" | "updatedAt">>,
): Promise<SearchPlatformSettingRecord> {
  await ensurePlatformSettingsSeeded();
  const row = await db().searchPlatformSetting.update({
    where: { key: KEY },
    data: {
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.suggestionsEnabled !== undefined
        ? { suggestionsEnabled: input.suggestionsEnabled }
        : {}),
      ...(input.trendingEnabled !== undefined
        ? { trendingEnabled: input.trendingEnabled }
        : {}),
      ...(input.resultLimit !== undefined ? { resultLimit: input.resultLimit } : {}),
    },
  });

  // Keep MES-017 SearchConfiguration in sync for overlapping fields.
  try {
    const { updateSearchConfiguration } = await import("@/services/search");
    await updateSearchConfiguration({
      enabled: row.enabled,
      resultsPerPage: row.resultLimit,
    });
  } catch {
    // Search service may be unavailable offline
  }

  return {
    id: row.id,
    enabled: row.enabled,
    suggestionsEnabled: row.suggestionsEnabled,
    trendingEnabled: row.trendingEnabled,
    resultLimit: row.resultLimit,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getEmailSettings(): Promise<EmailSettingRecord> {
  await ensurePlatformSettingsSeeded();
  if (!isDatabaseConfigured()) {
    return {
      id: "local",
      senderName: "Mendanize",
      senderEmail: "noreply@mendanize.com",
      smtpHost: null,
      smtpPort: 587,
      smtpUser: null,
      smtpPassword: null,
      smtpSecure: false,
      smtpPlaceholder: null,
      templatesNote: null,
      updatedAt: new Date().toISOString(),
    };
  }
  const row = await db().emailSetting.findUniqueOrThrow({ where: { key: KEY } });
  return {
    id: row.id,
    senderName: row.senderName,
    senderEmail: row.senderEmail,
    smtpHost: row.smtpHost,
    smtpPort: row.smtpPort,
    smtpUser: row.smtpUser,
    smtpPassword: row.smtpPassword,
    smtpSecure: row.smtpSecure,
    smtpPlaceholder: row.smtpPlaceholder,
    templatesNote: row.templatesNote,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateEmailSettings(
  input: Partial<Omit<EmailSettingRecord, "id" | "updatedAt">>,
): Promise<EmailSettingRecord> {
  await ensurePlatformSettingsSeeded();
  const row = await db().emailSetting.update({
    where: { key: KEY },
    data: {
      ...(input.senderName !== undefined
        ? { senderName: input.senderName.trim() }
        : {}),
      ...(input.senderEmail !== undefined
        ? { senderEmail: input.senderEmail.trim() }
        : {}),
      ...(input.smtpHost !== undefined
        ? { smtpHost: input.smtpHost?.trim() || null }
        : {}),
      ...(input.smtpPort !== undefined ? { smtpPort: input.smtpPort } : {}),
      ...(input.smtpUser !== undefined
        ? { smtpUser: input.smtpUser?.trim() || null }
        : {}),
      ...(input.smtpPassword !== undefined
        ? { smtpPassword: input.smtpPassword || null }
        : {}),
      ...(input.smtpSecure !== undefined ? { smtpSecure: input.smtpSecure } : {}),
      ...(input.smtpPlaceholder !== undefined
        ? { smtpPlaceholder: input.smtpPlaceholder?.trim() || null }
        : {}),
      ...(input.templatesNote !== undefined
        ? { templatesNote: input.templatesNote?.trim() || null }
        : {}),
    },
  });
  return {
    id: row.id,
    senderName: row.senderName,
    senderEmail: row.senderEmail,
    smtpHost: row.smtpHost,
    smtpPort: row.smtpPort,
    smtpUser: row.smtpUser,
    smtpPassword: row.smtpPassword,
    smtpSecure: row.smtpSecure,
    smtpPlaceholder: row.smtpPlaceholder,
    templatesNote: row.templatesNote,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getSecuritySettings(): Promise<SecuritySettingRecord> {
  await ensurePlatformSettingsSeeded();
  if (!isDatabaseConfigured()) {
    return {
      id: "local",
      maxLoginAttempts: 5,
      auditLoggingEnabled: true,
      apiAccessPlaceholder: null,
      updatedAt: new Date().toISOString(),
    };
  }
  const row = await db().securitySetting.findUniqueOrThrow({ where: { key: KEY } });
  return {
    id: row.id,
    maxLoginAttempts: row.maxLoginAttempts,
    auditLoggingEnabled: row.auditLoggingEnabled,
    apiAccessPlaceholder: row.apiAccessPlaceholder,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateSecuritySettings(
  input: Partial<Omit<SecuritySettingRecord, "id" | "updatedAt">>,
): Promise<SecuritySettingRecord> {
  await ensurePlatformSettingsSeeded();
  const row = await db().securitySetting.update({
    where: { key: KEY },
    data: {
      ...(input.maxLoginAttempts !== undefined
        ? { maxLoginAttempts: input.maxLoginAttempts }
        : {}),
      ...(input.auditLoggingEnabled !== undefined
        ? { auditLoggingEnabled: input.auditLoggingEnabled }
        : {}),
      ...(input.apiAccessPlaceholder !== undefined
        ? { apiAccessPlaceholder: input.apiAccessPlaceholder?.trim() || null }
        : {}),
    },
  });
  return {
    id: row.id,
    maxLoginAttempts: row.maxLoginAttempts,
    auditLoggingEnabled: row.auditLoggingEnabled,
    apiAccessPlaceholder: row.apiAccessPlaceholder,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listFeatureFlags(): Promise<FeatureFlagRecord[]> {
  await ensurePlatformSettingsSeeded();
  if (!isDatabaseConfigured()) {
    return DEFAULT_FLAGS.map((f, i) => ({ ...f, id: `flag-${i}` }));
  }
  const rows = await db().featureFlag.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    key: r.key,
    label: r.label,
    description: r.description,
    enabled: r.enabled,
    sortOrder: r.sortOrder,
  }));
}

/** Admin FeatureFlag gate — PublicUser surfaces must call this, never hardcode availability. */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  const flags = await listFeatureFlags();
  const match = flags.find((f) => f.key === key);
  return match?.enabled ?? false;
}

export async function getFeatureFlagMap(): Promise<Record<string, boolean>> {
  const flags = await listFeatureFlags();
  return Object.fromEntries(flags.map((f) => [f.key, f.enabled]));
}

export async function setFeatureFlagEnabled(
  key: string,
  enabled: boolean,
): Promise<FeatureFlagRecord> {
  await ensurePlatformSettingsSeeded();
  const row = await db().featureFlag.update({
    where: { key },
    data: { enabled },
  });
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    description: row.description,
    enabled: row.enabled,
    sortOrder: row.sortOrder,
  };
}

export async function getMaintenanceConfiguration(): Promise<MaintenanceConfigurationRecord> {
  await ensurePlatformSettingsSeeded();
  if (!isDatabaseConfigured()) {
    return {
      id: "local",
      enabled: false,
      message: null,
      allowedAdminEmails: null,
      showBanner: true,
      updatedAt: new Date().toISOString(),
    };
  }
  const row = await db().maintenanceConfiguration.findUniqueOrThrow({
    where: { key: KEY },
  });
  return {
    id: row.id,
    enabled: row.enabled,
    message: row.message,
    allowedAdminEmails: row.allowedAdminEmails,
    showBanner: row.showBanner,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateMaintenanceConfiguration(
  input: Partial<Omit<MaintenanceConfigurationRecord, "id" | "updatedAt">>,
): Promise<MaintenanceConfigurationRecord> {
  await ensurePlatformSettingsSeeded();
  const row = await db().maintenanceConfiguration.update({
    where: { key: KEY },
    data: {
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.message !== undefined
        ? { message: input.message?.trim() || null }
        : {}),
      ...(input.allowedAdminEmails !== undefined
        ? { allowedAdminEmails: input.allowedAdminEmails?.trim() || null }
        : {}),
      ...(input.showBanner !== undefined ? { showBanner: input.showBanner } : {}),
    },
  });
  return {
    id: row.id,
    enabled: row.enabled,
    message: row.message,
    allowedAdminEmails: row.allowedAdminEmails,
    showBanner: row.showBanner,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getSettingsDashboard(): Promise<SettingsDashboardOverview> {
  const [general, maintenance, ai, search, email, auth, flags] =
    await Promise.all([
      getGeneralSettings(),
      getMaintenanceConfiguration(),
      getAiPlatformSettings(),
      getSearchPlatformSettings(),
      getEmailSettings(),
      getAuthenticationSettings(),
      listFeatureFlags(),
    ]);

  const stamps = [
    general.updatedAt,
    maintenance.updatedAt,
    ai.updatedAt,
    search.updatedAt,
    email.updatedAt,
    auth.updatedAt,
  ].sort();

  return {
    general,
    maintenance,
    ai,
    search,
    email,
    auth,
    flags,
    activeFeatureCount: flags.filter((f) => f.enabled).length,
    version: VERSION,
    lastUpdated: stamps[stamps.length - 1] ?? new Date().toISOString(),
  };
}

/** MES-002 AiConfig seam — backed by aiPlatformSetting. */
export async function loadAiConfig(): Promise<AiConfig> {
  const ai = await getAiPlatformSettings();
  return {
    defaultTextProvider: ai.defaultTextProvider,
    defaultImageProvider: ai.defaultImageProvider,
    models: ai.models,
    enabledProviders: ai.enabledProviders,
  };
}

export async function saveAiConfig(patch: Partial<AiConfig>): Promise<AiConfig> {
  const current = await getAiPlatformSettings();
  await updateAiPlatformSettings({
    defaultTextProvider: patch.defaultTextProvider ?? current.defaultTextProvider,
    defaultImageProvider: patch.defaultImageProvider ?? current.defaultImageProvider,
    enabledProviders: patch.enabledProviders ?? current.enabledProviders,
    models: patch.models ?? current.models,
  });
  return loadAiConfig();
}

export async function loadPlatformSettingsSummary(): Promise<PlatformSettings> {
  const [general, flags, branding] = await Promise.all([
    getGeneralSettings(),
    listFeatureFlags(),
    getBrandingSettings(),
  ]);
  return {
    siteName: general.platformName,
    tagline: general.description ?? undefined,
    featureFlags: Object.fromEntries(flags.map((f) => [f.key, f.enabled])),
    designTokens: {
      primary: branding.primaryColor,
      secondary: branding.secondaryColor,
      accent: branding.accentColor,
    },
  };
}

/** Merge branding into seeded design tokens. */
export async function loadDesignTokensWithOverrides(): Promise<DesignTokens> {
  const tokens = structuredClone(SEEDED_DESIGN_TOKENS);
  try {
    const branding = await getBrandingSettings();
    if (branding.tokenOverridesJson) {
      const overrides = JSON.parse(branding.tokenOverridesJson) as Partial<DesignTokens>;
      if (overrides.colors) tokens.colors = { ...tokens.colors, ...overrides.colors };
      if (overrides.colorsLight) tokens.colorsLight = { ...tokens.colorsLight, ...overrides.colorsLight };
      // Only apply explicit token overrides JSON. Primary/accent/secondary are taken from SEEDED_DESIGN_TOKENS
      // to keep the homepage palette consistent.
    }
  } catch {
    // seed fallback
  }
  return tokens;
}

export { VERSION as PLATFORM_VERSION };
