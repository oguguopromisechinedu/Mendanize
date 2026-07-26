import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  contentHref,
  contentListHref,
  contentSearchHref,
  type ContentScope,
} from "@/lib/content-paths";
import type {
  ArticleSummary,
  GuideSummary,
  ToolSummary,
  TopicDetail,
} from "@/services/content/types";

export function PublicTopicDetailView({
  topic,
  categorySlug,
  articles,
  guides,
  tools,
  scope = "public",
}: {
  topic: TopicDetail;
  categorySlug?: string | null;
  articles: ArticleSummary[];
  guides: GuideSummary[];
  tools: ToolSummary[];
  scope?: ContentScope;
}) {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        {topic.imageUrl ? (
          <div className="relative mb-6 aspect-[21/9] overflow-hidden rounded-xl border border-border">
            <Image
              src={topic.imageUrl}
              alt={topic.imageAlt ?? topic.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
            />
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {topic.featured ? (
            <Badge variant="secondary">Featured</Badge>
          ) : null}
          <Badge variant="outline">Topic</Badge>
          {topic.categoryName && categorySlug ? (
            <Link
              href={contentHref("category", categorySlug, { scope })}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              {topic.categoryName}
            </Link>
          ) : topic.categoryName ? (
            <span className="text-xs text-muted-foreground">
              {topic.categoryName}
            </span>
          ) : null}
        </div>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground">
          {topic.name}
        </h1>
        {topic.description ? (
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {topic.description}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={contentListHref("guide", { scope })}>
              Related guides
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={contentSearchHref({ scope })}>Search this topic</Link>
          </Button>
        </div>
      </header>

      {articles.length > 0 ? (
        <section>
          <h2 className="text-xl font-semibold text-foreground">Articles</h2>
          <ul className="mt-4 space-y-3">
            {articles.map((article) => (
              <li key={article.id}>
                <Link
                  href={contentHref("article", article.slug, { scope })}
                  className="text-foreground hover:text-primary"
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {guides.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground">Guides</h2>
          <ul className="mt-4 space-y-3">
            {guides.map((guide) => (
              <li key={guide.id}>
                <Link
                  href={contentHref("guide", guide.slug, { scope })}
                  className="text-foreground hover:text-primary"
                >
                  {guide.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tools.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground">AI Tools</h2>
          <ul className="mt-4 space-y-3">
            {tools.map((tool) => (
              <li key={tool.id}>
                <Link
                  href={contentHref("ai_tool", tool.slug, { scope })}
                  className="text-foreground hover:text-primary"
                >
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
