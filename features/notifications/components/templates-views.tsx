import {
  AdminPageHeader,
  AdminPanel,
  StatusBadge,
} from "@/features/admin-dashboard";
import type {
  EmailTemplateRecord,
  NotificationTemplateRecord,
} from "@/services/notification";
import { NotificationsNav } from "./notifications-nav";

export function NotificationTemplatesView({
  templates,
}: {
  templates: NotificationTemplateRecord[];
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Notification templates"
        description="In-app templates used by dispatch() across the platform."
      />
      <NotificationsNav />
      <AdminPanel title={`${templates.length} templates`}>
        <ul className="divide-y divide-border">
          {templates.map((t) => (
            <li key={t.id} className="flex flex-wrap justify-between gap-2 py-3">
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  key: {t.key} · {t.type} · {t.priority}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{t.titleTpl}</p>
              </div>
              <StatusBadge status={t.active ? "active" : "archived"} />
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  );
}

export function EmailTemplatesView({
  templates,
}: {
  templates: EmailTemplateRecord[];
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Email templates"
        description="Welcome, password reset, and verification are triggered by Auth (MES-006) through this service. SMTP delivery is a placeholder."
      />
      <NotificationsNav />
      <AdminPanel title={`${templates.length} email templates`}>
        <ul className="divide-y divide-border">
          {templates.map((t) => (
            <li key={t.id} className="space-y-1 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{t.name}</p>
                <StatusBadge status={t.active ? "active" : "archived"} />
              </div>
              <p className="text-xs text-muted-foreground">key: {t.key}</p>
              <p className="text-sm">Subject: {t.subject}</p>
              {t.description ? (
                <p className="text-sm text-muted-foreground">{t.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  );
}
