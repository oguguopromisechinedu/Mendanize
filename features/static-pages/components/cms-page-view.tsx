import type { StaticPageRecord } from "@/services/admin"
import { prepareArticleHtml } from "@/features/articles"

export function CmsPageView({ page }: { page: StaticPageRecord }) {
  const { html } = prepareArticleHtml(page.content || "")

  return (
    <article className="mx-auto max-w-3xl">
      <header className="max-w-3xl">
        {page.hero ? (
          <p className="type-caption text-primary">{page.hero}</p>
        ) : null}
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground md:text-5xl">
          {page.title}
        </h1>
        {page.excerpt ? (
          <p className="mt-4 text-lg text-muted-foreground">{page.excerpt}</p>
        ) : null}
      </header>

      {page.featuredImageUrl ? (
        <div className="relative mt-8 aspect-[21/9] overflow-hidden rounded-xl border border-border bg-muted">
          {/* CMS / media URLs may be any host — skip Next Image optimizer */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={page.featuredImageUrl}
            alt={page.featuredImageAlt || page.title}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      ) : null}

      <div
        className="article-body prose prose-neutral mt-10 max-w-[42rem] dark:prose-invert prose-headings:scroll-mt-24 prose-a:text-primary prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-table:border prose-blockquote:border-primary/40 prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:not-italic"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  )
}
