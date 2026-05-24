import MarketingLayout from "@/components/layout/MarketingLayout";
import PricingGrid from "@/components/pricing/PricingGrid";
import { SectionHeader } from "@/components/ui/section-header";
import { styles } from "@/lib/design";

export default function PricingPage() {
  return (
    <MarketingLayout>
      <div className={`${styles.container} ${styles.section}`}>
        <SectionHeader
          eyebrow="Pricing"
          title="Plans made for creators, teams, and growing businesses"
          description="Start free, scale with Pro, or collaborate on Team. Stripe-ready when you connect billing."
        />
        <div className="mt-14">
          <PricingGrid />
        </div>
        <p className="mt-12 text-center text-sm text-slate-500">
          Usage limits enforced per plan. Connect Stripe via STRIPE_PRICE_PRO and
          STRIPE_PRICE_TEAM environment variables.
        </p>
      </div>
    </MarketingLayout>
  );
}
