import MarketingLayout from "@/components/layout/MarketingLayout";
import CTA from "@/components/sections/CTA";
import DashboardShowcase from "@/components/sections/DashboardShowcase";
import Features from "@/components/sections/Features";
import FAQ from "@/components/sections/FAQ";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import PricingPreview from "@/components/sections/PricingPreview";
import SocialProof from "@/components/sections/SocialProof";
import Testimonials from "@/components/sections/Testimonials";
import TrustStrip from "@/components/sections/TrustStrip";

export default function Home() {
  return (
    <MarketingLayout>
      <Hero />
      <TrustStrip />
      <SocialProof />
      <Features />
      <HowItWorks />
      <DashboardShowcase />
      <Testimonials />
      <FAQ />
      <PricingPreview />
      <CTA />
    </MarketingLayout>
  );
}
