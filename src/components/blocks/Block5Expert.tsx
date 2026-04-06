import React from "react";
import Image from "next/image";
import styles from "./Block5Expert.module.css";

export function Block5Expert() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Хто проводить Майстер-клас?</h2>
      </div>
      <div className={styles.expertLayout}>
        <div className={styles.imageWrapper}>
          <Image
            src="https://i.ibb.co/N2J39PrH/IMG-0911.jpg"
            alt="Вікторія Мещерякова"
            fill
            className={styles.imageCover}
          />
        </div>
        <div className={styles.expertInfo}>
          <h3 className={styles.expertTitle}>Я - Вікторія Мещерякова</h3>
          <div className={styles.expertPoint}>
            Працюю з контентом з 2015 року. Бачила Instagram від самого початку і всі його трансформації до сьогодні.
          </div>
          <div className={styles.expertPoint}>
            Починала з авторських ляльок які створювала руками - вручну будувала для них контент і продажі ще до того як це почали робити нейромережі.
          </div>
          <div className={styles.expertPoint}>
            Розробляла стратегії для міжнародних брендів, зокрема Fisher. Працювала з аудиторіями трьох країн: Британія, США, Польща.
          </div>
          <div className={styles.expertPoint}>
            5 років викладання. За цей час виробила мову пояснення яка працює для будь-якого рівня і будь-якої ніші.
          </div>
          <div className={styles.expertPoint}>
            Мама двох дітей. Система "контент за 30 хвилин" - це не маркетинговий слоган. Це єдиний спосіб яким я сама веду блог між дитиною, роботою і реальним життям.
          </div>
          <div className={styles.expertPoint}>
            Я сама пройшла шлях від хаосу та емоційного постингу до чіткої системи. Саме тому знаю де саме ти зараз застрягла - і що з цим робити.
          </div>
        </div>
      </div>
    </section>
  );
}
