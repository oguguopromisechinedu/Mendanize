import Link from "next/link";

import type { SearchHit, SearchResult } from "@/services/search/types";

const TYPE_LABEL: Record<string, string> = {
  article: "Article",
  guide: "Guide",
  ai_tool: "AI Tool",
  category: "Category",
  topic: "Topic",
};

function ResultCard({ hit }: { hit: SearchHit }) {
  return (
    <li>
      <Link
        href={hit.href}
        className="flex gap-4 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-hover/40"
      >
        {hit.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hit.thumbnailUrl}
            alt=""
            className="size-16 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
            {TYPE_LABEL[hit.type] ?? hit.type}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {TYPE_LABEL[hit.type] ?? hit.type}
            </span>
            {hit.featured ? (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Featured
              </span>
            ) : null}
          </div>
          <p className="truncate font-medium text-foreground">{hit.title}</p>
          {hit.excerpt ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {hit.excerpt}
            </p>
          ) : null}
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {hit.categoryName ? <span>{hit.categoryName}</span> : null}
            {hit.topicName ? <span>{hit.topicName}</span> : null}
            {hit.difficulty ? <span>{hit.difficulty}</span> : null}
            {hit.readingTimeMin != null ? (
              <span>{hit.readingTimeMin} min</span>
            ) : null}
            {hit.publishedAt ? (
              <span>{new Date(hit.publishedAt).toLocaleDateString()}</span>
            ) : hit.updatedAt ? (
              <span>Updated {new Date(hit.updatedAt).toLocaleDateString()}</span>
            ) : null}
          </p>
        </div>
      </Link>
    </li>
  );
}

export function SearchResultsView({
  result,
  emptyQuery,
}: {
  result: SearchResult | null;
  emptyQuery: boolean;
}) {
  if (emptyQuery) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
        <p className="font-medium text-foreground">Start searching</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter a query to find articles, guides, AI tools, categories, and topics.
        </p>
      </div>
    );
  }

  if (!result || result.total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
        <p className="font-medium text-foreground">No results</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Nothing matched “{result?.query ?? ""}”. Try fewer filters or a broader
          phrase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        {result.total} result{result.total === 1 ? "" : "s"} for “{result.query}”
      </p>
      {result.groups.map((group) => (
        <section key={group.type} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </h2>
          <ul className="space-y-3">
            {group.hits.map((hit) => (
              <ResultCard key={`${hit.type}-${hit.id}`} hit={hit} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
