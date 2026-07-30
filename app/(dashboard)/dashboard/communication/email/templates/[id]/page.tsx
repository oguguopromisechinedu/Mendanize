import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { EmsTemplateEditor } from "@/features/email-management"
import {
  getAdminSession,
  isAdminRoleKey,
} from "@/features/authentication/server"
import {
  getEmsTemplate,
  listEmsCategories,
  listEmsSenders,
  listEmsVariables,
} from "@/services/ems"

export const metadata: Metadata = {
  title: "Edit email template",
  robots: { index: false },
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getAdminSession()
  const [template, categories, senders, variables] = await Promise.all([
    getEmsTemplate(id),
    listEmsCategories(),
    listEmsSenders(),
    listEmsVariables(),
  ])
  if (!template) notFound()

  const role = session?.admin.roleKey ?? ""
  const canPublish = isAdminRoleKey(role)
  const canTest = isAdminRoleKey(role)

  const samplePayload: Record<string, unknown> = {}
  for (const v of variables) {
    samplePayload[v.key] = v.sampleValue ?? `sample_${v.key}`
  }

  return (
    <EmsTemplateEditor
      template={{
        id: template.id,
        key: template.key,
        name: template.name,
        subject: template.subject,
        bodyHtml: template.bodyHtml,
        bodyText: template.bodyText,
        description: template.description,
        categoryId: template.categoryId,
        senderId: template.senderId,
        replyTo: template.replyTo,
        status: template.status,
        enabled: template.enabled,
      }}
      categories={categories.map((c) => ({ id: c.id, label: c.name }))}
      senders={senders
        .filter((s) => s.status === "VERIFIED" && s.enabled)
        .map((s) => ({
          id: s.id,
          label: `${s.displayName} <${s.address}>`,
        }))}
      versions={template.versions.map((v) => ({
        id: v.id,
        version: v.version,
        subject: v.subject,
        createdAt: v.createdAt,
      }))}
      samplePayload={samplePayload}
      canPublish={canPublish}
      canTest={canTest}
    />
  )
}
