"use client";

import React, { useEffect, useRef } from "react";
import styles from "./PracticumProgram.module.css";
import { animate, stagger } from "animejs";

export function PracticumProgram() {
  const sectionRef = useRef<HTMLElement>(null);
  
  interface DayItem {
    day: string;
    title: string;
    desc: string;
    live?: string;
    bonus?: string;
  }

  const days: DayItem[] = [
    {
      day: "1 ДЕНЬ - 15.05",
      title: "Прогрів до стилю життя",
      desc: "Розповідаємо про свій день, розкриваючи себе, а не просто по фактам: я снідала, я пішла в салон, я працюю (прогріваємо до тебе та стилю життя).",
    },
    {
      day: "2 ДЕНЬ - 16.05",
      title: "Особистість та цінності",
      desc: "Розкриваємо особистість або основну тему блогу, будуючи історію через призму наших звичок, мислення та цінностей.",
    },
    {
      day: "3 ДЕНЬ - 17.05",
      title: "Метод та експертність",
      desc: "Показуємо на власному досвіді як працює твій метод, підхід, стиль життя (прогріваємо до тебе та твоєї експертності або основної теми блогу).",
    },
    {
      day: "4 ДЕНЬ - 18.05",
      title: "Щирість та довіра",
      desc: "Розкриваємось через помилки, які ми самі робили і що це дало нам тепер (викликаємо довіру завдяки щирості та відкритості).",
    },
    {
      day: "5 ДЕНЬ - 19.05",
      title: "Експертна підбірка",
      desc: "Сторіз підбірка на тему блогу, чому наша тема це круто і як це працює (прогріваємо до експертності або основної теми блогу).",
    },
    {
      day: "6 ДЕНЬ - 20.05",
      title: "Пропозиція співпраці",
      desc: "Розповідаємо, як можна з нами поспівпрацювати, беремо одну з послуг/продуктів та розповідаємо про неї (прогріваємо до експертності і нативно продаємо ідею).",
    },
    {
      day: "7 ДЕНЬ - 21.05",
      title: "Продаючий сторітелінг",
      desc: "Будуємо історію, яка приведе до запису на послуги/продукт (прогріваємо і продаємо).",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Anime.js V4 Staggered Reveal
            animate(`.${styles.dayRow}`, {
              opacity: [0, 1],
              translateX: (el: any) => {
                return el.classList.contains(styles.left) ? [-50, 0] : [50, 0];
              },
              translateY: [30, 0],
              delay: stagger(150),
              duration: 1000,
              ease: "easeOutExpo",
            });

            animate(`.${styles.progressLine}`, {
              scaleY: [0, 1],
              duration: 2000,
              ease: "easeInOutQuad",
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} id="program" ref={sectionRef}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>ПРОГРАМА ПРАКТИКУМУ</h2>
        
        <div className={styles.timeline}>
          <div className={styles.progressLine} style={{ transformOrigin: "top" }} />
          
          {days.map((d, i) => (
            <div
              key={i}
              className={`${styles.dayRow} ${i % 2 === 0 ? styles.left : styles.right}`}
              style={{ opacity: 0 }}
            >
              <div className={styles.dayContent}>
                <div className={styles.dayNum}>{d.day}</div>
                <h3>{d.title}</h3>
                <p>{d.desc}</p>
                
                {d.bonus && <div className={styles.bonusTag}>{d.bonus}</div>}
                {d.live && <div className={styles.liveTag}>{d.live}</div>}
              </div>
              <div className={styles.dot} />
            </div>
          ))}

          {/* Separate Bonus Block */}
          <div
            className={`${styles.dayRow} ${days.length % 2 === 0 ? styles.left : styles.right} ${styles.specialBonusRow}`}
            style={{ opacity: 0 }}
          >
            <div className={`${styles.dayContent} ${styles.bonusContent}`}>
              <h4 className={styles.bonusBadge}>ДОДАТКОВИЙ ЕФІР</h4>
              <h3 className={styles.bonusTitle}>🔥 АНАТОМІЯ КАРУСЕЛЬКИ</h3>
              <div className={styles.bonusList}>
                <p>• Чим карусель відрізняється від сторіз і коли що використовувати</p>
                <p>• Структура карусельки яку зберігають: перший слайд — середина — фінал</p>
                <p>• Що не можна робити в каруселях — конкретні помилки з прикладами</p>
                <p>• Як оформити карусель щоб вона виглядала стильно і мінімалістично</p>
              </div>
              <p className={styles.specialConditions}>
                Та спеціальні умови на навчальний продукт <b>СТВОРЮЙ</b>
              </p>
            </div>
            <div className={styles.dot} />
          </div>
        </div>
      </div>
    </section>
  );
}
