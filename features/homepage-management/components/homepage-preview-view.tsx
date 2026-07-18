import Link from "next/link"

import { HomepageView } from "@/features/homepage-public"
import type { HomepageContent } from "@/features/homepage-public/types/types"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/features/admin-dashboard"

export function HomepagePreviewView({
  content,
  status,
}: {
  content: HomepageContent
  status: string
}) {
  return (
    <div className="space-y-4">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 pt-4">
        <div className="flex items-center gap-2">
          <StatusBadge status={status.toLowerCase()} />
          <span className="text-sm text-muted-foreground">
            Admin preview (draft or published CMS payload)
          </span>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/homepage">Back to CMS</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/" target="_blank">
              Open public /
            </Link>
          </Button>
        </div>
      </div>
      <HomepageView content={content} />
    </div>
  )
}
