import type { ArticleStatusValue } from "@/services/content/types";
import type { RecentArticleRow } from "../types/types";

export function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";

  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatShortDate(d.toISOString());
}

export function mapArticleStatus(
  status: ArticleStatusValue,
): RecentArticleRow["status"] {
  switch (status) {
    case "DRAFT":
    case "ARCHIVED":
      return "draft";
    case "REVIEW":
      return "review";
    case "SCHEDULED":
      return "scheduled";
    case "PUBLISHED":
      return "published";
  }
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export function formatTrend(current: number, prior: number): string | undefined {
  if (prior <= 0 && current <= 0) return undefined;
  if (prior <= 0) return `+${current} from last 7 days`;
  const pct = Math.round(((current - prior) / prior) * 100);
  if (pct === 0) return "No change from last 7 days";
  return `${pct > 0 ? "+" : ""}${pct}% from last 7 days`;
}
