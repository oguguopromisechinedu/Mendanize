import { NewsletterListView } from "@/features/admin-modules/components/newsletter-list-view"
import type { ListResult, NewsletterCampaignRecord } from "@/services/admin/types"
import { EmsNav } from "./ems-nav"

export function EmsNewsletterView({
  initial,
}: {
  initial: ListResult<NewsletterCampaignRecord>
}) {
  return (
    <div>
      <div className="mx-auto max-w-7xl">
        <EmsNav />
      </div>
      <NewsletterListView initial={initial} />
    </div>
  )
}
