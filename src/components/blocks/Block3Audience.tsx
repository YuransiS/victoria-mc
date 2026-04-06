import React from "react";
import styles from "./SharedBlocks.module.css";
import { Button } from "@/components/Button";

export function Block3Audience() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Цей майстер-клас тобі необхідний, якщо:</h2>
      </div>
      <div className={styles.listGrid}>
        <div className={styles.listItemAlt}>
          <p className={styles.listItemText}>Витрачаєш 4 години на Instagram, а результат - 0. Втомилася від хаотичних думок «що постити сьогодні» і хочеш мати готовий покроковий протокол дій.</p>
        </div>
        <div className={styles.listItemAlt}>
          <p className={styles.listItemText}>Твій блог виглядає «дешевше», ніж твоя експертність. Хочеш обґрунтовано підняти чек на свої послуги через професійну візуальну упаковку.</p>
        </div>
        <div className={styles.listItemAlt}>
          <p className={styles.listItemText}>Боїшся камери або видаляєш пости через 2 дні. Потребуєш впевненості, яка з’являється лише тоді, коли контент побудований на твердому фундаменті, а не на натхненні.</p>
        </div>
        <div className={styles.listItemAlt}>
          <p className={styles.listItemText}>Ти в обмежених ресурсах (мама, емігрант, найм). Маєш лише 30 хвилин вільного часу і хочеш, щоб контент став простою звичкою, як пити вітаміни.</p>
        </div>
        <div className={styles.listItemAlt}>
          <p className={styles.listItemText}>Ти - SMM-ник, який взуває клієнтів, але «босий» сам. Хочеш нарешті вийти із тіні та побудувати власний сильний бренд, який приносить замовлення на твій чек.</p>
        </div>
      </div>
      <div style={{ marginTop: "3rem", display: "flex", justifyContent: "center" }}>
        <a href="#register">
          <Button variant="secondary">приєднатися на майстер-клас (бонус)</Button>
        </a>
      </div>
    </section>
  );
}
