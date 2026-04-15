import React from "react";
import styles from "./Block4Statement.module.css";

export function Block4Statement() {
  return (
    <section className={styles.section}>
      <div className={styles.statementBlock}>
        <h2 className={styles.statementTitle}>ЧОМУ ЦЕ ВАЖЛИВО САМЕ ЗАРАЗ?</h2>
        
        <div className={styles.pointsGrid}>
          <div className={styles.point}>
            <p className={styles.pointText}>
              <strong>Алгоритми не люблять хаос.</strong> Коли контент зрозумілий - Instagram сам просуває тебе на потрібну аудиторію.
            </p>
          </div>
          
          <div className={styles.point}>
            <p className={styles.pointText}>
              <strong>Ринок перенасичений.</strong> Люди втомилися від «успішного успіху» та офіційності. Зараз купують у живих, автентичних людей, чий контент має структуру.
            </p>
          </div>
          
          <div className={styles.point}>
            <p className={styles.pointText}>
              <strong>Instagram - це твій актив.</strong> Він має приносити прибуток, а не забирати енергію. Система звільняє час для життя.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
