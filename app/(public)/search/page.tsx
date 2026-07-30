import { loadSearchResults, loadFilterOptions } from "@/features/search/server";
import type { Metadata } from "next"
import { Suspense } from "react"

import { PageShell } from "@/components/layout/PageShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchFilters, SearchResultsView } from "@/features/search"
import type { SearchEntityType } from "@/services/search/types"
import { searchFiltersSchema } from "@/features/search/validators/schema"

export const metadata: Metadata = {
  title: "Search",
  description: "Search articles, guides, AI tools, categories, and topics on Mendanize.",
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const flat: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(raw)) {
    flat[k] = Array.isArray(v) ? v[0] : v
  }
  const parsed = searchFiltersSchema.safeParse(flat)
  const filters = parsed.success
    ? parsed.data
    : {
        q: "",
        page: 1,
        pageSize: undefined as number | undefined,
        types: undefined as SearchEntityType[] | undefined,
        category: undefined as string | undefined,
        topic: undefined as string | undefined,
        difficulty: undefined as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined,
        featured: undefined as boolean | undefined,
        recentlyUpdated: undefined as boolean | undefined,
        from: undefined as string | undefined,
        to: undefined as string | undefined,
      }

  const q = (filters.q ?? "").trim()
  const [options, result] = await Promise.all([
    loadFilterOptions(),
    q
      ? loadSearchResults({
          query: q,
          page: filters.page,
          pageSize: filters.pageSize,
          types: filters.types as SearchEntityType[] | undefined,
          categorySlug: filters.category,
          topicSlug: filters.topic,
          difficulty: filters.difficulty,
          featured: filters.featured,
          recentlyUpdated: filters.recentlyUpdated,
          publishedAfter: filters.from,
          publishedBefore: filters.to,
        })
      : Promise.resolve(null),
  ])

  return (
    <PageShell
      title="Search"
      description="One search across articles, guides, AI tools, categories, and topics."
      crumbs={[{ label: "Search" }]}
    >
      <form action="/search" method="get" className="mb-8 flex max-w-2xl gap-2">
        <Input
          name="q"
          placeholder="Search articles, guides, tools…"
          aria-label="Search query"
          defaultValue={q}
          className="h-11 text-base"
        />
        <Button type="submit" className="h-11 px-6">
          Search
        </Button>
      </form>

      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <Suspense fallback={<div className="text-sm text-muted-foreground">Loading filters…</div>}>
          <SearchFilters
            state={{
              q,
              types: (filters.types as string[] | undefined) ?? [],
              category: filters.category ?? "",
              topic: filters.topic ?? "",
              difficulty: filters.difficulty ?? "",
              featured: Boolean(filters.featured),
              recentlyUpdated: Boolean(filters.recentlyUpdated),
              from: filters.from ?? "",
              to: filters.to ?? "",
            }}
            categories={options.categories}
            topics={options.topics}
          />
        </Suspense>
        <SearchResultsView result={result} emptyQuery={!q} />
      </div>
    </PageShell>
  )
}
