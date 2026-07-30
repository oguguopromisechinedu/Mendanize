import type { Metadata } from "next"

import { OrgPlansAdminView } from "@/features/organization-licensing"
import {
  listOrganizationPlans,
  listOrganizationSubscriptionsAdmin,
} from "@/services/organization-licensing"

export const metadata: Metadata = {
  title: "Organization plans",
  robots: { index: false },
}

export default async function Page() {
  const [plans, subscriptions] = await Promise.all([
    listOrganizationPlans(),
    listOrganizationSubscriptionsAdmin(),
  ])
  return <OrgPlansAdminView plans={plans} subscriptions={subscriptions} />
}
