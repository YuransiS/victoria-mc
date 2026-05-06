"use client";

import React, { useEffect, useRef } from "react";
import styles from "./PracticumProgram.module.css";
import { animate, stagger } from "animejs";

export function PracticumProgram() {
  const sectionRef = useRef<HTMLElement>(null);
  
  const days = [
    {
      day: "1 ДЕНЬ",
      title: "Звичайний день",
      desc: "Більшість показує просто своє життя - і це не чіпляє. На 1 дні - навчитесь розповідати про звичайний день так, щоб підписники прогрівались до вас і самі хотіли писати в директ.",
    },
    {
      day: "2 ДЕНЬ",
      title: "Довіра та цінності",
      desc: "Підписники купують у тих кому довіряють. Зрозумієте як показувати свої цінності і мислення через сторіз — щоб людина відчувала що ви своя і хотіла купувати саме у вас.",
      bonus: "БОНУСНИЙ ВОЙС ЧАТ ДЛЯ ЗНАЙОМСТВ",
    },
    {
      day: "3 ДЕНЬ",
      title: "Метод та досвід",
      desc: "Слова - я експерт не продають. Продає досвід. Навчитесь показувати свій метод через особисту історію - так щоб людина бачила результат у вас і хотіла такий самий собі.",
    },
    {
      day: "4 ДЕНЬ",
      title: "Сила помилок",
      desc: "Зрозумієте як говорити про свої помилки так, щоб це робило вас тим експертом якому вірять і до якого йдуть.",
    },
    {
      day: "5 ДЕНЬ",
      title: "Сенси та попит",
      desc: "Корисний контент не продає якщо людина не розуміє навіщо їй це. Навчитесь подавати свою тему так, щоб підписник сам дійшов до думки - мені це потрібно і я хочу саме це у вас.",
      live: "ЖИВИЙ ЕФІР З РОЗБОРАМИ",
    },
    {
      day: "6 ДЕНЬ",
      title: "Відвертість у роботі",
      desc: "Більшість або не розповідає про свої послуги - або робить це так що людям незручно. Зрозумієте як говорити про свою роботу так, щоб людина сама захотіла дізнатись більше і написала вам першою.",
    },
    {
      day: "7 ДЕНЬ",
      title: "Фінальний сторітелінг",
      desc: "Фінальний день - продаючий сторітелінг. Навчитесь будувати історію в сторіз після якої люди самі пишуть \"як до вас записатись\" - без тиску, дедлайнів і відчуття сорому, що ви продаєте.",
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
              <p className={styles.bonusSubtitle}>
                Отримаєте структуру карусельки яка зберігається, поширюється і приводить нових людей навіть через тиждень після публікації.
              </p>
            </div>
            <div className={styles.dot} />
          </div>
        </div>
      </div>
    </section>
  );
}
