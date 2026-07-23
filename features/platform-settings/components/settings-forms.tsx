"use client";

import {
  useState,
  useTransition,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
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
} from "@/services/settings/platform-types";
import { AI_PROVIDERS } from "../constants/constants";
import {
  saveAiSettingsAction,
  saveAuthSettingsAction,
  saveBrandingSettingsAction,
  saveEmailSettingsAction,
  saveGeneralSettingsAction,
  saveLocalizationSettingsAction,
  saveMaintenanceAction,
  saveSearchPlatformSettingsAction,
  saveSecuritySettingsAction,
  toggleFeatureFlagAction,
} from "../actions/actions";
import { SettingsCmsNav } from "./settings-cms-nav";

function useSave() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function run(fn: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) toast.error(res.message);
      else {
        toast.success(res.message);
        router.refresh();
      }
    });
  }
  return { pending, run };
}

export function GeneralSettingsView({
  settings,
}: {
  settings: PlatformSettingRecord;
}) {
  const { pending, run } = useSave();
  const [form, setForm] = useState({ ...settings });
  return (
    <SettingsShell
      title="General"
      description="Platform identity, contact, timezone, and defaults."
      pending={pending}
      onSave={() =>
        run(() =>
          saveGeneralSettingsAction({
            platformName: form.platformName,
            description: form.description,
            websiteUrl: form.websiteUrl,
            contactEmail: form.contactEmail,
            supportEmail: form.supportEmail,
            timeZone: form.timeZone,
            dateFormat: form.dateFormat,
            language: form.language,
            defaultHomepage: form.defaultHomepage,
            defaultUserRole: form.defaultUserRole,
          }),
        )
      }
    >
      <FieldGrid
        fields={[
          ["platformName", "Platform name"],
          ["websiteUrl", "Website URL"],
          ["contactEmail", "Contact email"],
          ["supportEmail", "Support email"],
          ["timeZone", "Time zone"],
          ["dateFormat", "Date format"],
          ["language", "Language"],
          ["defaultHomepage", "Default homepage"],
          ["defaultUserRole", "Default user role"],
        ]}
        form={form as unknown as Record<string, string>}
        setForm={setForm as unknown as Dispatch<SetStateAction<Record<string, string>>>}
      />
      <div className="mt-4 space-y-1.5">
        <Label>Description</Label>
        <Textarea
          value={form.description ?? ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          rows={3}
        />
      </div>
    </SettingsShell>
  );
}

export function BrandingSettingsView({
  settings,
}: {
  settings: BrandingSettingRecord;
}) {
  const { pending, run } = useSave();
  const [form, setForm] = useState({ ...settings });
  return (
    <SettingsShell
      title="Branding"
      description="Writes into the Design Customization brand surface (MES-003) via Settings Service — not a duplicate token store."
      pending={pending}
      onSave={() => run(() => saveBrandingSettingsAction(form))}
    >
      <FieldGrid
        fields={[
          ["brandName", "Brand name"],
          ["logoUrl", "Logo URL"],
          ["faviconUrl", "Favicon URL"],
          ["primaryColor", "Primary color"],
          ["secondaryColor", "Secondary color"],
          ["accentColor", "Accent color"],
        ]}
        form={form as unknown as Record<string, string>}
        setForm={setForm as unknown as Dispatch<SetStateAction<Record<string, string>>>}
      />
      <div className="mt-4 space-y-1.5">
        <Label>Token overrides JSON (optional)</Label>
        <Textarea
          value={form.tokenOverridesJson ?? ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, tokenOverridesJson: e.target.value }))
          }
          rows={5}
          placeholder='{"colors":{"primary":"#E8940C"}}'
        />
      </div>
    </SettingsShell>
  );
}

export function LocalizationSettingsView({
  settings,
}: {
  settings: LocalizationSettingRecord;
}) {
  const { pending, run } = useSave();
  const [form, setForm] = useState({ ...settings });
  return (
    <SettingsShell
      title="Localization"
      description="Prepares multilingual support — available languages are a placeholder list."
      pending={pending}
      onSave={() => run(() => saveLocalizationSettingsAction(form))}
    >
      <FieldGrid
        fields={[
          ["defaultLanguage", "Default language"],
          ["availableLanguages", "Available languages"],
          ["timeZone", "Time zone"],
          ["dateFormat", "Date format"],
          ["numberFormat", "Number format"],
          ["currencyCode", "Currency"],
        ]}
        form={form as unknown as Record<string, string>}
        setForm={setForm as unknown as Dispatch<SetStateAction<Record<string, string>>>}
      />
    </SettingsShell>
  );
}

export function AuthSettingsView({
  settings,
}: {
  settings: AuthenticationSettingRecord;
}) {
  const { pending, run } = useSave();
  const [form, setForm] = useState({ ...settings });
  return (
    <SettingsShell
      title="Authentication settings"
      description="Configuration surface over MES-006 — not a reimplementation of auth."
      pending={pending}
      onSave={() => run(() => saveAuthSettingsAction(form))}
    >
      <ToggleRow
        label="Registration enabled"
        checked={form.registrationEnabled}
        onChange={(v) => setForm((p) => ({ ...p, registrationEnabled: v }))}
      />
      <ToggleRow
        label="Email verification"
        checked={form.emailVerification}
        onChange={(v) => setForm((p) => ({ ...p, emailVerification: v }))}
      />
      <ToggleRow
        label="Remember me"
        checked={form.rememberMeEnabled}
        onChange={(v) => setForm((p) => ({ ...p, rememberMeEnabled: v }))}
      />
      <ToggleRow
        label="2FA placeholder"
        checked={form.twoFactorPlaceholder}
        onChange={(v) => setForm((p) => ({ ...p, twoFactorPlaceholder: v }))}
      />
      <div className="mt-4 space-y-1.5">
        <Label>Session timeout (minutes)</Label>
        <Input
          type="number"
          value={form.sessionTimeoutMinutes}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              sessionTimeoutMinutes: Number(e.target.value) || 60,
            }))
          }
        />
      </div>
      <div className="mt-4 space-y-1.5">
        <Label>Password policy note</Label>
        <Textarea
          value={form.passwordPolicyNote ?? ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, passwordPolicyNote: e.target.value }))
          }
          rows={3}
        />
      </div>
    </SettingsShell>
  );
}

export function AiSettingsView({ settings }: { settings: AIPlatformSettingRecord }) {
  const { pending, run } = useSave();
  const [form, setForm] = useState({
    ...settings,
    enabledProvidersText: settings.enabledProviders.join(", "),
    modelsText: JSON.stringify(settings.models, null, 2),
  });

  return (
    <SettingsShell
      title="AI settings"
      description="Canonical AI configuration for AI Studio and Ask Mendanize. At v1.0 only OpenAI is live (OPENAI_API_KEY); Claude, Gemini, and Grok remain adapter stubs."
      pending={pending}
      onSave={() => {
        let models: Record<string, string> = settings.models;
        try {
          models = JSON.parse(form.modelsText) as Record<string, string>;
        } catch {
          toast.error("Models JSON is invalid");
          return;
        }
        run(() =>
          saveAiSettingsAction({
            defaultTextProvider: form.defaultTextProvider,
            defaultImageProvider: form.defaultImageProvider,
            defaultVideoProvider: form.defaultVideoProvider,
            maxResponseLength: form.maxResponseLength,
            conversationHistoryOn: form.conversationHistoryOn,
            rateLimitPlaceholder: form.rateLimitPlaceholder,
            enabledProviders: form.enabledProvidersText
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            models,
          }),
        );
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            ["defaultTextProvider", "Writing provider"],
            ["defaultImageProvider", "Image provider"],
            ["defaultVideoProvider", "Video provider"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-1.5">
            <Label>{label}</Label>
            <Select
              value={form[key]}
              onChange={(e) =>
                setForm((p) => ({ ...p, [key]: e.target.value }))
              }
            >
              {AI_PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
        ))}
        <div className="space-y-1.5">
          <Label>Max response length</Label>
          <Input
            type="number"
            value={form.maxResponseLength}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                maxResponseLength: Number(e.target.value) || 4000,
              }))
            }
          />
        </div>
      </div>
      <ToggleRow
        label="Ask conversation history"
        checked={form.conversationHistoryOn}
        onChange={(v) => setForm((p) => ({ ...p, conversationHistoryOn: v }))}
      />
      <div className="mt-4 space-y-1.5">
        <Label>Enabled providers (comma-separated)</Label>
        <Input
          value={form.enabledProvidersText}
          onChange={(e) =>
            setForm((p) => ({ ...p, enabledProvidersText: e.target.value }))
          }
        />
      </div>
      <div className="mt-4 space-y-1.5">
        <Label>Models JSON</Label>
        <Textarea
          value={form.modelsText}
          onChange={(e) => setForm((p) => ({ ...p, modelsText: e.target.value }))}
          rows={5}
        />
      </div>
      <div className="mt-4 space-y-1.5">
        <Label>Rate limit placeholder</Label>
        <Textarea
          value={form.rateLimitPlaceholder ?? ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, rateLimitPlaceholder: e.target.value }))
          }
          rows={3}
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Prompt templates for Ask live under Ask Prompt Templates; manage
        conversations in{" "}
        <Link href="/ask" className="text-primary hover:underline">
          Ask Mendanize
        </Link>
        .
      </p>
    </SettingsShell>
  );
}

export function SearchPlatformSettingsView({
  settings,
}: {
  settings: SearchPlatformSettingRecord;
}) {
  const { pending, run } = useSave();
  const [form, setForm] = useState({ ...settings });
  return (
    <SettingsShell
      title="Search settings"
      description="Platform-level search toggles. Syncs enabled + result limit into Search Service (MES-017)."
      pending={pending}
      onSave={() => run(() => saveSearchPlatformSettingsAction(form))}
    >
      <ToggleRow
        label="Search enabled"
        checked={form.enabled}
        onChange={(v) => setForm((p) => ({ ...p, enabled: v }))}
      />
      <ToggleRow
        label="Suggestions"
        checked={form.suggestionsEnabled}
        onChange={(v) => setForm((p) => ({ ...p, suggestionsEnabled: v }))}
      />
      <ToggleRow
        label="Trending"
        checked={form.trendingEnabled}
        onChange={(v) => setForm((p) => ({ ...p, trendingEnabled: v }))}
      />
      <div className="mt-4 space-y-1.5">
        <Label>Result limit</Label>
        <Input
          type="number"
          value={form.resultLimit}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              resultLimit: Number(e.target.value) || 12,
            }))
          }
        />
      </div>
      <Button asChild size="sm" variant="outline" className="mt-4">
        <Link href="/dashboard/search-settings">Open Search CMS</Link>
      </Button>
    </SettingsShell>
  );
}

export function EmailSettingsView({ settings }: { settings: EmailSettingRecord }) {
  const { pending, run } = useSave();
  const [form, setForm] = useState({ ...settings });
  return (
    <SettingsShell
      title="Email settings"
      description="Sender identity and SMTP/template placeholders — no live SMTP in this phase."
      pending={pending}
      onSave={() => run(() => saveEmailSettingsAction(form))}
    >
      <FieldGrid
        fields={[
          ["senderName", "Sender name"],
          ["senderEmail", "Sender email"],
        ]}
        form={form as unknown as Record<string, string>}
        setForm={setForm as unknown as Dispatch<SetStateAction<Record<string, string>>>}
      />
      <div className="mt-4 space-y-1.5">
        <Label>SMTP placeholder</Label>
        <Textarea
          value={form.smtpPlaceholder ?? ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, smtpPlaceholder: e.target.value }))
          }
          rows={3}
        />
      </div>
      <div className="mt-4 space-y-1.5">
        <Label>Templates note</Label>
        <Textarea
          value={form.templatesNote ?? ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, templatesNote: e.target.value }))
          }
          rows={3}
        />
      </div>
    </SettingsShell>
  );
}

export function SecuritySettingsView({
  settings,
}: {
  settings: SecuritySettingRecord;
}) {
  const { pending, run } = useSave();
  const [form, setForm] = useState({ ...settings });
  return (
    <SettingsShell
      title="Security settings"
      description="Login attempt limits and audit logging toggles (Appendix A baseline)."
      pending={pending}
      onSave={() => run(() => saveSecuritySettingsAction(form))}
    >
      <div className="space-y-1.5">
        <Label>Max login attempts</Label>
        <Input
          type="number"
          value={form.maxLoginAttempts}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              maxLoginAttempts: Number(e.target.value) || 5,
            }))
          }
        />
      </div>
      <ToggleRow
        label="Audit logging"
        checked={form.auditLoggingEnabled}
        onChange={(v) => setForm((p) => ({ ...p, auditLoggingEnabled: v }))}
      />
      <div className="mt-4 space-y-1.5">
        <Label>API access placeholder</Label>
        <Textarea
          value={form.apiAccessPlaceholder ?? ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, apiAccessPlaceholder: e.target.value }))
          }
          rows={3}
        />
      </div>
    </SettingsShell>
  );
}

export function MaintenanceSettingsView({
  settings,
}: {
  settings: MaintenanceConfigurationRecord;
}) {
  const { pending, run } = useSave();
  const [form, setForm] = useState({ ...settings });
  return (
    <SettingsShell
      title="Maintenance mode"
      description="Enable maintenance, set message, and allowlisted admin emails."
      pending={pending}
      onSave={() => run(() => saveMaintenanceAction(form))}
    >
      <ToggleRow
        label="Maintenance enabled"
        checked={form.enabled}
        onChange={(v) => setForm((p) => ({ ...p, enabled: v }))}
      />
      <ToggleRow
        label="Show banner"
        checked={form.showBanner}
        onChange={(v) => setForm((p) => ({ ...p, showBanner: v }))}
      />
      <div className="mt-4 space-y-1.5">
        <Label>Message</Label>
        <Textarea
          value={form.message ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          rows={3}
        />
      </div>
      <div className="mt-4 space-y-1.5">
        <Label>Allowed admin emails</Label>
        <Textarea
          value={form.allowedAdminEmails ?? ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, allowedAdminEmails: e.target.value }))
          }
          rows={3}
          placeholder="admin@example.com"
        />
      </div>
    </SettingsShell>
  );
}

export function FeatureFlagsView({ flags }: { flags: FeatureFlagRecord[] }) {
  const { pending, run } = useSave();
  const [rows, setRows] = useState(flags);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Feature flags"
        description="Enable or disable modules across the platform."
      />
      <SettingsCmsNav />
      <AdminPanel title="Modules">
        <ul className="divide-y divide-border">
          {rows.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div>
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-xs text-muted-foreground">
                  {f.key}
                  {f.description ? ` · ${f.description}` : ""}
                </p>
              </div>
              <Switch
                checked={f.enabled}
                disabled={pending}
                onCheckedChange={(v) => {
                  const enabled = Boolean(v);
                  setRows((prev) =>
                    prev.map((x) =>
                      x.key === f.key ? { ...x, enabled } : x,
                    ),
                  );
                  run(() =>
                    toggleFeatureFlagAction({ key: f.key, enabled }),
                  );
                }}
              />
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  );
}

export function BackupSettingsView() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Backup & restore"
        description="Mendanize relies on Supabase automated backups (MES-034). Follow the restore runbook for incidents."
      />
      <SettingsCmsNav />
      <AdminPanel title="Restore runbook">
        <p className="text-sm text-muted-foreground">
          Operators: use{" "}
          <span className="font-mono text-foreground">
            docs/runbooks/restore.md
          </span>{" "}
          in the repository for snapshot, restore, and verification steps.
          Confirm your Supabase plan tier includes the retention window you
          need. Pre-migration manual snapshots remain required for risky schema
          changes.
        </p>
      </AdminPanel>
    </div>
  );
}

function SettingsShell({
  title,
  description,
  children,
  pending,
  onSave,
}: {
  title: string;
  description: string;
  children: ReactNode;
  pending: boolean;
  onSave: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          <Button size="sm" disabled={pending} onClick={onSave}>
            Save
          </Button>
        }
      />
      <SettingsCmsNav />
      <AdminPanel title={title}>{children}</AdminPanel>
    </div>
  );
}

function FieldGrid({
  fields,
  form,
  setForm,
}: {
  fields: Array<[string, string]>;
  form: Record<string, string>;
  setForm: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(([key, label]) => (
        <div key={key} className="space-y-1.5">
          <Label>{label}</Label>
          <Input
            value={form[key] ?? ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, [key]: e.target.value }))
            }
          />
        </div>
      ))}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="mt-3 flex items-center justify-between gap-2">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
    </div>
  );
}
