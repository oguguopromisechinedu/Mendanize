import { Suspense } from "react"

import { NewsletterManageClient } from "@/features/newsletter/components/newsletter-manage-client"
import { PageShell } from "@/components/layout/PageShell"

export default function NewsletterUnsubscribePage() {
  return (
    <PageShell
      title="Newsletter preferences"
      hideHeader
      crumbs={[
        { label: "Newsletter", href: "/newsletter" },
        { label: "Manage" },
      ]}
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <NewsletterManageClient />
      </Suspense>
    </PageShell>
  )
}
