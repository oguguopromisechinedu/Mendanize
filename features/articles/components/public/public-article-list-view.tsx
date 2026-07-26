import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  contentHref,
  type ContentScope,
} from "@/lib/content-paths";
import type { ArticleSummary } from "@/services/content";

export function PublicArticleListView({
  articles,
  scope = "public",
}: {
  articles: ArticleSummary[];
  scope?: ContentScope;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-10 max-w-2xl">
        <p className="type-caption text-primary">Articles</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground">
          Learn with clarity
        </h1>
        <p className="mt-3 text-muted-foreground">
          Educational deep-dives on AI, web, and modern software — free to read,
          connected to guides and tools.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No published articles yet. Check back soon.
        </p>
      ) : (
        <ul className="space-y-8">
          {articles.map((article) => (
            <li key={article.id}>
              <Link
                href={contentHref("article", article.slug, { scope })}
                className="group grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border bg-muted">
                  {article.featuredImageUrl ? (
                    <Image
                      src={article.featuredImageUrl}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="192px"
                    />
                  ) : null}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {article.categoryName ? (
                      <span>{article.categoryName}</span>
                    ) : null}
                    {article.featured ? (
                      <Badge variant="secondary">Featured</Badge>
                    ) : null}
                    {article.readingTimeMin ? (
                      <span>{article.readingTimeMin} min</span>
                    ) : null}
                  </div>
                  <h2 className="mt-1 text-xl font-semibold text-foreground group-hover:text-primary">
                    {article.title}
                  </h2>
                  {article.excerpt ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {article.excerpt}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
