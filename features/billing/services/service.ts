import {
  getBillingDashboard,
  getPricingCatalog,
  getSubscriptionForUser,
} from "@/services/billing";

export async function loadPricingCatalog() {
  return getPricingCatalog();
}

export async function loadBillingDashboard(userId: string) {
  return getBillingDashboard(userId);
}

export async function loadSubscription(userId: string) {
  return getSubscriptionForUser(userId);
}
