/** Notification Shared Service types — MES-002 / MES-024 */

export type NotificationChannel = "in_app" | "email";

export type NotificationTypeValue =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "SECURITY"
  | "SYSTEM"
  | "LEARNING"
  | "AI"
  | "ANNOUNCEMENT"
  | "BILLING";

export type NotificationPriorityValue = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type NotificationStatusValue = "UNREAD" | "READ" | "ARCHIVED";

export type DispatchNotificationParams = {
  /** PublicUser id for learner notifications. */
  userId?: string;
  /** Admin id for staff notifications (MES-030). Mutually preferred over userId for staff ops. */
  adminId?: string;
  email?: string;
  channel: NotificationChannel;
  template: string;
  payload?: Record<string, unknown>;
  type?: NotificationTypeValue;
  priority?: NotificationPriorityValue;
  title?: string;
  body?: string;
  link?: string;
};

export type NotificationRecord = {
  id: string;
  channel: NotificationChannel;
  template: string;
  status: "queued" | "sent" | "failed";
  createdAt: string;
};

export type InAppNotification = {
  id: string;
  userId: string;
  type: NotificationTypeValue;
  priority: NotificationPriorityValue;
  status: NotificationStatusValue;
  title: string;
  preview: string | null;
  body: string | null;
  read: boolean;
  archived: boolean;
  link: string | null;
  templateKey: string | null;
  createdAt: string;
};

export type NotificationListParams = {
  query?: string;
  type?: NotificationTypeValue | "ALL";
  status?: NotificationStatusValue | "ALL";
  sort?: "newest" | "oldest";
  page?: number;
  pageSize?: number;
};

export type NotificationListResult = {
  items: InAppNotification[];
  total: number;
  page: number;
  pageSize: number;
  unreadCount: number;
};

export type NotificationPreferenceRecord = {
  id: string;
  userId: string;
  learningUpdates: boolean;
  aiUpdates: boolean;
  securityAlerts: boolean;
  newsletter: boolean;
  productUpdates: boolean;
  announcements: boolean;
  updatedAt: string;
};

export type NotificationTemplateRecord = {
  id: string;
  key: string;
  name: string;
  type: NotificationTypeValue;
  titleTpl: string;
  bodyTpl: string;
  priority: NotificationPriorityValue;
  active: boolean;
};

export type EmailTemplateRecord = {
  id: string;
  key: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string | null;
  description: string | null;
  active: boolean;
};

export type AnnouncementRecord = {
  id: string;
  kind: "PLATFORM" | "MAINTENANCE" | "FEATURE" | "LEARNING";
  title: string;
  body: string;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  link: string | null;
  createdAt: string;
};

export type CommunicationLogRecord = {
  id: string;
  userId: string | null;
  channel: string;
  templateKey: string | null;
  subject: string | null;
  status: string;
  detail: string | null;
  createdAt: string;
};

export type DeliverySettingRecord = {
  id: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  browserPushEnabled: boolean;
  smsEnabled: boolean;
  smtpNote: string | null;
  updatedAt: string;
};

export type NotificationsDashboard = {
  unreadCount: number;
  totalCount: number;
  archivedCount: number;
  announcementCount: number;
  emailQueuedToday: number;
  types: Array<{ type: NotificationTypeValue; label: string; color: string }>;
};
