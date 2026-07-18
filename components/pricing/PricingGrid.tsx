"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/pricing/plans";
import { routes, styles } from "@/lib/design";

export default function PricingGrid() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {pricingPlans.map((plan, index) => (
        <motion.article
          key={plan.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, delay: index * 0.08 }}
          className={`rounded-2xl border border-white/10 p-8 shadow-xl shadow-black/20 backdrop-blur-xl ${
            plan.popular
              ? "bg-white/10 ring-1 ring-cyan-400/20"
              : "bg-white/5"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                {plan.name}
              </p>
              <p className="mt-2 text-4xl font-semibold text-white">
                {plan.priceLabel}
                {plan.price > 0 ? (
                  <span className="text-base font-normal text-slate-500">
                    /mo
                  </span>
                ) : null}
              </p>
            </div>
            {plan.popular ? (
              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
                Popular
              </span>
            ) : null}
          </div>

          <p className="mt-6 text-sm leading-7 text-slate-400">
            {plan.description}
          </p>

          <ul className="mt-8 space-y-4 text-sm text-slate-300">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <span className="mt-1.5 inline-flex h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className={`mt-10 w-full rounded-full py-4 ${
              plan.popular ? styles.primaryBtn : ""
            }`}
            variant={plan.popular ? "default" : "outline"}
            asChild
          >
            <Link
              href={
                plan.id === "free"
                  ? routes.signUp
                  : routes.billing
              }
            >
              {plan.id === "free" ? "Start free" : `Get ${plan.name}`}
            </Link>
          </Button>

          {plan.stripePriceId ? (
            <p className="mt-3 text-center text-xs text-slate-600">
              Stripe-ready
            </p>
          ) : null}
        </motion.article>
      ))}
    </div>
  );
}
