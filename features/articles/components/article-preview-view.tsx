import type { ArticleRecord } from "@/services/content/types"
import type { RecommendationItem } from "@/services/recommendations/types"
import { StatusBadge } from "@/features/admin-dashboard"
import { RecommendationsRail } from "@/features/recommendations"
import { Button } from "@/components/ui/button"
import Link from "next/link"

/** Responsive admin preview — public article surface polish is MES-025. */
export function ArticlePreviewView({
  article,
  related = [],
}: {
  article: ArticleRecord
  related?: RecommendationItem[]
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Preview
          </p>
          <div className="flex items-center gap-2">
            <StatusBadge status={article.status.toLowerCase()} />
            <span className="text-sm text-muted-foreground">
              {article.readingTimeMin} min read
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/articles/${article.id}`}>Edit</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/articles">Back to list</Link>
          </Button>
        </div>
      </div>

      <article className="rounded-xl border border-border bg-surface/40 px-5 py-8 sm:px-8">
        {article.featuredImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.featuredImageUrl}
            alt={article.featuredImageAlt || ""}
            className="mb-6 aspect-[2/1] w-full rounded-lg object-cover"
          />
        ) : null}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {article.title}
        </h1>
        {article.excerpt ? (
          <p className="mt-3 text-lg text-muted-foreground">{article.excerpt}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>{article.authorName ?? "Author"}</span>
          {article.categoryName ? <span>· {article.categoryName}</span> : null}
          {article.topicName ? <span>· {article.topicName}</span> : null}
          {article.publishedAt ? (
            <span>· {new Date(article.publishedAt).toLocaleDateString()}</span>
          ) : null}
        </div>
        <div
          className="prose prose-neutral mt-8 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>

      <RecommendationsRail title="Related content" items={related} />
    </div>
  )
}
