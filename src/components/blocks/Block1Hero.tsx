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
        {/* TOP DATE/TIME BAR */}
        <header className={styles.header}>
          <span>09.04</span>
          <span>18:00 за Києвом</span>
        </header>

        {/* MAIN SPLIT CONTENT */}
        <div className={styles.content}>
          
          {/* LEFT: TEXT CONTENT */}
          <div className={styles.textContent}>
            <h1 className={styles.title}>
              ВІД ХАОСУ<br/>ДО СИСТЕМИ:
            </h1>
            
            <p className={styles.description}>
              Як побудувати блог, який працює на вас — відображає ваші цінності, викликає довіру та приводить клієнтів
            </p>

            <div className={styles.expertBlock}>
               <div className={styles.author}>
                 Вікторія Мещерякова — експерт по візуалу зі сенсами
               </div>
            </div>
          </div>

          {/* RIGHT: REGISTRATION FORM */}
          <div className={styles.formWrapper}>
            <div className={styles.priceHeader}>
              <div className={styles.priceTitle}>ВАРТІСТЬ УЧАСТІ</div>
              <div className={styles.priceValue}>
                <span className={styles.priceStrike}>1500₴</span> 
                <span className={styles.priceFree}>БЕЗКОШТОВНО</span>
              </div>
            </div>
            
            <Form />
            

          </div>

        </div>
      </div>
    </section>
  );
}
