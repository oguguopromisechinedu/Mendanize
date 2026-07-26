import Link from "next/link";

import {
  contentListHref,
  type ContentScope,
} from "@/lib/content-paths";
import type { CategoryRecord, TopicRecord } from "@/services/content/types";
import { TopicCard } from "./topic-card";

export function PublicTopicListView({
  topics,
  categories,
  scope = "public",
}: {
  topics: TopicRecord[];
  categories: CategoryRecord[];
  scope?: ContentScope;
}) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10 max-w-2xl">
        <p className="type-caption text-primary">Topics</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground">
          Focused learning subjects
        </h1>
        <p className="mt-3 text-muted-foreground">
          Drill into specific technologies and concepts — each topic groups
          related articles, guides, and tools.
        </p>
      </header>

      {topics.length === 0 ? (
        <p className="text-sm text-muted-foreground">No topics published yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <li key={topic.id}>
              <TopicCard
                topic={topic}
                categoryName={
                  topic.categoryId
                    ? categoryById.get(topic.categoryId)?.name
                    : null
                }
                scope={scope}
              />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10 text-sm text-muted-foreground">
        <Link
          href={contentListHref("category", { scope })}
          className="text-primary hover:opacity-90"
        >
          View categories
        </Link>{" "}
        for a higher-level overview.
      </p>
    </div>
  );
}
