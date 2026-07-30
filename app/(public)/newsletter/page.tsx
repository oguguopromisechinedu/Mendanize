import type { Metadata } from "next"
import Link from "next/link"

import { PageShell } from "@/components/layout/PageShell"
import { NewsletterSubscribeForm } from "@/features/newsletter/components/newsletter-subscribe-form"
import { listNewsletterArchive } from "@/services/platform"

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Subscribe to Mendanize learning tips, browse the archive, and manage preferences.",
}

export default async function NewsletterPage() {
  const archive = await listNewsletterArchive().catch(() => [])

  return (
    <PageShell
      title="Newsletter"
      hideHeader
      width="wide"
      crumbs={[{ label: "Newsletter" }]}
    >
      <div className="mx-auto max-w-3xl">
        <header className="mb-10">
          <p className="type-caption text-primary">Newsletter</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight">
            Learning tips in your inbox
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Practical AI guides, tool picks, and course updates—about once a
            week. Unsubscribe anytime.
          </p>
        </header>

        <NewsletterSubscribeForm />

        <section className="mt-14">
          <h2 className="text-xl font-semibold">Archive</h2>
          {archive.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No sent newsletters yet. Subscribe to be first in line.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {archive.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/newsletter/archive/${item.id}`}
                    className="block rounded-lg border border-border px-4 py-3 transition hover:border-primary/40"
                  >
                    <p className="font-medium text-foreground">{item.subject}</p>
                    {item.previewText ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.previewText}
                      </p>
                    ) : null}
                    {item.sentAt ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(item.sentAt).toLocaleDateString()}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-10 text-sm text-muted-foreground">
          Prefer managing preferences? Use the link in any email, or visit{" "}
          <Link href="/newsletter/unsubscribe" className="text-primary hover:underline">
            unsubscribe
          </Link>
          .
        </p>
      </div>
    </PageShell>
  )
}
