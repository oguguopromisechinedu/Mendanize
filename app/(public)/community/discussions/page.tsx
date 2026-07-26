import type { Metadata } from "next"

import { PageShell } from "@/components/layout/PageShell"
import { getPublicSession } from "@/features/authentication/server"
import { DiscussionListView } from "@/features/community"
import { listCategories, listDiscussions } from "@/services/community"

export const metadata: Metadata = {
  title: "Discussions",
  description: "Community discussions on Mendanize.",
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const categorySlug =
    typeof raw.category === "string" ? raw.category : undefined
  const sort =
    raw.sort === "popular" || raw.sort === "active" ? raw.sort : "latest"
  const [session, categories, { items, total }] = await Promise.all([
    getPublicSession(),
    listCategories(),
    listDiscussions({ categorySlug, sort }),
  ])

  return (
    <PageShell
      title="Discussions"
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Discussions" },
      ]}
    >
      <DiscussionListView
        items={items}
        total={total}
        categories={categories}
        signedIn={Boolean(session?.user?.id)}
        categorySlug={categorySlug}
        sort={sort}
      />
    </PageShell>
  )
}
