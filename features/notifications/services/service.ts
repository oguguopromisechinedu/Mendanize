import {
  getDeliverySettings,
  getNotificationPreferences,
  getNotificationsDashboard,
  listAnnouncements,
  listCommunicationLogs,
  listEmailTemplates,
  listForUser,
  listNotificationTemplates,
  getNotificationTypeMeta,
} from "@/services/notification";

export async function loadDashboard(userId?: string) {
  return getNotificationsDashboard(userId);
}

export async function loadCenter(
  userId: string,
  params?: Parameters<typeof listForUser>[1],
) {
  return listForUser(userId, params);
}

export async function loadTemplates() {
  return listNotificationTemplates();
}

export async function loadEmailTemplates() {
  return listEmailTemplates();
}

export async function loadAnnouncements() {
  return listAnnouncements();
}

export async function loadHistory() {
  return listCommunicationLogs({ pageSize: 40 });
}

export async function loadDelivery() {
  return getDeliverySettings();
}

export async function loadPreferences(userId: string) {
  return getNotificationPreferences(userId);
}

export function loadTypeMeta() {
  return getNotificationTypeMeta();
}
