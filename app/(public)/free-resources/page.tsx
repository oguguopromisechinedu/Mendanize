import type { Metadata } from "next"
import Link from "next/link"

import { PageShell } from "@/components/layout/PageShell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { listPublishedFreeResources } from "@/services/platform"
import type { FreeResourceType } from "@prisma/client"

export const metadata: Metadata = {
  title: "Free Resources",
  description:
    "Download free AI PDFs, templates, checklists, cheat sheets, and e-books.",
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

const TYPE_LABEL: Record<FreeResourceType, string> = {
  PDF: "PDF",
  TEMPLATE: "Template",
  CHECKLIST: "Checklist",
  CHEATSHEET: "Cheat sheet",
  EBOOK: "E-book",
}

export default async function FreeResourcesPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const q = first(raw.q)
  const category = first(raw.category)
  const type = first(raw.type) as FreeResourceType | undefined

  const resources = await listPublishedFreeResources({
    query: q,
    category,
    type: type && type in TYPE_LABEL ? type : undefined,
  })

  const categories = Array.from(
    new Set(resources.map((r) => r.category).filter(Boolean) as string[])
  ).sort()

  return (
    <PageShell
      title="Free Resources"
      hideHeader
      width="wide"
      crumbs={[{ label: "Free Resources" }]}
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 max-w-2xl">
          <p className="type-caption text-primary">Free Resources</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">
            Templates and guides you can download
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            PDFs, checklists, cheat sheets, and e-books to accelerate your AI
            learning.
          </p>
        </header>

        <form className="mb-8 flex flex-col gap-3 sm:flex-row" method="get">
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search resources…"
            className="sm:flex-1"
            aria-label="Search resources"
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
            name="type"
            defaultValue={type ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Type"
          >
            <option value="">All types</option>
            {Object.entries(TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button type="submit">Search</Button>
        </form>

        {resources.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No resources published yet. Meanwhile explore{" "}
            <Link href="/learn" className="text-primary hover:underline">
              Learn
            </Link>{" "}
            or the{" "}
            <Link href="/glossary" className="text-primary hover:underline">
              Glossary
            </Link>
            .
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2">
            {resources.map((resource) => (
              <li key={resource.id}>
                <Link
                  href={`/free-resources/${resource.slug}`}
                  className="block rounded-xl border border-border bg-card/50 p-5 transition hover:border-primary/40"
                >
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{TYPE_LABEL[resource.type]}</Badge>
                    {resource.category ? (
                      <span className="text-xs text-muted-foreground">
                        {resource.category}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-2 text-lg font-semibold">{resource.title}</h2>
                  {resource.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {resource.description}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {resource.downloadCount} downloads
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
