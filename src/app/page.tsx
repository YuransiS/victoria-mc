import React from "react";
import styles from "./page.module.css";
import { Block1Hero } from "@/components/blocks/Block1Hero";
import { Block2Learning } from "@/components/blocks/Block2Learning";
import { Block3Audience } from "@/components/blocks/Block3Audience";
import { Block4Statement } from "@/components/blocks/Block4Statement";
import { Block5Expert } from "@/components/blocks/Block5Expert";
import { Block6Registration } from "@/components/blocks/Block6Registration";
import { Block7FAQ } from "@/components/blocks/Block7FAQ";

export default function Home() {
  return (
    <main className={styles.main}>
      <Block1Hero />
      <Block2Learning />
      <Block3Audience />
      <Block4Statement />
      <Block5Expert />
      <Block6Registration />
      <Block7FAQ />
    </main>
  );
}
