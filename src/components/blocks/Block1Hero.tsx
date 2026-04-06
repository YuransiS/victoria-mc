import React from "react";
import Image from "next/image";
import styles from "./Block1Hero.module.css";
import { Button } from "@/components/Button";

export function Block1Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.layout}>
        {/* TEXT COLUMN */}
        <div className={styles.textCol}>
          <div className={styles.topRow}>
            <span>09.04</span>
            <span>18:00 за Києвом</span>
          </div>
          
          <h1 className={styles.title}>
            ЯК ЧЕРЕЗ ВІЗУАЛ, СЕНСИ ДОНЕСТИ ЦІННІСТЬ СВОЇХ ПОСЛУГ ТА ОТРИМУВАТИ ЗАПИТИ В DIRECT БЕЗ 24/7 ПОСТИНГУ
          </h1>
          
          <p className={styles.description}>
            Майстер-клас для тих, хто втомився від «шаблонного» контенту і хоче перетворити свій профіль на інструмент впізнаваності та продажів, витрачаючи на зйомку від 30 хвилин на день без втрати якості
          </p>
          
          <div className={styles.author}>
            Вікторія Мещерякова - експерт по візуалу зі сенсами
          </div>
        </div>

        {/* IMAGE COLUMN */}
        <div className={styles.imageCol}>
           <Image
             src="https://i.ibb.co/8nKsyCB9/IMG-0418.jpg"
             alt="Віка в естетичному домашньому робочому середовищі"
             fill
             className={styles.image}
             priority
           />
        </div>

        {/* ACTION COLUMN */}
        <div className={styles.actionCol}>
          <div>
            <div className={styles.priceTitle}>Вартість участі</div>
            <div className={styles.priceValue}>
              <span className={styles.priceStrike}>1500 грн</span> БЕЗКОШТОВНО
            </div>
          </div>
          
          <a href="#register" style={{ display: 'block' }}>
            <Button variant="primary" style={{ width: "100%" }}>ЗАРЕЄСТРУВАТИСЯ ТА ОТРИМАТИ БОНУС</Button>
          </a>
          
          <div className={styles.bonus}>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Бонус:</span> готова структура блогу під будь яку нішу на 6 місяців вперед (отримай відразу після реєстрації).
          </div>
        </div>
      </div>
    </section>
  );
}
