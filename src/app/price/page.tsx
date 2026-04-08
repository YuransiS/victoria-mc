import { Metadata } from "next";
import { HeroSection } from "@/components/pricing/HeroSection";
import { PricingSection } from "@/components/pricing/PricingSection";

export const metadata: Metadata = {
  title: "Тарифи | ВІКТОРІЯ МЕЩЕРЯКОВА",
  description: "Оберіть свій формат навчання. Бронь місця за спеціальною ціною.",
};

export default function PricePage() {
  return (
    <main className="min-h-screen bg-black">
      <HeroSection />
      <PricingSection />
    </main>
  );
}
