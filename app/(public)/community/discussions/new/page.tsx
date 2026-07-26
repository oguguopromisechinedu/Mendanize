import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { getPublicSession } from "@/features/authentication/server"
import { NewDiscussionForm } from "@/features/community"
import { listCategories } from "@/services/community"

export const metadata: Metadata = {
  title: "New discussion",
  robots: { index: false },
}

export default async function Page() {
  const session = await getPublicSession()
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/community/discussions/new")
  }
  const categories = await listCategories()
  return (
    <PageShell
      title="New discussion"
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Discussions", href: "/community/discussions" },
        { label: "New" },
      ]}
    >
      <NewDiscussionForm categories={categories} />
    </PageShell>
  )
}
