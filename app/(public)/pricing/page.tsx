import type { Metadata } from "next";

import { loadPricingCatalog, PricingPageView } from "@/features/billing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Mendanize plans — Starter, Professional, and Enterprise. Articles and Learning Guides stay free.",
};

export default async function Page() {
  const plans = await loadPricingCatalog();
  return <PricingPageView plans={plans} />;
}
