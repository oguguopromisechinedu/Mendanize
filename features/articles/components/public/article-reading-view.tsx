import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AskContextualWidget } from "@/features/ask-mendanize";
import { RecommendationsRail } from "@/features/recommendations";
import {
  contentHref,
  contentListHref,
  type ContentScope,
} from "@/lib/content-paths";
import type { RecommendationItem } from "@/services/recommendations";
import type { PublicArticleDetail } from "@/services/content";
import { prepareArticleHtml } from "../../utils/toc";
import { ReadingProgressBar } from "./reading-progress-bar";
import { ShareSection } from "./share-section";
import { StickyTableOfContents } from "./sticky-toc";

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ArticleReadingView({
  article,
  related,
  shareUrl,
  structuredData,
  breadcrumbJsonLd,
  scope = "public",
}: {
  article: PublicArticleDetail;
  related: RecommendationItem[];
  shareUrl: string;
  structuredData?: Record<string, unknown> | null;
  breadcrumbJsonLd?: Record<string, unknown> | null;
  scope?: ContentScope;
}) {
  const { html, toc } = prepareArticleHtml(article.content || "");
  const published = formatDate(article.publishedAt);
  const updated = formatDate(article.updatedAt);
  const continueHref = scope === "account" ? "/account/continue" : "/learning";

  return (
    <>
      <ReadingProgressBar />
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      ) : null}
      {breadcrumbJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd),
          }}
        />
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="min-w-0">
          <header className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {article.categoryName ? (
                article.categorySlug ? (
                  <Link
                    href={contentHref("category", article.categorySlug, {
                      scope,
                    })}
                    className="font-medium text-primary hover:underline"
                  >
                    {article.categoryName}
                  </Link>
                ) : (
                  <Link
                    href={contentListHref("category", { scope })}
                    className="font-medium text-primary hover:underline"
                  >
                    {article.categoryName}
                  </Link>
                )
              ) : null}
              {article.topicName ? (
                article.topicSlug ? (
                  <Link
                    href={contentHref("topic", article.topicSlug, { scope })}
                    className="text-muted-foreground hover:text-foreground hover:underline"
                  >
                    · {article.topicName}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">
                    · {article.topicName}
                  </span>
                )
              ) : null}
              {article.featured ? (
                <Badge variant="secondary">Featured</Badge>
              ) : null}
            </div>

            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground md:text-5xl">
              {article.title}
            </h1>

            {article.excerpt ? (
              <p className="mt-4 text-lg text-muted-foreground">
                {article.excerpt}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>{article.authorName ?? "Mendanize Editorial"}</span>
              {published ? <span>· {published}</span> : null}
              {updated && updated !== published ? (
                <span>· Updated {updated}</span>
              ) : null}
              <span>· {article.readingTimeMin} min read</span>
            </div>
          </header>

          {article.featuredImageUrl ? (
            <div className="relative mt-8 aspect-[21/9] max-w-4xl overflow-hidden rounded-xl border border-border bg-muted">
              {/* CMS / media URLs may be any host — skip Next Image optimizer */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.featuredImageUrl}
                alt={article.featuredImageAlt || article.title}
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          ) : null}

          {/* Mobile TOC */}
          {toc.length > 0 ? (
            <details className="mt-8 rounded-lg border border-border p-3 lg:hidden">
              <summary className="cursor-pointer text-sm font-medium">
                On this page
              </summary>
              <ul className="mt-2 space-y-1 text-sm">
                {toc.map((item) => (
                  <li key={item.id} className={item.level === 3 ? "pl-3" : ""}>
                    <a href={`#${item.id}`} className="text-primary hover:underline">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          <div
            className="article-body prose prose-neutral mt-10 max-w-[42rem] dark:prose-invert prose-headings:scroll-mt-24 prose-a:text-primary prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-table:border prose-blockquote:border-primary/40 prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:not-italic"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <section className="mt-12 max-w-3xl rounded-xl border border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Author
            </p>
            <div className="mt-3 flex gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
                {(article.authorName ?? "M").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {article.authorName ?? "Mendanize Editorial"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bio and social links arrive with author profiles — placeholder
                  for now.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Article count placeholder
                </p>
              </div>
            </div>
          </section>

          <div className="mt-8 max-w-3xl">
            <ShareSection title={article.title} url={shareUrl} />
          </div>

          <div className="mt-10 max-w-3xl">
            <AskContextualWidget
              contextType="ARTICLE"
              contextId={article.id}
              contextTitle={article.title}
              contextExcerpt={article.excerpt}
            />
          </div>

          <footer className="mt-12 max-w-3xl space-y-8 border-t border-border pt-8">
            {article.tags.length > 0 ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tags
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={contentHref("topic", tag.slug, { scope })}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              {article.prev ? (
                <Link
                  href={contentHref("article", article.prev.slug, { scope })}
                  className="rounded-lg border border-border p-4 transition-colors hover:border-primary/40"
                >
                  <p className="text-xs text-muted-foreground">Previous</p>
                  <p className="mt-1 font-medium text-foreground">
                    {article.prev.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
              {article.next ? (
                <Link
                  href={contentHref("article", article.next.slug, { scope })}
                  className="rounded-lg border border-border p-4 text-right transition-colors hover:border-primary/40 sm:justify-self-end"
                >
                  <p className="text-xs text-muted-foreground">Next</p>
                  <p className="mt-1 font-medium text-foreground">
                    {article.next.title}
                  </p>
                </Link>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={continueHref}>Continue learning</Link>
              </Button>
              {scope === "public" ? (
                <Button asChild variant="outline">
                  <Link href="/#newsletter">Newsletter</Link>
                </Button>
              ) : null}
              <Button asChild variant="ghost">
                <Link href={contentListHref("article", { scope })}>
                  All articles
                </Link>
              </Button>
            </div>
          </footer>

          <div className="mt-14">
            <RecommendationsRail title="Related content" items={related} />
          </div>
        </div>

        <aside className="min-w-0">
          <StickyTableOfContents items={toc} />
        </aside>
      </div>
    </>
  );
}
