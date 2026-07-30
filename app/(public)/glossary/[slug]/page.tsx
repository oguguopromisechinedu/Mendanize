import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import {
  getPublishedGlossaryTermBySlug,
  listPublishedGlossaryTerms,
} from "@/services/platform"

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const term = await getPublishedGlossaryTermBySlug(slug)
  if (!term) return { title: "Term not found" }
  return {
    title: term.seoTitle || term.term,
    description: term.seoDescription || term.definition.slice(0, 160),
  }
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const { slug } = await params
  const term = await getPublishedGlossaryTermBySlug(slug)
  if (!term) notFound()

  const related =
    term.relatedTermIds.length > 0
      ? (
          await listPublishedGlossaryTerms()
        ).filter((t) => term.relatedTermIds.includes(t.id))
      : (
          await listPublishedGlossaryTerms({
            category: term.category ?? undefined,
          })
        )
          .filter((t) => t.id !== term.id)
          .slice(0, 5)

  return (
    <PageShell
      title={term.term}
      hideHeader
      width="wide"
      crumbs={[
        { label: "Glossary", href: "/glossary" },
        { label: term.term },
      ]}
    >
      <article className="mx-auto max-w-3xl">
        {term.category ? (
          <p className="type-caption text-primary">{term.category}</p>
        ) : null}
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight">
          {term.term}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-foreground">
          {term.definition}
        </p>

        {related.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-lg font-semibold">Related terms</h2>
            <ul className="mt-3 space-y-2">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/glossary/${r.slug}`}
                    className="text-primary hover:underline"
                  >
                    {r.term}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </PageShell>
  )
}
