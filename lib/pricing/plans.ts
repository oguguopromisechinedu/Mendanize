/**
 * @deprecated Prefer `getPricingCatalog()` from `@/services/billing`.
 * Re-exports for older importers (PricingGrid, etc.).
 */

import {
  getPricingCatalog,
  type BillingPlanId,
  type PricingPlanCatalogItem,
} from "@/services/billing";

export type PlanId = "free" | "pro" | "team";

const ID_MAP: Record<BillingPlanId, PlanId> = {
  starter: "free",
  professional: "pro",
  enterprise: "team",
};

export type PricingPlan = {
  id: PlanId;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
  popular?: boolean;
  stripePriceId?: string;
  limits: {
    generationsPerMonth: number;
    seoReports: number;
    teamSeats: number;
  };
};

function toLegacy(item: PricingPlanCatalogItem): PricingPlan {
  return {
    id: ID_MAP[item.id],
    name: item.name,
    price: item.price,
    priceLabel: item.priceLabel,
    description: item.description,
    features: item.features,
    popular: item.popular,
    stripePriceId: item.stripePriceId ?? undefined,
    limits: {
      generationsPerMonth: item.plan === "FREE" ? 10 : -1,
      seoReports: item.plan === "FREE" ? 5 : -1,
      teamSeats: item.plan === "TEAM" ? 10 : 1,
    },
  };
}

export const pricingPlans: PricingPlan[] = getPricingCatalog().map(toLegacy);

export function getPlanById(id: PlanId): PricingPlan | undefined {
  return pricingPlans.find((p) => p.id === id);
}
