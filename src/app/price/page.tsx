"use client";

import { HeroSection } from "@/components/pricing/HeroSection";
import { PricingSection } from "@/components/pricing/PricingSection";
import { BenefitsSection } from "@/components/pricing/BenefitsSection";
import { ImportantSection } from "@/components/pricing/ImportantSection";
import { Footer } from "@/components/pricing/Footer";
import { LiveSocialProof } from "@/components/LiveSocialProof";
import { PriceExitIntentModal } from "@/components/pricing/PriceExitIntentModal";

export default function PricePage() {
  return (
    <main className="bg-surface font-space text-on-surface antialiased overflow-x-hidden">
      <LiveSocialProof />
      <PriceExitIntentModal />
      <HeroSection />
      
      <div id="formats" className="bg-surface py-24 px-8">
        <div className="max-w-screen-2xl mx-auto flex justify-center">
          <h2 className="font-headline font-extrabold text-6xl md:text-8xl tracking-tight uppercase">ФОРМАТИ</h2>
        </div>
      </div>

      <PricingSection />
      <BenefitsSection />
      <ImportantSection />
      <Footer />
    </main>
  );
}
