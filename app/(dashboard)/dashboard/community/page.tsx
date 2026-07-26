import type { Metadata } from "next"

import { CommunityAdminView } from "@/features/community"
import {
  listCategories,
  listCommunityModerators,
  listOpenReports,
  listShowcaseProjects,
} from "@/services/community"

export const metadata: Metadata = {
  title: "Community",
  robots: { index: false },
}

export default async function Page() {
  const [reports, moderators, categories, featured] = await Promise.all([
    listOpenReports(),
    listCommunityModerators(),
    listCategories(),
    listShowcaseProjects({ featuredOnly: true, pageSize: 50 }),
  ])

  return (
    <CommunityAdminView
      reports={reports}
      moderators={moderators}
      categories={categories}
      featuredProjects={featured.items}
    />
  )
}
