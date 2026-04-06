import React from "react";
import styles from "./Block4Statement.module.css";

export function Block4Statement() {
  return (
    <section className={styles.section}>
      <div className={styles.statementBlock}>
        <h2 className={styles.statementTitle}>ДОВІРА- ГОЛОВНА ВАЛЮТА 2026 РОКУ.</h2>
        <p className={styles.statementText}>
          У світі, переповненому ШІ-генераціями, люди шукають справжніх людей. Конверсія у запит у профілях із закладеними сенсами з візуалом у 5 разів вища, ніж у звичайних каталогів послуг.
        </p>
        <p className={styles.statementText} style={{ color: "var(--on-surface)" }}>
          Це твій шанс навчитися створювати візуал зі сенсами поки інші продовжують копіювати чужі шаблони.
        </p>
        <p className={styles.caption}>
          * Графік: Зростання довіри до блогів з власним стилем та сенсами vs падіння залученості у АІ сторінок.
        </p>
      </div>
    </section>
  );
}
