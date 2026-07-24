import React from "react";
import styles from "../page.module.css";
import { Block1Hero } from "@/components/blocks/Block1Hero";
import { Block3Audience } from "@/components/blocks/Block3Audience";
import { Block2Learning } from "@/components/blocks/Block2Learning";
import { Block5Expert } from "@/components/blocks/Block5Expert";
import { BlockCases } from "@/components/blocks/BlockCases";
import { BlockReviews } from "@/components/blocks/BlockReviews";
import { Block4Statement } from "@/components/blocks/Block4Statement";
import { BlockBonusTimer } from "@/components/blocks/BlockBonusTimer";
import { BlockGuarantee } from "@/components/blocks/BlockGuarantee";
import { Block6Registration } from "@/components/blocks/Block6Registration";
import { Block7FAQ } from "@/components/blocks/Block7FAQ";
import { Footer } from "@/components/Footer";
import { CinematicEffects } from "@/components/CinematicEffects";
import { LiveSocialProof } from "@/components/LiveSocialProof";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";

export default function Page249() {
  return (
    <main className={styles.main}>
      <CinematicEffects />
      <LiveSocialProof />
      <ExitIntentModal />
      <StickyMobileCTA />
      <Block1Hero />
      <BlockBonusTimer />

      <Block3Audience />
      <Block2Learning />
      <Block5Expert />
      <BlockCases />
      <BlockReviews />
      <Block4Statement />
      <BlockGuarantee />
      <Block6Registration />
      <Block7FAQ />
      <Footer />
    </main>
  );
}
