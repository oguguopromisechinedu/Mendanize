import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { getPublicSession } from "@/features/authentication/server"
import { NewProjectForm } from "@/features/community"
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"

export const metadata: Metadata = {
  title: "Share project",
  robots: { index: false },
}

export default async function Page() {
  const session = await getPublicSession()
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/community/projects/new")
  }

  const guides = isDatabaseConfigured()
    ? await getPrisma().guide.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true, title: true },
        orderBy: { title: "asc" },
        take: 100,
      })
    : []

  return (
    <PageShell
      title="Share project"
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Showcase", href: "/community/projects" },
        { label: "New" },
      ]}
    >
      <NewProjectForm guides={guides} />
    </PageShell>
  )
}
