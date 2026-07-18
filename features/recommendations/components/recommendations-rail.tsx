"use client";

import Link from "next/link";

import type { RecommendationItem } from "@/services/recommendations/types";

const TYPE_LABEL: Record<string, string> = {
  article: "Article",
  guide: "Guide",
  ai_tool: "AI Tool",
  category: "Category",
  topic: "Topic",
};

export function RecommendationsRail({
  title = "Related",
  items,
  emptyMessage = "No recommendations yet.",
}: {
  title?: string;
  items: RecommendationItem[];
  emptyMessage?: string;
}) {
  if (!items.length) {
    return (
      <section className="rounded-xl border border-dashed border-border px-4 py-6">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={`${item.entityType}-${item.entityId}`}>
            <Link
              href={item.href}
              className="flex gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-hover/40"
            >
              {item.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnail}
                  alt=""
                  className="size-14 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] uppercase text-muted-foreground">
                  {TYPE_LABEL[item.entityType] ?? item.entityType}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  {TYPE_LABEL[item.entityType] ?? item.entityType}
                </p>
                {item.reason ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {item.reason}
                  </p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
