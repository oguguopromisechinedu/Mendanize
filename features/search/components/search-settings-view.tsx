"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { SearchSettingsOverview } from "@/services/search/types";
import {
  saveSearchSettingsAction,
  toggleSearchFilterAction,
} from "../actions/actions";

export function SearchSettingsView({
  overview,
}: {
  overview: SearchSettingsOverview;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const c = overview.configuration;
  const [form, setForm] = useState({
    enabled: c.enabled,
    minQueryLength: c.minQueryLength,
    resultsPerPage: c.resultsPerPage,
    rankingRulesNote: c.rankingRulesNote ?? "",
    synonymsPlaceholder: c.synonymsPlaceholder ?? "",
    stopWordsPlaceholder: c.stopWordsPlaceholder ?? "",
    analyticsPlaceholder: c.analyticsPlaceholder ?? "",
    includeArticles: c.includeArticles,
    includeGuides: c.includeGuides,
    includeTools: c.includeTools,
    includeCategories: c.includeCategories,
    includeTopics: c.includeTopics,
  });
  const [filters, setFilters] = useState(overview.filters);

  function save() {
    startTransition(async () => {
      const res = await saveSearchSettingsAction({
        ...form,
        rankingRulesNote: form.rankingRulesNote || null,
        synonymsPlaceholder: form.synonymsPlaceholder || null,
        stopWordsPlaceholder: form.stopWordsPlaceholder || null,
        analyticsPlaceholder: form.analyticsPlaceholder || null,
      });
      if (!res.ok) toast.error(res.message);
      else {
        toast.success(res.message);
        router.refresh();
      }
    });
  }

  function toggleFilter(key: string, enabled: boolean) {
    setFilters((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled } : f)),
    );
    startTransition(async () => {
      const res = await toggleSearchFilterAction({ key, enabled });
      if (!res.ok) {
        toast.error(res.message);
        router.refresh();
      } else toast.success(res.message);
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Search settings"
        description="Configuration, ranking notes, synonym/stop-word placeholders, and filter toggles."
        actions={
          <Button size="sm" disabled={pending} onClick={save}>
            Save settings
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminPanel title="Suggestions">
          <p className="text-2xl font-semibold">{overview.suggestionCount}</p>
        </AdminPanel>
        <AdminPanel title="Trending">
          <p className="text-2xl font-semibold">{overview.trendingCount}</p>
        </AdminPanel>
        <AdminPanel title="History rows">
          <p className="text-2xl font-semibold">{overview.historyCount}</p>
        </AdminPanel>
      </div>

      <AdminPanel title="Engine">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Label htmlFor="search-enabled">Search enabled</Label>
          <Switch
            id="search-enabled"
            checked={form.enabled}
            onCheckedChange={(v) =>
              setForm((prev) => ({ ...prev, enabled: Boolean(v) }))
            }
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="minQueryLength">Min query length</Label>
            <Input
              id="minQueryLength"
              type="number"
              min={1}
              max={10}
              value={form.minQueryLength}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  minQueryLength: Number(e.target.value) || 1,
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="resultsPerPage">Results per page</Label>
            <Input
              id="resultsPerPage"
              type="number"
              min={5}
              max={50}
              value={form.resultsPerPage}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  resultsPerPage: Number(e.target.value) || 12,
                }))
              }
            />
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(
            [
              ["includeArticles", "Articles"],
              ["includeGuides", "Guides"],
              ["includeTools", "AI Tools"],
              ["includeCategories", "Categories"],
              ["includeTopics", "Topics"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <Label htmlFor={key}>{label}</Label>
              <Switch
                id={key}
                checked={form[key]}
                onCheckedChange={(v) =>
                  setForm((prev) => ({ ...prev, [key]: Boolean(v) }))
                }
              />
            </div>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel title="Ranking rules (placeholder)">
        <Textarea
          value={form.rankingRulesNote}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, rankingRulesNote: e.target.value }))
          }
          rows={4}
        />
      </AdminPanel>

      <AdminPanel title="Synonyms (placeholder)">
        <Textarea
          value={form.synonymsPlaceholder}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              synonymsPlaceholder: e.target.value,
            }))
          }
          rows={3}
          placeholder="one mapping per line"
        />
      </AdminPanel>

      <AdminPanel title="Stop words (placeholder)">
        <Textarea
          value={form.stopWordsPlaceholder}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              stopWordsPlaceholder: e.target.value,
            }))
          }
          rows={3}
        />
      </AdminPanel>

      <AdminPanel title="Search analytics (placeholder)">
        <Textarea
          value={form.analyticsPlaceholder}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              analyticsPlaceholder: e.target.value,
            }))
          }
          rows={3}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Live analytics connect when MES-023 lands. Trending still uses
          placeholder scores until view counts are available.
        </p>
      </AdminPanel>

      <AdminPanel title="Public filters">
        <ul className="divide-y divide-border">
          {filters.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-2 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground">
                  {f.kind} · {f.key}
                </p>
              </div>
              <Switch
                checked={f.enabled}
                onCheckedChange={(v) => toggleFilter(f.key, Boolean(v))}
                disabled={pending}
              />
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  );
}
