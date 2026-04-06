import React from "react";
import Image from "next/image";
import styles from "./Block1Hero.module.css";
import { Form } from "@/components/Form";

export function Block1Hero() {
  return (
    <section className={styles.hero}>
      {/* BACKGROUND LAYER */}
      <div className={styles.background}>
        <Image
          src="https://i.ibb.co/8nKsyCB9/IMG-0418.jpg"
          alt="Expert Image"
          fill
          className={styles.bgImage}
          priority
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.container}>
        {/* MAIN STACKED CONTENT */}
        <div className={styles.content}>

          <div className={styles.textContent}>
            <div className={styles.topRow}>
              <span>09.04</span>
              <span>18:00 за Києвом</span>
            </div>

            <h1 className={styles.title}>
              ВІД ХАОСУ<br />ДО СИСТЕМИ
            </h1>

            <p className={styles.description}>
              як побудувати блог, який працює на вас - відображає ваші цінності, викликає довіру та приводить клієнтів
            </p>
          </div>

          {/* REGISTRATION FORM COMPACT */}
          <div className={styles.formWrapper}>
            <div className={styles.priceTag}>
              <span>ВАРТІСТЬ УЧАСТІ: <span style={{ textDecoration: 'line-through', opacity: 0.6, marginRight: '0.4rem' }}>1500 грн</span> <b>БЕЗКОШТОВНО</b></span>
            </div>

            <Form />

            <div className={styles.socialProof}>
              <div className={styles.avatars}>
                <img src="https://i.pravatar.cc/100?img=32" alt="Participant" />
                <img src="https://i.pravatar.cc/100?img=47" alt="Participant" />
                <img src="https://i.pravatar.cc/100?img=12" alt="Participant" />
                <img src="https://i.pravatar.cc/100?img=26" alt="Participant" />
              </div>
              <span>🔥 <b>712</b> людей вже зареєструвалися</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
