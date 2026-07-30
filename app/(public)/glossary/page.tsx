import type { Metadata } from "next"
import Link from "next/link"

import { PageShell } from "@/components/layout/PageShell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { listPublishedGlossaryTerms } from "@/services/platform"

export const metadata: Metadata = {
  title: "AI Glossary",
  description:
    "Alphabetical AI glossary with search, categories, and related terms.",
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export default async function GlossaryPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const q = first(raw.q)
  const category = first(raw.category)
  const letter = first(raw.letter)

  const terms = await listPublishedGlossaryTerms({
    query: q,
    category,
    letter,
  })

  const categories = Array.from(
    new Set(terms.map((t) => t.category).filter(Boolean) as string[])
  ).sort()

  const grouped = LETTERS.map((L) => ({
    letter: L,
    terms: terms.filter((t) => t.term.toUpperCase().startsWith(L)),
  })).filter((g) => g.terms.length > 0)

  return (
    <PageShell
      title="AI Glossary"
      hideHeader
      width="wide"
      crumbs={[{ label: "Glossary" }]}
    >
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 max-w-2xl">
          <p className="type-caption text-primary">Glossary</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">
            AI terms, clearly defined
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Search the alphabetical index or jump by letter and category.
          </p>
        </header>

        <form className="mb-6 flex flex-col gap-3 sm:flex-row" method="get">
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search terms…"
            className="sm:flex-1"
            aria-label="Search glossary"
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
          <Button type="submit">Search</Button>
        </form>

        <nav
          aria-label="Alphabetical index"
          className="mb-10 flex flex-wrap gap-1.5"
        >
          {LETTERS.map((L) => (
            <Link
              key={L}
              href={`/glossary?letter=${L}`}
              className={`inline-flex size-8 items-center justify-center rounded-md border text-xs font-medium transition ${
                letter === L
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {L}
            </Link>
          ))}
          <Link
            href="/glossary"
            className="inline-flex h-8 items-center rounded-md border border-border px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            All
          </Link>
        </nav>

        {terms.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No glossary terms match. Try another letter or clear filters.
          </p>
        ) : (
          <div className="space-y-10">
            {grouped.map((group) => (
              <section key={group.letter} id={`letter-${group.letter}`}>
                <h2 className="text-2xl font-semibold text-foreground">
                  {group.letter}
                </h2>
                <ul className="mt-4 space-y-4">
                  {group.terms.map((term) => (
                    <li key={term.id}>
                      <Link
                        href={`/glossary/${term.slug}`}
                        className="block rounded-lg border border-transparent px-1 py-2 hover:border-border"
                      >
                        <h3 className="font-semibold text-foreground hover:text-primary">
                          {term.term}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {term.definition}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
