import React from "react";
import styles from "./SharedBlocks.module.css";

export function Block2Learning() {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>На майстер-класі:</h2>
      </div>
      <div className={styles.listGrid}>
        <div className={styles.listItem}>
          <span className={styles.listItemNum}>1</span>
          <p className={styles.listItemText}>Дізнаєшся про свої ключові помилки, через які твій блог прямо зараз не приносить замовлень та заявок. Та отримаєш готові рішення, як їх виправити і що для цього потрібно.</p>
        </div>
        <div className={styles.listItem}>
          <span className={styles.listItemNum}>2</span>
          <p className={styles.listItemText}>Складеш план на 9 фото зі змістом саме під свою нішу, щоб закрити питання контенту на 2 тижні наперед.</p>
        </div>
        <div className={styles.listItem}>
          <span className={styles.listItemNum}>3</span>
          <p className={styles.listItemText}>Отримаєш покроковий план, як об’єднати мету твого блогу, теми постів та візуал у єдину робочу систему.</p>
        </div>
        <div className={styles.listItem}>
          <span className={styles.listItemNum}>4</span>
          <p className={styles.listItemText}>Навчишся вкладати сенси у шрифти та деталі кадру, щоб продавати свою експертність, не пишучи полотна тексту.</p>
        </div>
        <div className={styles.listItem}>
          <span className={styles.listItemNum}>5</span>
          <p className={styles.listItemText}>Дізнаєшся алгоритм «30 хвилин», за яким зможеш знімати якісний контент вдома біля вікна без допомоги студій та фотографів.</p>
        </div>
      </div>
    </section>
  );
}
