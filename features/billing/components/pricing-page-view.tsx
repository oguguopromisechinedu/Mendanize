"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/design";
import type { PricingPlanCatalogItem } from "@/services/billing";
import { BILLING_PATHS } from "../constants/constants";

export function PricingPageView({
  plans,
}: {
  plans: PricingPlanCatalogItem[];
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="type-caption text-primary">Pricing</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-foreground md:text-5xl">
          Plans that never gate learning content
        </h1>
        <p className="mt-4 text-muted-foreground">
          Articles and Learning Guides stay free. Subscriptions unlock higher Ask
          volume and dashboard tooling — Starter, Professional, Enterprise.
        </p>
      </motion.header>

      <div className="mt-14 grid gap-8 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.article
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className={`flex flex-col border-t border-border pt-6 ${
              plan.popular ? "border-t-primary" : ""
            }`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                {plan.name}
              </h2>
              {plan.popular ? (
                <span className="text-xs font-medium uppercase tracking-wide text-primary">
                  Popular
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {plan.priceLabel}
              {plan.price > 0 ? (
                <span className="text-base font-normal text-muted-foreground">
                  /mo
                </span>
              ) : null}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {plan.description}
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-foreground/90">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              className="mt-8 w-full"
              variant={plan.popular ? "default" : "outline"}
              asChild
            >
              <Link
                href={
                  plan.id === "starter"
                    ? routes.signUp
                    : BILLING_PATHS.dashboard
                }
              >
                {plan.id === "starter" ? "Start free" : `Choose ${plan.name}`}
              </Link>
            </Button>
          </motion.article>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-muted-foreground">
        Checkout runs from the dashboard billing page once you are signed in.
        Core educational content is never paywalled.
      </p>
    </div>
  );
}
