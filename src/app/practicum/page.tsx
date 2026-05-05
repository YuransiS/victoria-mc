import React from "react";
import styles from "./page.module.css";
import { PracticumHero } from "@/components/practicum/PracticumHero";
import { PracticumIdea } from "@/components/practicum/PracticumIdea";
import { PracticumFormat } from "@/components/practicum/PracticumFormat";
import { PracticumProgram } from "@/components/practicum/PracticumProgram";
import { PracticumResults } from "@/components/practicum/PracticumResults";
import { PracticumRegistration } from "@/components/practicum/PracticumRegistration";
import { PracticumExpert } from "@/components/practicum/PracticumExpert";
import { Footer } from "@/components/Footer";
import { CinematicEffects } from "@/components/CinematicEffects";
import { LiveSocialProof } from "@/components/LiveSocialProof";

export const metadata = {
  title: "Практикум СТОРІЗ ЯКІ ПРОДАЮТЬ | Віка",
  description: "7-денний практикум зі створення сторіз які працюють на тебе - навіть якщо ти не знаєш що туди постити",
};

export default function PracticumPage() {
  return (
    <main className={styles.main}>
      <CinematicEffects />
      <LiveSocialProof variant="booking" />
      
      <PracticumHero />
      <PracticumIdea />
      <PracticumFormat />
      <PracticumExpert />
      <PracticumProgram />
      <PracticumResults />
      <PracticumRegistration />
      
      <Footer />
    </main>
  );
}
