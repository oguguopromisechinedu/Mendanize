import {
  getAiPlatformSettings,
  getAuthenticationSettings,
  getEmailSettings,
  getSearchPlatformSettings,
  getSecuritySettings,
} from "@/services/settings/platform"
import type { IntegrationCard } from "./types"

export async function listIntegrationsAdmin(): Promise<IntegrationCard[]> {
  const [ai, email, search, auth, security] = await Promise.all([
    getAiPlatformSettings(),
    getEmailSettings(),
    getSearchPlatformSettings(),
    getAuthenticationSettings(),
    getSecuritySettings(),
  ])

  const providers = ai.enabledProviders ?? []
  const hasProvider = (id: string) =>
    providers.some((p) => p.toLowerCase().includes(id))

  return [
    {
      id: "openai",
      name: "OpenAI",
      category: "AI",
      configured: hasProvider("openai") || ai.defaultTextProvider.includes("openai"),
      enabled: ai.defaultTextProvider.toLowerCase().includes("openai"),
      detail: `Text: ${ai.defaultTextProvider} · Image: ${ai.defaultImageProvider}`,
      settingsHref: "/dashboard/settings/ai",
    },
    {
      id: "anthropic",
      name: "Anthropic / Claude",
      category: "AI",
      configured:
        hasProvider("claude") ||
        hasProvider("anthropic") ||
        ai.defaultTextProvider.toLowerCase().includes("claude"),
      enabled: ai.defaultTextProvider.toLowerCase().includes("claude"),
      detail: `Default text provider: ${ai.defaultTextProvider}`,
      settingsHref: "/dashboard/settings/ai",
    },
    {
      id: "google-ai",
      name: "Google AI",
      category: "AI",
      configured:
        hasProvider("google") ||
        hasProvider("gemini") ||
        ai.defaultTextProvider.toLowerCase().includes("gemini"),
      enabled: ai.defaultTextProvider.toLowerCase().includes("gemini"),
      detail: `Image: ${ai.defaultImageProvider} · Video: ${ai.defaultVideoProvider}`,
      settingsHref: "/dashboard/settings/ai",
    },
    {
      id: "email",
      name: "Transactional email",
      category: "Communication",
      configured: Boolean(email.senderEmail),
      enabled: Boolean(email.senderEmail),
      detail: email.senderEmail
        ? `From ${email.senderName || "Mendanize"} <${email.senderEmail}>`
        : "Sender not set",
      settingsHref: "/dashboard/settings/email",
    },
    {
      id: "search",
      name: "Search index",
      category: "Discovery",
      configured: search.enabled,
      enabled: search.enabled,
      detail: search.enabled
        ? `Limit ${search.resultLimit}`
        : "Search disabled",
      settingsHref: "/dashboard/settings/search",
    },
    {
      id: "auth",
      name: "Authentication",
      category: "Security",
      configured: true,
      enabled: auth.registrationEnabled,
      detail: auth.registrationEnabled
        ? "Registration enabled"
        : "Registration closed",
      settingsHref: "/dashboard/settings/authentication",
    },
    {
      id: "security",
      name: "Security policies",
      category: "Security",
      configured: true,
      enabled: security.auditLoggingEnabled,
      detail: `Max login attempts ${security.maxLoginAttempts} · Audit ${security.auditLoggingEnabled ? "on" : "off"}`,
      settingsHref: "/dashboard/settings/security",
    },
    {
      id: "ai-stack",
      name: "AI stack health",
      category: "Overview",
      configured: providers.length > 0 || Boolean(ai.defaultTextProvider),
      enabled: providers.length > 0 || Boolean(ai.defaultTextProvider),
      detail: providers.length
        ? `Enabled: ${providers.join(", ")}`
        : `Using ${ai.defaultTextProvider}`,
      settingsHref: "/dashboard/settings/ai",
    },
  ]
}
