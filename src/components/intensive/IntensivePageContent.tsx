"use client";

import React, { useState } from "react";
import { IntensiveHero } from "./IntensiveHero";
import { IntensiveBonuses } from "./IntensiveBonuses";
import { IntensiveAudience } from "./IntensiveAudience";
import { IntensiveNotForYou } from "./IntensiveNotForYou";
import { IntensiveTransformation } from "./IntensiveTransformation";
import { IntensiveExpert } from "./IntensiveExpert";
import { IntensiveCurriculum } from "./IntensiveCurriculum";
import { IntensiveCasesReviews } from "./IntensiveCasesReviews";
import { IntensiveFormat } from "./IntensiveFormat";
import { IntensiveWhyPrice } from "./IntensiveWhyPrice";
import { IntensiveGuarantee } from "./IntensiveGuarantee";
import { IntensiveFAQ } from "./IntensiveFAQ";
import { IntensiveFinalCTA } from "./IntensiveFinalCTA";
import { IntensiveCheckoutModal } from "./IntensiveCheckoutModal";
import { IntensiveStickyCTA } from "./IntensiveStickyCTA";
import { Footer } from "@/components/Footer";

export function IntensivePageContent() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const openCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
  };

  return (
    <main className="bg-[#FAF6EE] text-[#2B0813] min-h-screen relative overflow-x-hidden selection:bg-[#451220] selection:text-[#FAF6EE]">
      {/* 1. HERO */}
      <IntensiveHero onOpenCheckout={openCheckout} />

      {/* 1.1. BONUSES WITH TIMER */}
      <IntensiveBonuses onOpenCheckout={openCheckout} />

      {/* 2. FOR YOU IF */}
      <IntensiveAudience onOpenCheckout={openCheckout} />

      {/* 3.1. NOT FOR YOU */}
      <IntensiveNotForYou />

      {/* 3. WHAT CHANGES AFTER 4 LESSONS */}
      <IntensiveTransformation onOpenCheckout={openCheckout} />

      {/* 4. AUTHOR / EXPERT */}
      <IntensiveExpert onOpenCheckout={openCheckout} />

      {/* 5. CURRICULUM - 4 LESSONS OF 20 MIN */}
      <IntensiveCurriculum onOpenCheckout={openCheckout} />

      {/* 6. CASES & REVIEWS */}
      <IntensiveCasesReviews onOpenCheckout={openCheckout} />

      {/* 7. HOW IT WORKS & WHAT YOU GET */}
      <IntensiveFormat />

      {/* 8. WHY THIS PRICE */}
      <IntensiveWhyPrice onOpenCheckout={openCheckout} />

      {/* 9. GUARANTEE */}
      <IntensiveGuarantee />

      {/* 10. FAQ */}
      <IntensiveFAQ />

      {/* 11. FINAL CTA & EMBEDDED FORM */}
      <IntensiveFinalCTA onOpenCheckout={openCheckout} />

      {/* STICKY MOBILE CTA */}
      <IntensiveStickyCTA onOpenCheckout={openCheckout} />

      {/* CHECKOUT MODAL */}
      <IntensiveCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
        tariffName="Інтенсив: 5 лайків"
        amount={9}
      />

      <Footer />
    </main>
  );
}
