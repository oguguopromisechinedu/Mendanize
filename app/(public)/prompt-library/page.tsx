import type { Metadata } from "next"
import Link from "next/link"

import { PageShell } from "@/components/layout/PageShell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { listPublishedPromptPacks } from "@/services/ecosystem"

export const metadata: Metadata = {
  title: "Prompt Library",
  description:
    "Searchable prompt packs—copy, save, and rate community and premium prompts.",
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

export default async function PromptLibraryPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const q = (first(raw.q) ?? "").trim().toLowerCase()
  const category = first(raw.category)
  const tag = first(raw.tag)
  const filter = first(raw.filter) // featured | premium | community

  let packs = await listPublishedPromptPacks().catch(() => [])

  if (category) {
    packs = packs.filter(
      (p) => (p.category ?? "").toLowerCase() === category.toLowerCase()
    )
  }
  if (tag) {
    packs = packs.filter((p) =>
      (p.tags ?? []).some((t) => t.toLowerCase() === tag.toLowerCase())
    )
  }
  if (filter === "featured") {
    packs = packs.filter((p) => p.featured)
  } else if (filter === "premium") {
    packs = packs.filter((p) => p.premium)
  } else if (filter === "community") {
    packs = packs.filter((p) => !p.premium)
  }
  if (q) {
    packs = packs.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q)) ||
        p.items.some(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.prompt.toLowerCase().includes(q)
        )
    )
  }

  const categories = Array.from(
    new Set(packs.map((p) => p.category).filter(Boolean) as string[])
  ).sort()
  const tags = Array.from(
    new Set(packs.flatMap((p) => p.tags ?? []))
  ).sort()

  return (
    <PageShell
      title="Prompt Library"
      hideHeader
      width="wide"
      crumbs={[{ label: "Prompt Library" }]}
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 max-w-2xl">
          <p className="type-caption text-primary">Prompt Library</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground sm:text-5xl">
            Prompts you can copy and ship
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Browse featured, community, and premium prompt packs curated for
            real workflows.
          </p>
        </header>

        <form className="mb-8 flex flex-col gap-3 sm:flex-row" method="get">
          <Input
            name="q"
            defaultValue={first(raw.q) ?? ""}
            placeholder="Search prompts and packs…"
            className="sm:flex-1"
            aria-label="Search prompts"
          />
          <select
            name="category"
            defaultValue={category ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            name="filter"
            defaultValue={filter ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Filter"
          >
            <option value="">All packs</option>
            <option value="featured">Featured</option>
            <option value="premium">Premium</option>
            <option value="community">Community</option>
          </select>
          <Button type="submit">Search</Button>
        </form>

        {tags.length > 0 ? (
          <div className="mb-8 flex flex-wrap gap-2">
            {tags.slice(0, 16).map((t) => (
              <Link
                key={t}
                href={`/prompt-library?tag=${encodeURIComponent(t)}`}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                #{t}
              </Link>
            ))}
          </div>
        ) : null}

        {packs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No prompt packs published yet. Check back soon, or explore{" "}
            <Link href="/ai-tools" className="text-primary hover:underline">
              AI Tools
            </Link>
            .
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2">
            {packs.map((pack) => (
              <li key={pack.id}>
                <Link
                  href={`/prompt-library/${pack.slug}`}
                  className="block rounded-xl border border-border bg-card/50 p-5 transition hover:border-primary/40"
                >
                  <div className="flex flex-wrap gap-2">
                    {pack.featured ? (
                      <Badge variant="secondary">Featured</Badge>
                    ) : null}
                    {pack.premium ? <Badge>Premium</Badge> : null}
                    {pack.category ? (
                      <span className="text-xs text-muted-foreground">
                        {pack.category}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-foreground">
                    {pack.title}
                  </h2>
                  {pack.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {pack.description}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {pack.items.length} prompts
                    {pack.ratingCount > 0
                      ? ` · ${pack.ratingAvg.toFixed(1)}★ (${pack.ratingCount})`
                      : null}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  )
}
