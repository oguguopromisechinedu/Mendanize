/**
 * Notification Shared Service — MES-002 / MES-024.
 * Canonical dispatch for in-app + email (email delivery is logged, not SMTP-sent).
 */

import "server-only";

import {
  AnnouncementKind,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from "@prisma/client";

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { AuthorizationError, ValidationError } from "@/lib/api/errors";
import type {
  AnnouncementRecord,
  CommunicationLogRecord,
  DeliverySettingRecord,
  DispatchNotificationParams,
  EmailTemplateRecord,
  InAppNotification,
  NotificationListParams,
  NotificationListResult,
  NotificationPreferenceRecord,
  NotificationRecord,
  NotificationsDashboard,
  NotificationTemplateRecord,
  NotificationTypeValue,
} from "./types";

export type * from "./types";

const KEY = "main";

const TYPE_META: Array<{
  type: NotificationTypeValue;
  label: string;
  color: string;
}> = [
  { type: "INFO", label: "Information", color: "#64748b" },
  { type: "SUCCESS", label: "Success", color: "#16a34a" },
  { type: "WARNING", label: "Warning", color: "#d97706" },
  { type: "ERROR", label: "Error", color: "#dc2626" },
  { type: "SECURITY", label: "Security", color: "#7c3aed" },
  { type: "SYSTEM", label: "System", color: "#475569" },
  { type: "LEARNING", label: "Learning", color: "#0d9488" },
  { type: "AI", label: "AI", color: "#E8940C" },
  { type: "ANNOUNCEMENT", label: "Announcement", color: "#2563eb" },
  { type: "BILLING", label: "Billing", color: "#db2777" },
];

const DEFAULT_NOTIF_TEMPLATES: Array<Omit<NotificationTemplateRecord, "id">> = [
  {
    key: "system.info",
    name: "System information",
    type: "SYSTEM",
    titleTpl: "{{title}}",
    bodyTpl: "{{body}}",
    priority: "NORMAL",
    active: true,
  },
  {
    key: "learning.update",
    name: "Learning update",
    type: "LEARNING",
    titleTpl: "Learning update",
    bodyTpl: "{{body}}",
    priority: "NORMAL",
    active: true,
  },
  {
    key: "ai.update",
    name: "AI update",
    type: "AI",
    titleTpl: "AI update",
    bodyTpl: "{{body}}",
    priority: "NORMAL",
    active: true,
  },
  {
    key: "security.alert",
    name: "Security alert",
    type: "SECURITY",
    titleTpl: "Security alert",
    bodyTpl: "{{body}}",
    priority: "HIGH",
    active: true,
  },
  {
    key: "announcement",
    name: "Announcement",
    type: "ANNOUNCEMENT",
    titleTpl: "{{title}}",
    bodyTpl: "{{body}}",
    priority: "NORMAL",
    active: true,
  },
];

const DEFAULT_EMAIL_TEMPLATES: Array<Omit<EmailTemplateRecord, "id">> = [
  {
    key: "welcome",
    name: "Welcome",
    subject: "Welcome to Mendanize",
    bodyHtml: "<p>Hi {{name}}, welcome to Mendanize.</p>",
    bodyText: "Hi {{name}}, welcome to Mendanize.",
    description: "Triggered by MES-006 sign-up via Notification Service.",
    active: true,
  },
  {
    key: "password_reset",
    name: "Password reset",
    subject: "Reset your Mendanize password",
    bodyHtml: "<p>Reset link: {{resetUrl}}</p>",
    bodyText: "Reset link: {{resetUrl}}",
    description: "Triggered by MES-006 forgot-password flow.",
    active: true,
  },
  {
    key: "email_verification",
    name: "Email verification",
    subject: "Verify your email",
    bodyHtml: "<p>Verify: {{verifyUrl}}</p>",
    bodyText: "Verify: {{verifyUrl}}",
    description: "Triggered by MES-006 verification flow.",
    active: true,
  },
  {
    key: "account_updates",
    name: "Account updates",
    subject: "Your account was updated",
    bodyHtml: "<p>{{body}}</p>",
    bodyText: "{{body}}",
    description: null,
    active: true,
  },
  {
    key: "security_alerts",
    name: "Security alerts",
    subject: "Security alert",
    bodyHtml: "<p>{{body}}</p>",
    bodyText: "{{body}}",
    description: null,
    active: true,
  },
  {
    key: "learning_reminder",
    name: "Learning reminder",
    subject: "Continue learning on Mendanize",
    bodyHtml: "<p>{{body}}</p>",
    bodyText: "{{body}}",
    description: "Daily reminder placeholder (MES-022).",
    active: true,
  },
  {
    key: "newsletter",
    name: "Newsletter",
    subject: "Mendanize newsletter",
    bodyHtml: "<p>{{body}}</p>",
    bodyText: "{{body}}",
    description: null,
    active: true,
  },
  {
    key: "platform_announcement",
    name: "Platform announcement",
    subject: "{{title}}",
    bodyHtml: "<p>{{body}}</p>",
    bodyText: "{{body}}",
    description: null,
    active: true,
  },
];

function db() {
  return getPrisma();
}

function interpolate(
  tpl: string,
  payload: Record<string, unknown> | undefined,
): string {
  if (!payload) return tpl;
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = payload[key];
    return v == null ? "" : String(v);
  });
}

function mapInApp(row: {
  id: string;
  publicUserId: string | null;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  preview: string | null;
  body: string | null;
  read: boolean;
  archived: boolean;
  link: string | null;
  templateKey: string | null;
  createdAt: Date;
}): InAppNotification {
  return {
    id: row.id,
    userId: row.publicUserId ?? "",
    type: row.type as NotificationTypeValue,
    priority: row.priority,
    status: row.status,
    title: row.title,
    preview: row.preview,
    body: row.body,
    read: row.read,
    archived: row.archived,
    link: row.link,
    templateKey: row.templateKey,
    createdAt: row.createdAt.toISOString(),
  };
}

async function ensureSeeded(): Promise<void> {
  if (!isDatabaseConfigured()) return;
  await db().$transaction(async (tx) => {
    if (!(await tx.deliverySetting.findUnique({ where: { key: KEY } }))) {
      await tx.deliverySetting.create({
        data: {
          key: KEY,
          smtpNote:
            "SMTP wiring is a placeholder (MES-020 Email settings). Dispatches are logged only.",
        },
      });
    }
    const nCount = await tx.notificationTemplate.count();
    if (nCount === 0) {
      await tx.notificationTemplate.createMany({
        data: DEFAULT_NOTIF_TEMPLATES.map((t) => ({
          key: t.key,
          name: t.name,
          type: t.type as NotificationType,
          titleTpl: t.titleTpl,
          bodyTpl: t.bodyTpl,
          priority: t.priority as NotificationPriority,
          active: t.active,
        })),
      });
    }
    const eCount = await tx.emailTemplate.count();
    if (eCount === 0) {
      await tx.emailTemplate.createMany({
        data: DEFAULT_EMAIL_TEMPLATES.map((t) => ({
          key: t.key,
          name: t.name,
          subject: t.subject,
          bodyHtml: t.bodyHtml,
          bodyText: t.bodyText,
          description: t.description,
          active: t.active,
        })),
      });
    }
    const aCount = await tx.announcement.count();
    if (aCount === 0) {
      await tx.announcement.createMany({
        data: [
          {
            kind: AnnouncementKind.PLATFORM,
            title: "Welcome to the notification system",
            body: "MES-024 is live — all platform communication routes through this service.",
            active: true,
            link: "/dashboard/notifications",
          },
          {
            kind: AnnouncementKind.MAINTENANCE,
            title: "Maintenance notices",
            body: "Maintenance announcements sync conceptually with Platform Settings (MES-020).",
            active: true,
            link: "/dashboard/settings/maintenance",
          },
        ],
      });
    }
  });
}

export function getNotificationTypeMeta() {
  return TYPE_META;
}

export async function getDeliverySettings(): Promise<DeliverySettingRecord> {
  if (!isDatabaseConfigured()) {
    return {
      id: "local",
      inAppEnabled: true,
      emailEnabled: true,
      browserPushEnabled: false,
      smsEnabled: false,
      smtpNote: "SMTP placeholder",
      updatedAt: new Date().toISOString(),
    };
  }
  await ensureSeeded();
  const row = await db().deliverySetting.findUniqueOrThrow({
    where: { key: KEY },
  });
  return {
    id: row.id,
    inAppEnabled: row.inAppEnabled,
    emailEnabled: row.emailEnabled,
    browserPushEnabled: row.browserPushEnabled,
    smsEnabled: row.smsEnabled,
    smtpNote: row.smtpNote,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateDeliverySettings(input: {
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
  browserPushEnabled?: boolean;
  smsEnabled?: boolean;
  smtpNote?: string | null;
}): Promise<DeliverySettingRecord> {
  await ensureSeeded();
  const row = await db().deliverySetting.update({
    where: { key: KEY },
    data: {
      ...(input.inAppEnabled !== undefined
        ? { inAppEnabled: input.inAppEnabled }
        : {}),
      ...(input.emailEnabled !== undefined
        ? { emailEnabled: input.emailEnabled }
        : {}),
      ...(input.browserPushEnabled !== undefined
        ? { browserPushEnabled: input.browserPushEnabled }
        : {}),
      ...(input.smsEnabled !== undefined
        ? { smsEnabled: input.smsEnabled }
        : {}),
      ...(input.smtpNote !== undefined
        ? { smtpNote: input.smtpNote?.trim() || null }
        : {}),
    },
  });
  return {
    id: row.id,
    inAppEnabled: row.inAppEnabled,
    emailEnabled: row.emailEnabled,
    browserPushEnabled: row.browserPushEnabled,
    smsEnabled: row.smsEnabled,
    smtpNote: row.smtpNote,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getNotificationPreferences(
  userId: string,
): Promise<NotificationPreferenceRecord> {
  if (!isDatabaseConfigured()) {
    return {
      id: "local",
      userId,
      learningUpdates: true,
      aiUpdates: true,
      securityAlerts: true,
      newsletter: false,
      productUpdates: true,
      announcements: true,
      updatedAt: new Date().toISOString(),
    };
  }
  let row = await db().notificationPreference.findUnique({
    where: { publicUserId: userId },
  });
  if (!row) {
    row = await db().notificationPreference.create({ data: { publicUserId: userId } });
  }
  return {
    id: row.id,
    userId: row.publicUserId,
    learningUpdates: row.learningUpdates,
    aiUpdates: row.aiUpdates,
    securityAlerts: row.securityAlerts,
    newsletter: row.newsletter,
    productUpdates: row.productUpdates,
    announcements: row.announcements,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateNotificationPreferences(
  userId: string,
  input: Partial<
    Pick<
      NotificationPreferenceRecord,
      | "learningUpdates"
      | "aiUpdates"
      | "securityAlerts"
      | "newsletter"
      | "productUpdates"
      | "announcements"
    >
  >,
): Promise<NotificationPreferenceRecord> {
  await getNotificationPreferences(userId);
  if (!isDatabaseConfigured()) {
    return getNotificationPreferences(userId);
  }
  const row = await db().notificationPreference.update({
    where: { publicUserId: userId },
    data: { ...input },
  });
  return {
    id: row.id,
    userId: row.publicUserId,
    learningUpdates: row.learningUpdates,
    aiUpdates: row.aiUpdates,
    securityAlerts: row.securityAlerts,
    newsletter: row.newsletter,
    productUpdates: row.productUpdates,
    announcements: row.announcements,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Canonical dispatch — Auth, Billing, content, and future modules call this. */
export async function dispatch(
  params: DispatchNotificationParams,
): Promise<NotificationRecord> {
  await ensureSeeded();
  const delivery = await getDeliverySettings();
  const now = new Date().toISOString();

  if (params.channel === "email") {
    if (!delivery.emailEnabled) {
      throw new ValidationError("Email delivery channel is disabled.");
    }
    const emailTpl = isDatabaseConfigured()
      ? await db().emailTemplate.findUnique({ where: { key: params.template } })
      : null;
    const subject = emailTpl
      ? interpolate(emailTpl.subject, params.payload)
      : params.title || params.template;
    const detail = emailTpl
      ? interpolate(emailTpl.bodyText || emailTpl.bodyHtml, params.payload)
      : JSON.stringify(params.payload ?? {});

    if (isDatabaseConfigured()) {
      const log = await db().communicationLog.create({
        data: {
          publicUserId: params.userId ?? null,
          channel: "email",
          templateKey: params.template,
          subject,
          status: "queued",
          detail: `SMTP placeholder — would send to ${params.email ?? "unknown"}. ${detail.slice(0, 500)}`,
        },
      });
      return {
        id: log.id,
        channel: "email",
        template: params.template,
        status: "queued",
        createdAt: now,
      };
    }
    return {
      id: `local-email-${Date.now()}`,
      channel: "email",
      template: params.template,
      status: "queued",
      createdAt: now,
    };
  }

  // in_app
  if (!params.userId) {
    throw new ValidationError("userId is required for in-app notifications.");
  }
  if (!delivery.inAppEnabled) {
    throw new ValidationError("In-app delivery channel is disabled.");
  }

  const notifTpl = isDatabaseConfigured()
    ? await db().notificationTemplate.findUnique({
        where: { key: params.template },
      })
    : null;

  const type =
    (params.type as NotificationType | undefined) ||
    notifTpl?.type ||
    NotificationType.INFO;
  const priority =
    (params.priority as NotificationPriority | undefined) ||
    notifTpl?.priority ||
    NotificationPriority.NORMAL;
  const title = params.title
    ? params.title
    : notifTpl
      ? interpolate(notifTpl.titleTpl, params.payload)
      : params.template;
  const body = params.body
    ? params.body
    : notifTpl
      ? interpolate(notifTpl.bodyTpl, params.payload)
      : params.payload
        ? String(params.payload.body ?? "")
        : null;
  const preview = body ? body.slice(0, 140) : null;

  if (!isDatabaseConfigured()) {
    return {
      id: `local-inapp-${Date.now()}`,
      channel: "in_app",
      template: params.template,
      status: "sent",
      createdAt: now,
    };
  }

  const prefs = await getNotificationPreferences(params.userId);
  const blocked =
    (type === NotificationType.LEARNING && !prefs.learningUpdates) ||
    (type === NotificationType.AI && !prefs.aiUpdates) ||
    (type === NotificationType.SECURITY && !prefs.securityAlerts) ||
    (type === NotificationType.ANNOUNCEMENT && !prefs.announcements);
  if (blocked) {
    const log = await db().communicationLog.create({
      data: {
        publicUserId: params.userId,
        channel: "in_app",
        templateKey: params.template,
        subject: title,
        status: "skipped",
        detail: "Blocked by user notification preferences",
      },
    });
    return {
      id: log.id,
      channel: "in_app",
      template: params.template,
      status: "failed",
      createdAt: now,
    };
  }

  const row = await db().notification.create({
    data: {
      publicUserId: params.userId,
      type,
      priority,
      status: NotificationStatus.UNREAD,
      title,
      preview,
      body,
      link: params.link ?? null,
      templateKey: params.template,
      read: false,
      archived: false,
    },
  });
  await db().communicationLog.create({
    data: {
      publicUserId: params.userId,
      channel: "in_app",
      templateKey: params.template,
      subject: title,
      status: "sent",
      detail: preview,
    },
  });
  return {
    id: row.id,
    channel: "in_app",
    template: params.template,
    status: "sent",
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listForUser(
  userId: string,
  params?: NotificationListParams,
): Promise<NotificationListResult> {
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params?.pageSize ?? 20));
  if (!isDatabaseConfigured()) {
    return { items: [], total: 0, page, pageSize, unreadCount: 0 };
  }
  await ensureSeeded();

  const where: {
    publicUserId: string;
    archived?: boolean;
    status?: NotificationStatus;
    type?: NotificationType;
    OR?: Array<{ title?: { contains: string; mode: "insensitive" }; preview?: { contains: string; mode: "insensitive" } }>;
  } = { publicUserId: userId };

  if (params?.status && params.status !== "ALL") {
    where.status = params.status as NotificationStatus;
    if (params.status === "ARCHIVED") where.archived = true;
    else where.archived = false;
  } else {
    where.archived = false;
  }
  if (params?.type && params.type !== "ALL") {
    where.type = params.type as NotificationType;
  }
  if (params?.query?.trim()) {
    const q = params.query.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { preview: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, unreadCount, rows] = await Promise.all([
    db().notification.count({ where }),
    db().notification.count({
      where: { publicUserId: userId, read: false, archived: false },
    }),
    db().notification.findMany({
      where,
      orderBy: {
        createdAt: params?.sort === "oldest" ? "asc" : "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: rows.map(mapInApp),
    total,
    page,
    pageSize,
    unreadCount,
  };
}

/** Admin in-app notifications (MES-024 / MES-030). */
export async function listNotificationsForAdmin(
  adminId: string,
  params?: NotificationListParams,
): Promise<NotificationListResult> {
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params?.pageSize ?? 20));
  if (!isDatabaseConfigured()) {
    return { items: [], total: 0, page, pageSize, unreadCount: 0 };
  }
  await ensureSeeded();

  const where: {
    adminId: string;
    archived?: boolean;
    status?: NotificationStatus;
    type?: NotificationType;
    OR?: Array<{
      title?: { contains: string; mode: "insensitive" };
      preview?: { contains: string; mode: "insensitive" };
    }>;
  } = { adminId };

  if (params?.status && params.status !== "ALL") {
    where.status = params.status as NotificationStatus;
    if (params.status === "ARCHIVED") where.archived = true;
    else where.archived = false;
  } else {
    where.archived = false;
  }
  if (params?.type && params.type !== "ALL") {
    where.type = params.type as NotificationType;
  }
  if (params?.query?.trim()) {
    const q = params.query.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { preview: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, unreadCount, rows] = await Promise.all([
    db().notification.count({ where }),
    db().notification.count({
      where: { adminId, read: false, archived: false },
    }),
    db().notification.findMany({
      where,
      orderBy: {
        createdAt: params?.sort === "oldest" ? "asc" : "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: rows.map(mapInApp),
    total,
    page,
    pageSize,
    unreadCount,
  };
}

export async function markNotification(
  userId: string,
  id: string,
  action: "read" | "unread" | "archive" | "delete",
): Promise<void> {
  if (!isDatabaseConfigured()) return;
  const row = await db().notification.findUnique({ where: { id } });
  if (!row) return;
  const ownsAsPublic = row.publicUserId === userId;
  const ownsAsAdmin = row.adminId === userId;
  if (!ownsAsPublic && !ownsAsAdmin) {
    throw new AuthorizationError("Not allowed to modify this notification.");
  }
  if (action === "delete") {
    await db().notification.delete({ where: { id } });
    return;
  }
  if (action === "archive") {
    await db().notification.update({
      where: { id },
      data: {
        archived: true,
        status: NotificationStatus.ARCHIVED,
        read: true,
      },
    });
    return;
  }
  if (action === "read") {
    await db().notification.update({
      where: { id },
      data: { read: true, status: NotificationStatus.READ },
    });
    return;
  }
  await db().notification.update({
    where: { id },
    data: { read: false, status: NotificationStatus.UNREAD, archived: false },
  });
}

export async function listNotificationTemplates(): Promise<
  NotificationTemplateRecord[]
> {
  await ensureSeeded();
  if (!isDatabaseConfigured()) {
    return DEFAULT_NOTIF_TEMPLATES.map((t, i) => ({ ...t, id: `nt-${i}` }));
  }
  const rows = await db().notificationTemplate.findMany({
    orderBy: { name: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    key: r.key,
    name: r.name,
    type: r.type as NotificationTypeValue,
    titleTpl: r.titleTpl,
    bodyTpl: r.bodyTpl,
    priority: r.priority,
    active: r.active,
  }));
}

export async function listEmailTemplates(): Promise<EmailTemplateRecord[]> {
  await ensureSeeded();
  if (!isDatabaseConfigured()) {
    return DEFAULT_EMAIL_TEMPLATES.map((t, i) => ({ ...t, id: `et-${i}` }));
  }
  const rows = await db().emailTemplate.findMany({ orderBy: { name: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    key: r.key,
    name: r.name,
    subject: r.subject,
    bodyHtml: r.bodyHtml,
    bodyText: r.bodyText,
    description: r.description,
    active: r.active,
  }));
}

export async function listAnnouncements(): Promise<AnnouncementRecord[]> {
  await ensureSeeded();
  if (!isDatabaseConfigured()) return [];
  const rows = await db().announcement.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    title: r.title,
    body: r.body,
    active: r.active,
    startsAt: r.startsAt?.toISOString() ?? null,
    endsAt: r.endsAt?.toISOString() ?? null,
    link: r.link,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function upsertAnnouncement(input: {
  id?: string;
  kind: AnnouncementRecord["kind"];
  title: string;
  body: string;
  active?: boolean;
  link?: string | null;
}): Promise<AnnouncementRecord> {
  await ensureSeeded();
  if (!isDatabaseConfigured()) {
    throw new ValidationError("Database not configured.");
  }
  const data = {
    kind: input.kind as AnnouncementKind,
    title: input.title.trim(),
    body: input.body.trim(),
    active: input.active ?? true,
    link: input.link?.trim() || null,
  };
  const row = input.id
    ? await db().announcement.update({ where: { id: input.id }, data })
    : await db().announcement.create({ data });
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    active: row.active,
    startsAt: row.startsAt?.toISOString() ?? null,
    endsAt: row.endsAt?.toISOString() ?? null,
    link: row.link,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listCommunicationLogs(input?: {
  query?: string;
  channel?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: CommunicationLogRecord[]; total: number }> {
  await ensureSeeded();
  const page = Math.max(1, input?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, input?.pageSize ?? 20));
  if (!isDatabaseConfigured()) {
    return { items: [], total: 0 };
  }
  const where: {
    channel?: string;
    OR?: Array<{
      subject?: { contains: string; mode: "insensitive" };
      templateKey?: { contains: string; mode: "insensitive" };
    }>;
  } = {};
  if (input?.channel && input.channel !== "all") where.channel = input.channel;
  if (input?.query?.trim()) {
    const q = input.query.trim();
    where.OR = [
      { subject: { contains: q, mode: "insensitive" } },
      { templateKey: { contains: q, mode: "insensitive" } },
    ];
  }
  const [total, rows] = await Promise.all([
    db().communicationLog.count({ where }),
    db().communicationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return {
    total,
    items: rows.map((r) => ({
      id: r.id,
      userId: r.publicUserId,
      channel: r.channel,
      templateKey: r.templateKey,
      subject: r.subject,
      status: r.status,
      detail: r.detail,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export async function getNotificationsDashboard(
  userId?: string,
): Promise<NotificationsDashboard> {
  await ensureSeeded();
  if (!isDatabaseConfigured()) {
    return {
      unreadCount: 0,
      totalCount: 0,
      archivedCount: 0,
      announcementCount: 2,
      emailQueuedToday: 0,
      types: TYPE_META,
    };
  }
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [unreadCount, totalCount, archivedCount, announcementCount, emailQueuedToday] =
    await Promise.all([
      userId
        ? db().notification.count({
            where: { publicUserId: userId, read: false, archived: false },
          })
        : db().notification.count({
            where: { read: false, archived: false },
          }),
      userId
        ? db().notification.count({ where: { publicUserId: userId } })
        : db().notification.count(),
      userId
        ? db().notification.count({ where: { publicUserId: userId, archived: true } })
        : db().notification.count({ where: { archived: true } }),
      db().announcement.count({ where: { active: true } }),
      db().communicationLog.count({
        where: {
          channel: "email",
          status: "queued",
          createdAt: { gte: startOfDay },
        },
      }),
    ]);
  return {
    unreadCount,
    totalCount,
    archivedCount,
    announcementCount,
    emailQueuedToday,
    types: TYPE_META,
  };
}
