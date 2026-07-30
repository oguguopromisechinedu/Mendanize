import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { getNewsletterArchiveItem } from "@/services/platform"

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const item = await getNewsletterArchiveItem(id)
  if (!item) return { title: "Newsletter not found" }
  return {
    title: item.subject,
    description: item.previewText ?? undefined,
  }
}

export default async function NewsletterArchiveItemPage({ params }: PageProps) {
  const { id } = await params
  const item = await getNewsletterArchiveItem(id)
  if (!item) notFound()

  return (
    <PageShell
      title={item.subject}
      hideHeader
      width="wide"
      crumbs={[
        { label: "Newsletter", href: "/newsletter" },
        { label: item.subject },
      ]}
    >
      <article className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="type-caption text-primary">Newsletter archive</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight">
            {item.subject}
          </h1>
          {item.sentAt ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Sent {new Date(item.sentAt).toLocaleDateString()}
            </p>
          ) : null}
        </header>
        <div
          className="prose prose-neutral max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
        />
      </article>
    </PageShell>
  )
}
