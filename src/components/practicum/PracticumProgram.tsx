"use client";

import React, { useEffect, useRef } from "react";
import styles from "./PracticumProgram.module.css";
import { animate, stagger } from "animejs";

export function PracticumProgram() {
  const sectionRef = useRef<HTMLElement>(null);
  
  const days = [
    {
      day: "1 день",
      title: "Прогрів до особистості",
      desc: "Вчимося викликати інтерес до свого способу життя. Розкриваємо себе через змістовні сторіз, а не просто сухі факти.",
    },
    {
      day: "2 день",
      title: "Зв'язок через звички",
      desc: "Розкриваємо особистість через призму наших звичок, мислення та цінностей — спеціально для учасників практикуму. Будуємо глибший зв'язок з аудиторією.",
      bonus: "БОНУСНИЙ ВОЙС ЧАТ ДЛЯ ЗНАЙОМСТВ",
    },
    {
      day: "3 день",
      title: "Метод та експертність",
      desc: "Показуємо на власному досвіді, як працює твій метод та підхід. Прогріваємо до професійної компетенції.",
    },
    {
      day: "4 день",
      title: "Сила вразливості",
      desc: "Розкриваємось через помилки та факапи. Викликаємо довіру завдяки щирості та відкритості.",
    },
    {
      day: "5 день",
      title: "Цінність продукту",
      desc: "Підбірка на тему блогу: чому ваша ніша це круто і як це працює. Формуємо попит.",
      live: "ЖИВИЙ ЕФІР З РОЗБОРАМИ",
    },
    {
      day: "6 день",
      title: "Нативні продажі",
      desc: "Розповідаємо, як з нами поспівпрацювати. Беремо одну послугу та нативно продаємо ідею роботи з вами.",
    },
    {
      day: "7 день",
      title: "Продаючий сторітелнг",
      desc: "Будуємо цілісну історію, яка веде до запису на послугу чи купівлі продукту.",
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
              <h4 className={styles.bonusBadge}>БОНУС</h4>
              <h3 className={styles.bonusTitle}>🔥 АНАТОМІЯ КАРУСЕЛЬКИ</h3>
              <p className={styles.bonusSubtitle}>(ДЛЯ ТИХ, ХТО ДІЙШОВ ДО КІНЦЯ)</p>
              <ul className={styles.bonusList}>
                <li>Структура карусельки яку зберігають</li>
                <li>Помилки та мінімалістичний дизайн</li>
                <li>Практика: твоя перша карусель</li>
              </ul>
            </div>
            <div className={styles.dot} />
          </div>
        </div>
      </div>
    </section>
  );
}
