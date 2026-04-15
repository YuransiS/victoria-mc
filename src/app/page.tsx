import React from "react";
import styles from "./page.module.css";
import { Block1Hero } from "@/components/blocks/Block1Hero";
import { Block1Features } from "@/components/blocks/Block1Features";
import { Block3Audience } from "@/components/blocks/Block3Audience";
import { Block2Learning } from "@/components/blocks/Block2Learning";
import { Block5Expert } from "@/components/blocks/Block5Expert";
import { Block4Statement } from "@/components/blocks/Block4Statement";
import { Block6Registration } from "@/components/blocks/Block6Registration";
import { Block7FAQ } from "@/components/blocks/Block7FAQ";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className={styles.main}>
      <Block1Hero />
      <Block1Features />
      <Block3Audience />
      <Block2Learning />
      <Block5Expert />
      <Block4Statement />
      <Block6Registration />
      <Block7FAQ />
      <Footer />
    </main>
  );
}
