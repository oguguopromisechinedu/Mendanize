"use client"

import Link from "next/link"

import type { IntegrationCard } from "@/services/admin/types"
import {
  AdminPageHeader,
  AdminPanel,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"

export function IntegrationsView({ items }: { items: IntegrationCard[] }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        title="AI & Integrations"
        description="Provider configuration and connection status from platform settings."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((card) => (
          <AdminPanel key={card.id} title={card.name}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {card.category}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge
                status={card.configured ? "CONFIGURED" : "MISSING"}
              />
              <StatusBadge status={card.enabled ? "ENABLED" : "OFF"} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{card.detail}</p>
            <Button asChild size="sm" variant="outline" className="mt-4">
              <Link href={card.settingsHref}>Open settings</Link>
            </Button>
          </AdminPanel>
        ))}
      </div>
    </div>
  )
}
