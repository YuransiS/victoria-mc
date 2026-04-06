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
            <h1 className={styles.title}>
              ВІД ХАОСУ<br/>ДО СИСТЕМИ
            </h1>
            
            <p className={styles.description}>
              Як побудувати блог, який працює на вас — зробити вашу експертність видимою та залучати клієнтів.
            </p>
          </div>

          {/* REGISTRATION FORM COMPACT */}
          <div className={styles.formWrapper}>
            <div className={styles.priceTag}>
               <span>ВАРТІСТЬ УЧАСТІ: <span style={{ textDecoration: 'line-through', opacity: 0.6, marginRight: '0.4rem' }}>1500 грн</span> <b>БЕЗКОШТОВНО</b></span>
            </div>
            
            <Form />
          </div>

        </div>
      </div>
    </section>
  );
}
