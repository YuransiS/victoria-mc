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
          <div className={styles.expertSocial}>
            <a 
              href="https://www.instagram.com/victoria_meshcheriakova?igsh=dW55YTltMTZ0Mmw1" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.instagramButton}
            >
              <svg 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                fill="currentColor"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Подивитись мій Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
