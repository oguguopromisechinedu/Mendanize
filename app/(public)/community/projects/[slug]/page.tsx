import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/layout/PageShell"
import { getPublicSession } from "@/features/authentication/server"
import { ProjectDetailView } from "@/features/community"
import { getShowcaseProject } from "@/services/community"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getShowcaseProject(slug)
  return { title: project?.title ?? "Project" }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getShowcaseProject(slug)
  if (!project) notFound()
  const session = await getPublicSession()

  return (
    <PageShell
      title={project.title}
      hideHeader
      crumbs={[
        { label: "Community", href: "/community" },
        { label: "Showcase", href: "/community/projects" },
        { label: project.title },
      ]}
    >
      <ProjectDetailView
        project={project}
        signedIn={Boolean(session?.user?.id)}
      />
    </PageShell>
  )
}
