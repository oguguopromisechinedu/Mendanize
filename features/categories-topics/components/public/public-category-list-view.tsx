import Link from "next/link";

import { CategoryCard } from "@/components/shared/content-cards";
import {
  contentHref,
  contentListHref,
  contentSearchHref,
  type ContentScope,
} from "@/lib/content-paths";
import type { CategoryRecord } from "@/services/content/types";

export function PublicCategoryListView({
  categories,
  scope = "public",
}: {
  categories: CategoryRecord[];
  scope?: ContentScope;
}) {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10 max-w-2xl">
        <p className="type-caption text-primary">Categories</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground">
          Explore by topic area
        </h1>
        <p className="mt-3 text-muted-foreground">
          Browse Mendanize learning categories — each connects articles, guides,
          and AI tools around a focused discipline.
        </p>
      </header>

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No categories published yet.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <li key={category.id}>
              <CategoryCard
                href={contentHref("category", category.slug, { scope })}
                title={category.name}
                description={category.description ?? undefined}
                badge={category.featured ? "Featured" : undefined}
                meta={[
                  category.topicCount
                    ? `${category.topicCount} topics`
                    : null,
                  category.articleCount
                    ? `${category.articleCount} articles`
                    : null,
                  category.guideCount
                    ? `${category.guideCount} guides`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10 text-sm text-muted-foreground">
        Looking for a specific subject?{" "}
        <Link
          href={contentListHref("topic", { scope })}
          className="text-primary hover:opacity-90"
        >
          Browse all topics
        </Link>{" "}
        or{" "}
        <Link
          href={contentSearchHref({ scope })}
          className="text-primary hover:opacity-90"
        >
          search the library
        </Link>
        .
      </p>
    </div>
  );
}
