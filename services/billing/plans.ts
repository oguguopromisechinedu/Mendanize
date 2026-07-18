/**
 * Public pricing catalog — MES-021.
 * Marketing names: Starter / Professional / Enterprise.
 * Persistence uses PlanTier FREE / PRO / TEAM.
 */

import type { BillingPlanId, PricingPlanCatalogItem, PlanTierValue } from "./types";

export const PLAN_ID_TO_TIER: Record<BillingPlanId, PlanTierValue> = {
  starter: "FREE",
  professional: "PRO",
  enterprise: "TEAM",
};

export const TIER_TO_PLAN_ID: Record<PlanTierValue, BillingPlanId> = {
  FREE: "starter",
  PRO: "professional",
  TEAM: "enterprise",
};

export const TIER_LABELS: Record<PlanTierValue, string> = {
  FREE: "Starter",
  PRO: "Professional",
  TEAM: "Enterprise",
};

export function getPricingCatalog(): PricingPlanCatalogItem[] {
  return [
    {
      id: "starter",
      plan: "FREE",
      name: "Starter",
      price: 0,
      priceLabel: "$0",
      description:
        "Full access to Articles and Learning Guides. Soft limits on dashboard assistants.",
      features: [
        "Unlimited Articles & Learning Guides",
        "AI Tools directory (core)",
        "Ask Mendanize AI — starter volume",
        "Community support",
      ],
      limits: {
        askVolumeNote: "Starter Ask volume",
        analyticsNote: "Basic analytics",
        toolsNote: "Core AI Tools directory",
      },
      stripePriceId: null,
    },
    {
      id: "professional",
      plan: "PRO",
      name: "Professional",
      price: 29,
      priceLabel: "$29",
      description:
        "Higher Ask volume and dashboard tooling for growing learners and creators.",
      popular: true,
      features: [
        "Everything in Starter",
        "Higher Ask Mendanize AI volume",
        "Advanced analytics preview",
        "Priority support",
      ],
      limits: {
        askVolumeNote: "Professional Ask volume",
        analyticsNote: "Advanced analytics",
        toolsNote: "Premium AI Tools features",
      },
      stripePriceId: process.env.STRIPE_PRICE_PRO?.trim() || null,
    },
    {
      id: "enterprise",
      plan: "TEAM",
      name: "Enterprise",
      price: 79,
      priceLabel: "$79",
      description:
        "Team-scale Ask capacity and premium directory features. Custom contracts later.",
      features: [
        "Everything in Professional",
        "Enterprise Ask volume",
        "Premium AI Tools directory features",
        "Shared workspace seats (planned)",
      ],
      limits: {
        askVolumeNote: "Enterprise Ask volume",
        analyticsNote: "Full analytics suite",
        toolsNote: "Premium AI Tools + seats",
      },
      stripePriceId: process.env.STRIPE_PRICE_TEAM?.trim() || null,
    },
  ];
}

export function getPlanById(
  id: BillingPlanId,
): PricingPlanCatalogItem | undefined {
  return getPricingCatalog().find((p) => p.id === id);
}

export function resolvePlanFromStripePriceId(
  priceId: string | null | undefined,
): PlanTierValue {
  if (!priceId) return "FREE";
  const pro = process.env.STRIPE_PRICE_PRO?.trim();
  const team = process.env.STRIPE_PRICE_TEAM?.trim();
  if (pro && priceId === pro) return "PRO";
  if (team && priceId === team) return "TEAM";
  return "FREE";
}
