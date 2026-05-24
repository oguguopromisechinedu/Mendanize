import type { PlanId } from "@/lib/pricing/plans";
import { getPlanById } from "@/lib/pricing/plans";

export function getGenerationLimit(planId: PlanId): number {
  const plan = getPlanById(planId);
  return plan?.limits.generationsPerMonth ?? 10;
}

export function canGenerate(
  planId: PlanId,
  currentCount: number
): { allowed: boolean; limit: number } {
  const limit = getGenerationLimit(planId);
  if (limit < 0) return { allowed: true, limit: -1 };
  return { allowed: currentCount < limit, limit };
}
