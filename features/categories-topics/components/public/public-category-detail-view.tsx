import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  contentHref,
  contentListHref,
  type ContentScope,
} from "@/lib/content-paths";
import type {
  ArticleSummary,
  CategoryDetail,
  GuideSummary,
  ToolSummary,
} from "@/services/content/types";
import { TopicCard } from "./topic-card";

function ContentLinks({
  title,
  items,
  hrefFor,
}: {
  title: string;
  items: Array<{ id: string; title: string; slug: string }>;
  hrefFor: (slug: string) => string;
}) {
  if (!items.length) return null;
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={hrefFor(item.slug)}
              className="text-foreground hover:text-primary"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PublicCategoryDetailView({
  category,
  articles,
  guides,
  tools,
  scope = "public",
}: {
  category: CategoryDetail;
  articles: ArticleSummary[];
  guides: GuideSummary[];
  tools: ToolSummary[];
  scope?: ContentScope;
}) {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        {category.imageUrl ? (
          <div className="relative mb-6 aspect-[21/9] overflow-hidden rounded-xl border border-border">
            <Image
              src={category.imageUrl}
              alt={category.imageAlt ?? category.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
            />
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {category.featured ? (
            <Badge variant="secondary">Featured</Badge>
          ) : null}
          <Badge variant="outline">Category</Badge>
        </div>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground">
          {category.name}
        </h1>
        {category.description ? (
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {category.description}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={contentListHref("guide", { scope })}>Browse guides</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={contentListHref("article", { scope })}>
              Read articles
            </Link>
          </Button>
        </div>
      </header>

      {category.topics.length > 0 ? (
        <section>
          <h2 className="text-xl font-semibold text-foreground">Topics</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.topics.map((topic) => (
              <li key={topic.id}>
                <TopicCard
                  topic={topic}
                  categoryName={category.name}
                  scope={scope}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ContentLinks
        title="Articles"
        items={articles.map((a) => ({ id: a.id, title: a.title, slug: a.slug }))}
        hrefFor={(slug) => contentHref("article", slug, { scope })}
      />

      <ContentLinks
        title="Guides"
        items={guides.map((g) => ({ id: g.id, title: g.title, slug: g.slug }))}
        hrefFor={(slug) => contentHref("guide", slug, { scope })}
      />

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
