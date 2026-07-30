/**
 * Shared outbound email — Resend first, then SMTP from EmailSetting.
 * MES-042: single transport for Notification Service + auth flows.
 */

import "server-only";

import nodemailer from "nodemailer";
import { getEmailSettings } from "@/services/settings/platform";
import { logEmailEvent } from "@/lib/email/mes042";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  /** EMS verified sender override (MES-051); defaults to EmailSetting. */
  from?: { name: string; email: string };
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
  const fromName = input.from?.name?.trim() || settings.senderName;
  const fromEmail = input.from?.email?.trim() || settings.senderEmail;
  const from = `${fromName} <${fromEmail}>`;
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
        const error =
          json.error?.message ?? json.message ?? `Resend HTTP ${res.status}`;
        await logEmailEvent({
          level: "ERROR",
          message: `Resend send failed: ${error}`,
          email: to[0],
          extra: { subject: input.subject, status: res.status },
        });
        return { ok: false, provider: "resend", error };
      }
      return { ok: true, provider: "resend", id: json.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Resend failed";
      await logEmailEvent({
        level: "ERROR",
        message: `Resend exception: ${message}`,
        email: to[0],
        extra: { subject: input.subject },
      });
      return { ok: false, provider: "resend", error: message };
    }
  }

  if (!settings.smtpHost?.trim() || !settings.smtpUser?.trim()) {
    const error =
      "Email not configured — set RESEND_API_KEY or SMTP host/user in Email settings";
    await logEmailEvent({
      level: process.env.NODE_ENV === "production" ? "ERROR" : "WARN",
      message: error,
      email: to[0],
      extra: { subject: input.subject },
    });
    return { ok: false, provider: "none", error };
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
    const message = error instanceof Error ? error.message : "SMTP send failed";
    await logEmailEvent({
      level: "ERROR",
      message: `SMTP send failed: ${message}`,
      email: to[0],
      extra: { subject: input.subject },
    });
    return { ok: false, provider: "smtp", error: message };
  }
}
