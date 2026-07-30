import { loadPricingCatalog } from "@/features/billing/server";
import type { Metadata } from "next"

import { PricingPageView } from "@/features/billing"
import {
  CmsCompanyPage,
  generateCmsPageMetadata,
} from "@/features/static-pages/server"
import { getPublishedPageBySlug } from "@/services/admin"

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getPublishedPageBySlug("pricing")
  if (cms) return generateCmsPageMetadata("pricing")
  return {
    title: "Pricing",
    description:
      "Mendanize plans — Starter, Professional, and Enterprise. Articles and Learning Guides stay free.",
  }
}

export default async function Page() {
  const cms = await getPublishedPageBySlug("pricing")
  if (cms) return <CmsCompanyPage slug="pricing" />

  const plans = await loadPricingCatalog()
  return <PricingPageView plans={plans} />
}
