import { z } from "zod";

export const checkoutPlanSchema = z.object({
  planId: z.enum(["professional", "enterprise"]),
});

export type CheckoutPlanInput = z.infer<typeof checkoutPlanSchema>;
