"use client";

import React, { useState } from "react";
import { StyleHero } from "./StyleHero";
import { StyleInsight } from "./StyleInsight";
import { StyleRoadmap } from "./StyleRoadmap";
import { StyleProgram } from "./StyleProgram";
import { StyleChoice } from "./StyleChoice";
import { StyleSpeaker } from "./StyleSpeaker";
import { StyleFinalCTA } from "./StyleFinalCTA";
import { StyleStickyCTA } from "./StyleStickyCTA";
import { StyleCheckoutModal } from "./StyleCheckoutModal";
import { Footer } from "@/components/Footer";

export function StyleLandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#FBF6EE] text-[#231815] relative overflow-hidden font-manrope selection:bg-[#D96B27] selection:text-white">
      {/* Warm Autumn Atmospheric Glow Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FCD9BD]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-[#F8C69D]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 -left-40 w-96 h-96 bg-[#FCD9BD]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-[#F5B47B]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Sections Stack */}
      <div className="relative z-10">
        <StyleHero onOpenModal={handleOpenModal} />
        <StyleInsight />
        <StyleRoadmap />
        <StyleProgram onOpenModal={handleOpenModal} />
        <StyleChoice />
        <StyleSpeaker onOpenModal={handleOpenModal} />
        <StyleFinalCTA onOpenModal={handleOpenModal} />
        <Footer />
      </div>

      {/* Floating Sticky CTA on Mobile */}
      <StyleStickyCTA onOpenModal={handleOpenModal} />

      {/* Registration Modal (Free for 100 spots, 79 taken) */}
      <StyleCheckoutModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tariffName="3-денне навчання: Твій стиль блогу (Безкоштовно)"
        amount={0}
      />
    </main>
  );
}
