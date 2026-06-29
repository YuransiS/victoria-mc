"use client";

import React, { useState } from "react";
import styles from "./Block2Learning.module.css";
import { Button } from "@/components/Button";
import { motion, AnimatePresence } from "framer-motion";

const programData = [
  {
    num: "1",
    title: "Що змінилося в Instagram у 2026 році та чому старі підходи більше не працюють",
    points: [
      "Дізнаєшся, що змінилося в Instagram, чому красивого візуалу вже недостатньо та як ШІ вплинув на контент.",
      "Зрозумієш, які формати зараз дають охоплення, довіру та продажі."
    ]
  },
  {
    num: "2",
    title: "Головні причини, чому блог не приносить клієнтів",
    points: [
      "Розберемо найпоширеніші помилки, через які навіть якісний контент не продає.",
      "Покажу, чому хаотичне ведення блогу, відсутність сенсів і копіювання інших заважають стабільно зростати."
    ]
  },
  {
    num: "3",
    title: "Які тренди працюватимуть найближчі 3–6 місяців",
    points: [
      "Покажу, куди рухається ринок контенту, на що варто звернути увагу вже зараз та які формати допоможуть залишатися конкурентними.",
      "Також покажу нові можливості Instagram, які більшість поки що не використовує."
    ]
  },
  {
    num: "4",
    title: "5 інструментів, які допоможуть продавати через блог легше",
    points: [
      "Поділюся практичними інструментами, які можна впровадити одразу після ефіру, щоб підвищити залучення аудиторії, довіру та середній чек."
    ]
  },
  {
    num: "5",
    title: "Контент і візуал, які працюють саме зараз",
    points: [
      "Покажу, що варто додавати у свій візуал влітку, щоб блог виглядав живим, сучасним і викликав довіру.",
      "Також розберемо кілька способів оформлення каруселей: від простих рішень до повністю авторського стилю."
    ]
  },
  {
    num: "6",
    title: "Три варіанти як оформлювати каруселі",
    points: [
      "Розкажу про найкращі варіанти, як тобі оформлювати каруселі, щоб вони залучали аудиторію."
    ]
  },
  {
    num: "7",
    title: "Реальні кейси та шлях до монетизації",
    points: [
      "Розберемо приклади учасників із різних ніш та покажу, як зміна подачі, сенсів і системи допомагає отримувати більше охоплень, заявок і продажів."
    ]
  },
  {
    num: "8",
    title: "Презентація навчального продукту «СТВОРЮЙ»",
    points: [
      "Покажу, як проходить навчання, що саме ми робимо всередині програми та чому це не ще один курс, а система, яка допомагає перетворити знання у контент, довіру та прибуток."
    ]
  },
  {
    num: "9",
    title: "Подарунки для учасників вебінару",
    points: [
      "Усі учасники отримають додаткові бонуси, які допоможуть ще швидше впроваджувати нові інструменти у свій блог.",
      "А також розповім про спеціальні умови участі в наставництві «СТВОРЮЙ», які будуть доступні лише на ефірі."
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
