/**
 * Billing Shared Service types — MES-021.
 */

export type PlanTierValue = "FREE" | "PRO" | "TEAM";

export type BillingPlanId = "starter" | "professional" | "enterprise";

export type PricingPlanCatalogItem = {
  id: BillingPlanId;
  /** Internal PlanTier enum */
  plan: PlanTierValue;
  /** Public marketing label (Starter / Professional / Enterprise) */
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
  popular?: boolean;
  stripePriceId: string | null;
  /** Dashboard product limits — gating later; catalog only here */
  limits: {
    askVolumeNote: string;
    analyticsNote: string;
    toolsNote: string;
  };
};

export type SubscriptionRecord = {
  id: string;
  userId: string;
  plan: PlanTierValue;
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  updatedAt: string;
};

export type InvoiceSummary = {
  id: string;
  number: string | null;
  status: string | null;
  amountDue: number;
  currency: string;
  created: string;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
};

export type PaymentMethodSummary = {
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
} | null;

export type BillingDashboard = {
  subscription: SubscriptionRecord;
  planName: string;
  stripeConfigured: boolean;
  paymentMethod: PaymentMethodSummary;
  invoices: InvoiceSummary[];
  canUpgrade: boolean;
  canManage: boolean;
};

export type CheckoutResult = {
  url: string;
};

export type PortalResult = {
  url: string;
};
