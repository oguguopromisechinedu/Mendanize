import type { Metadata } from "next"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  listFreeResourcesAdmin,
  listGlossaryTermsAdmin,
} from "@/services/platform"

export const metadata: Metadata = {
  title: "Resources & Glossary",
  robots: { index: false },
}

export default async function DashboardResourcesPage() {
  const [resources, terms] = await Promise.all([
    listFreeResourcesAdmin().catch(() => []),
    listGlossaryTermsAdmin().catch(() => []),
  ])

  return (
    <div className="space-y-10 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Public resources</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage free downloads and glossary terms shown on the public site.
        </p>
      </header>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Free resources</h2>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/resources/new">New resource</Link>
          </Button>
        </div>
        {resources.length === 0 ? (
          <p className="text-sm text-muted-foreground">No resources yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {resources.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">/{r.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{r.type}</Badge>
                  <Badge variant="outline">{r.status}</Badge>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/dashboard/resources/${r.id}`}>Edit</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Glossary</h2>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/glossary/new">New term</Link>
          </Button>
        </div>
        {terms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No terms yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {terms.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{t.term}</p>
                  <p className="text-xs text-muted-foreground">/{t.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{t.status}</Badge>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/dashboard/glossary/${t.id}`}>Edit</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
