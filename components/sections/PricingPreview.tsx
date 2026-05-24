"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import PricingGrid from "@/components/pricing/PricingGrid";
import { routes, styles } from "@/lib/design";

export default function PricingPreview() {
  return (
    <section id="pricing" className="bg-black px-6 py-24 text-slate-100 sm:px-10">
      <div className={styles.container}>
        <SectionHeader
          eyebrow="Pricing"
          title="Plans made for creators, teams, and growing businesses"
          description="Choose the right growth package and start building your blog system with AI support."
        />
        <div className="mt-14">
          <PricingGrid />
        </div>
        <p className="mt-10 text-center">
          <Link
            href={routes.pricing}
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            Compare all plans →
          </Link>
        </p>
      </div>
    </section>
  );
}
