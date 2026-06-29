"use client";

import React, { useState } from "react";
import styles from "./Block2Learning.module.css";
import { Button } from "@/components/Button";
import { motion, AnimatePresence } from "framer-motion";

const programData = [
  {
    num: "1",
    title: "Діагностика: Чому блог є, а запитів від клієнтів - нуль?",
    points: [
      "Дізнаєшся про ключові помилки, через які твій блог прямо зараз не приносить замовлень та заявок.",
      "Отримаєш готові рішення, як виправити логіку профілю, щоб він почав працювати на твій чек.",
      "Побачиш на реальних прикладах, де саме ти втрачаєш лояльність аудиторії."
    ]
  },
  {
    num: "2",
    title: "Фундамент: Про що ти і навіщо ти клієнту, як це відображати в блозі?",
    points: [
      "Визначиш свою справжню мотивацію ведення контенту - те, що дасть тобі енергію не кинути блог через тиждень.",
      "Упакуєш свою експертність у просту формулу: «хто ти + кому це потрібно + що людина отримує».",
      "Зрозумієш, як закласти базу, без якої будь-який візуал чи текст не матимуть сенсу."
    ]
  },
  {
    num: "3",
    title: "УНІКАЛЬНІСТЬ: Як знайти себе, а не копіювати інших?",
    points: [
      "Навчишся бачити кадри та сенси там, де інші не помічають, використовуючи деталі свого побуту та мислення.",
      "Розвинеш надивленість, яка дозволить створювати автентичний контент, що виділяє тебе серед тисячі конкурентів."
    ]
  },
  {
    num: "4",
    title: "Як поєднувати життя та експертність?",
    points: [
      "Навчишся поєднувати особисте та робоче так, щоб одне підсилювало інше, а блог перестав бути «нудною енциклопедією».",
      "Опануєш нативні продажі: як доносити цінність своїх послуг через деталі, а не через агресивне «купи».",
      "Отримаєш інструмент стабільності, який дозволить вести блог без вигорання та щоденних мук перфекціонізму."
    ]
  },
  {
    num: "5",
    title: "ВІЗУАЛ: Стиль, стрічка та техніка зйомки",
    points: [
      "Побачиш у прямому ефірі, як створити різноманітну та дорогу стрічку, маючи лише одну локацію та телефон.",
      "Дізнаєшся, як планувати фото для гармонійного візуалу, щоб сторінка виглядала естетично і приваблювала клієнтів.",
      "Отримаєш перелік мінімальних програм, у яких легко розібратися за 15 хвилин і зекономити на дизайнері."
    ]
  },
  {
    num: "6",
    title: "РОЗБОРИ АКАУНТІВ: Рішення для різних ніш",
    points: [
      "Побачиш розбори реальних профілів (психолог, юрист, майстер, фотограф та інші) і зрозумієш, що конкретно в них не працює.",
      "Отримаєш наочні приклади «ДО» та «ПІСЛЯ», щоб побачити, як система змінює сприйняття експерта та його чеку.",
      "Зможеш «приміряти» готові рішення на свою нішу та впровадити їх одразу після ефіру."
    ]
  },
  {
    num: "7",
    title: "Презентація навчального продукту «СТВОРЮЙ»",
    points: [
      "Отримаєш доступ до повної системи виходу з хаосу на спеціальних умовах, які діють тільки для учасників МК.",
      "Забереш унікальні бонуси, які допоможуть тобі вибудувати систему візуалу та продажів ще швидше."
    ]
  }
];

export function Block2Learning() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.sectionTitle}>Програма майстер-класу:</h2>
        </motion.div>

        <div className={styles.accordionList}>
          {programData.map((item, index) => {
            const isActive = openIndex === index;
            
            return (
              <motion.div 
                key={item.num}
                className={`${styles.accordionItem} ${isActive ? styles.accordionItemActive : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button 
                  className={styles.accordionHeader} 
                  onClick={() => toggleItem(index)}
                >
                  <div className={styles.numberBox}>{item.num}</div>
                  <div className={styles.itemTitle}>{item.title}</div>
                  <div className={styles.chevron}>
                    ↓
                  </div>
                </button>
                
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className={styles.accordionContent}>
                        <ul className={styles.pointList}>
                          {item.points.map((point, i) => (
                            <li key={i} className={styles.pointItem}>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        
        <motion.div 
          style={{ marginTop: "3.5rem", display: "flex", justifyContent: "center" }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a href="#register">
            <Button variant="primary">ЗАРЕЄСТРУВАТИСЯ ЗАРАЗ</Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
