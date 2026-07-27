"use client";

import {
  Award,
  BookOpen,
  Briefcase,
  Code2,
  Cpu,
  Download,
  GraduationCap,
  MessageSquare,
  Newspaper,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { StatItem } from "../types/types";
import { useHomepageStatistics } from "../hooks/use-homepage-statistics";

const ICONS: Record<string, LucideIcon> = {
  articles: BookOpen,
  tools: Cpu,
  learners: GraduationCap,
  subscribers: Users,
  content: Newspaper,
  hub: Sparkles,
  courses: BookOpen,
  workProjects: Briefcase,
  developers: Code2,
  certificates: Award,
  marketplaceDownloads: Download,
  communityMembers: MessageSquare,
};

export function LiveHomepageStats({
  items,
  variant = "hero",
}: {
  items: StatItem[];
  variant?: "hero" | "grid";
}) {
  const live = useHomepageStatistics(items);

  if (variant === "grid") {
    return (
      <>
        {live.map((item) => {
          const Icon = ICONS[item.icon ?? item.id] ?? Sparkles;
          return (
            <div
              key={item.id}
              className="flex flex-col items-center gap-2 px-4 py-2 text-center sm:flex-row sm:text-left"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="size-5" aria-hidden />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {item.value}
                </p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          );
        })}
      </>
    );
  }

  return (
    <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
      {live.map((s) => {
        const Icon = ICONS[s.icon ?? s.id] ?? Sparkles;
        return (
          <div key={s.id} className="flex min-w-0 items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary sm:size-10">
              <Icon className="size-4 sm:size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-base font-bold text-foreground sm:text-lg">
                {s.value}
              </span>
              <span className="block truncate text-[10px] text-muted-foreground sm:text-[11px]">
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
