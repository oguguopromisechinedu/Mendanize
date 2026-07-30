/**
 * MES-042 — shared helpers for transactional email readiness + structured failure logs.
 */
import "server-only";

import { persistApplicationLog } from "@/services/admin/application-logs";
import { getEmailSettings } from "@/services/settings/platform";

/** Templates that must never be blocked by marketing/newsletter preferences. */
export const TRANSACTIONAL_EMAIL_TEMPLATES = new Set([
  "email_verification",
  "password_reset",
  "admin_password_reset",
  "welcome",
  "security_alerts",
  "account_updates",
  "generic_notification",
]);

/** Templates gated by PublicUser marketing prefs (MES-024 / MES-035). */
export const MARKETING_EMAIL_TEMPLATES = new Set([
  "newsletter",
  "platform_announcement",
  "learning_reminder",
  "product_updates",
]);

export function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

export async function emailProviderReady(): Promise<boolean> {
  if (process.env.RESEND_API_KEY?.trim()) return true;
  const settings = await getEmailSettings();
  return Boolean(settings.smtpHost?.trim() && settings.smtpUser?.trim());
}

export async function logEmailEvent(input: {
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  template?: string;
  email?: string;
  extra?: Record<string, unknown>;
}) {
  await persistApplicationLog({
    level: input.level,
    message: input.message,
    module: "email",
    context: {
      template: input.template,
      email: input.email,
      ...input.extra,
    },
  });
}

/**
 * In production, auth-critical flows must not pretend mail was sent when no provider exists.
 */
export async function requireEmailConfiguredInProduction(context: string) {
  if (!isProductionRuntime()) return;
  const ok = await emailProviderReady();
  if (!ok) {
    await logEmailEvent({
      level: "ERROR",
      message: `Email not configured for production action: ${context}`,
      extra: { context },
    });
    throw new Error(
      "Email delivery is not configured. Set RESEND_API_KEY or SMTP in Email settings.",
    );
  }
}
