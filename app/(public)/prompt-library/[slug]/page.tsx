import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { Badge } from "@/components/ui/badge"
import { getSession } from "@/features/authentication/server"
import { PromptItemActions } from "@/features/prompt-library/components/prompt-item-actions"
import { getPublishedPromptPackBySlug } from "@/services/ecosystem"

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const pack = await getPublishedPromptPackBySlug(slug)
  if (!pack) return { title: "Prompt pack not found" }
  return {
    title: pack.title,
    description: pack.description ?? `Prompt pack: ${pack.title}`,
  }
}

export default async function PromptPackDetailPage({ params }: PageProps) {
  const { slug } = await params
  const pack = await getPublishedPromptPackBySlug(slug)
  if (!pack) notFound()
  const session = await getSession()

  return (
    <PageShell
      title={pack.title}
      hideHeader
      width="wide"
      crumbs={[
        { label: "Prompt Library", href: "/prompt-library" },
        { label: pack.title },
      ]}
    >
      <article className="mx-auto max-w-3xl">
        <header className="mb-8">
          <div className="flex flex-wrap gap-2">
            {pack.featured ? <Badge variant="secondary">Featured</Badge> : null}
            {pack.premium ? <Badge>Premium</Badge> : null}
            {pack.category ? (
              <span className="text-xs text-muted-foreground">{pack.category}</span>
            ) : null}
          </div>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
            {pack.title}
          </h1>
          {pack.description ? (
            <p className="mt-4 text-lg text-muted-foreground">{pack.description}</p>
          ) : null}
          {pack.ratingCount > 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {pack.ratingAvg.toFixed(1)}★ · {pack.ratingCount} reviews
            </p>
          ) : null}
          {(pack.tags ?? []).length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {pack.tags.map((t) => (
                <Link
                  key={t}
                  href={`/prompt-library?tag=${encodeURIComponent(t)}`}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  #{t}
                </Link>
              ))}
            </div>
          ) : null}
        </header>

        {pack.premium && !session?.user?.id ? (
          <p className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
            Premium pack —{" "}
            <Link
              href={`/sign-in?callbackUrl=${encodeURIComponent(`/prompt-library/${pack.slug}`)}`}
              className="font-medium text-primary hover:underline"
            >
              sign in
            </Link>{" "}
            to unlock full prompts.
          </p>
        ) : null}

        <ul className="space-y-6">
          {pack.items.map((item, index) => {
            const locked = pack.premium && !session?.user?.id
            return (
              <li
                key={item.id}
                className="rounded-xl border border-border bg-card/40 p-5"
              >
                <h2 className="text-base font-semibold">
                  {index + 1}. {item.title}
                </h2>
                <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
                  {locked
                    ? `${item.prompt.slice(0, 120)}${item.prompt.length > 120 ? "…" : ""}`
                    : item.prompt}
                </pre>
                {!locked ? (
                  <PromptItemActions
                    title={item.title}
                    prompt={item.prompt}
                    signedIn={Boolean(session?.user?.id)}
                  />
                ) : null}
              </li>
            )
          })}
        </ul>
      </article>
    </PageShell>
  )
}
