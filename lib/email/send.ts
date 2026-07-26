/**
 * Shared outbound email — Resend first, then SMTP from EmailSetting.
 */

import "server-only";

import nodemailer from "nodemailer";
import { getEmailSettings } from "@/services/settings/platform";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
};

export type SendEmailResult = {
  ok: boolean;
  provider: "resend" | "smtp" | "none";
  id?: string;
  error?: string;
};

export async function isEmailConfigured(): Promise<boolean> {
  if (process.env.RESEND_API_KEY?.trim()) return true;
  const settings = await getEmailSettings();
  return Boolean(settings.smtpHost?.trim() && settings.smtpUser?.trim());
}

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const settings = await getEmailSettings();
  const from = `${settings.senderName} <${settings.senderEmail}>`;
  const to = Array.isArray(input.to) ? input.to : [input.to];
  if (!to.length) {
    return { ok: false, provider: "none", error: "No recipients" };
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          subject: input.subject,
          text: input.text,
          html: input.html ?? (input.text ? undefined : undefined),
          reply_to: input.replyTo,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        id?: string;
        message?: string;
        error?: { message?: string };
      };
      if (!res.ok) {
        return {
          ok: false,
          provider: "resend",
          error:
            json.error?.message ??
            json.message ??
            `Resend HTTP ${res.status}`,
        };
      }
      return { ok: true, provider: "resend", id: json.id };
    } catch (error) {
      return {
        ok: false,
        provider: "resend",
        error: error instanceof Error ? error.message : "Resend failed",
      };
    }
  }

  if (!settings.smtpHost?.trim() || !settings.smtpUser?.trim()) {
    return {
      ok: false,
      provider: "none",
      error:
        "Email not configured — set RESEND_API_KEY or SMTP host/user in Email settings",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort ?? 587,
      secure: settings.smtpSecure ?? false,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword ?? "",
      },
    });

    const info = await transporter.sendMail({
      from,
      to: to.join(", "),
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo,
    });

    return {
      ok: true,
      provider: "smtp",
      id: typeof info.messageId === "string" ? info.messageId : undefined,
    };
  } catch (error) {
    return {
      ok: false,
      provider: "smtp",
      error: error instanceof Error ? error.message : "SMTP send failed",
    };
  }
}
