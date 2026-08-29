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
    <main className="min-h-screen bg-[#ACF2C6] text-[#142117] relative overflow-hidden font-manrope selection:bg-[#18B66F] selection:text-white">
      {/* Background Soft Glow Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#7EDEAA]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Sections Stack */}
      <div className="relative z-10">
        <StyleHero onOpenModal={handleOpenModal} />
        <StyleInsight />
        <StyleRoadmap />
        <StyleProgram onOpenModal={handleOpenModal} />
        <StyleChoice />
        <StyleSpeaker />
        <StyleFinalCTA onOpenModal={handleOpenModal} />
        <Footer />
      </div>

      {/* Floating Sticky CTA on Mobile */}
      <StyleStickyCTA onOpenModal={handleOpenModal} />

      {/* Registration & WayForPay Checkout Modal */}
      <StyleCheckoutModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tariffName="3-денне навчання: Твій стиль блогу"
        amount={9}
      />
    </main>
  );
}
