export type PlanId = "free" | "pro" | "team";

export type PricingPlan = {
  id: PlanId;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
  popular?: boolean;
  /** Stripe price ID — set when Stripe is connected */
  stripePriceId?: string;
  limits: {
    generationsPerMonth: number;
    seoReports: number;
    teamSeats: number;
  };
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "$0",
    description: "Starter tools for solo creators exploring AI blogging.",
    features: [
      "10 AI generations / month",
      "Basic SEO suggestions",
      "Markdown export",
      "Community support",
    ],
    limits: { generationsPerMonth: 10, seoReports: 5, teamSeats: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    priceLabel: "$29",
    description: "The most popular plan for growing brands and creators.",
    features: [
      "Unlimited AI generations",
      "Advanced SEO insights",
      "Monetization playbooks",
      "Priority support",
    ],
    popular: true,
    stripePriceId: process.env.STRIPE_PRICE_PRO,
    limits: { generationsPerMonth: -1, seoReports: -1, teamSeats: 1 },
  },
  {
    id: "team",
    name: "Team",
    price: 79,
    priceLabel: "$79",
    description: "Scale publishing across multiple authors and campaigns.",
    features: [
      "Everything in Pro",
      "Shared editorial workspace",
      "Collaboration & approvals",
      "Advanced analytics",
    ],
    stripePriceId: process.env.STRIPE_PRICE_TEAM,
    limits: { generationsPerMonth: -1, seoReports: -1, teamSeats: 10 },
  },
];

export function getPlanById(id: PlanId): PricingPlan | undefined {
  return pricingPlans.find((p) => p.id === id);
}
