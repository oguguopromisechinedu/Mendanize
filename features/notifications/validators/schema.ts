import { z } from "zod";

export const markSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["read", "unread", "archive", "delete"]),
});

export const preferencesSchema = z.object({
  learningUpdates: z.boolean().optional(),
  aiUpdates: z.boolean().optional(),
  securityAlerts: z.boolean().optional(),
  newsletter: z.boolean().optional(),
  productUpdates: z.boolean().optional(),
  announcements: z.boolean().optional(),
});

export const deliverySchema = z.object({
  inAppEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  browserPushEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  smtpNote: z.string().nullable().optional(),
});

export const announcementSchema = z.object({
  id: z.string().optional(),
  kind: z.enum(["PLATFORM", "MAINTENANCE", "FEATURE", "LEARNING"]),
  title: z.string().min(1).max(160),
  body: z.string().min(1).max(5000),
  active: z.boolean().optional(),
  link: z.string().nullable().optional(),
});
