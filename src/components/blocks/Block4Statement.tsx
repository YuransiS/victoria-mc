import React from "react";
import styles from "./Block4Statement.module.css";

export function Block4Statement() {
  return (
    <section className={styles.section}>
      <div className={styles.statementBlock}>
        <h2 className={styles.statementTitle}>ЧОМУ ВАРТО БУТИ НА ЦЬОМУ МАЙСТЕР-КЛАСІ?</h2>
        
        <div className={styles.pointsGrid}>
          <div className={styles.point}>
            <p className={styles.pointText}>
              <strong>Контент у 2026 році працює вже за іншими правилами.</strong> Те, що давало охоплення та продажі ще рік тому, сьогодні поступово перестає працювати. На майстер-класі розберемо, на що зараз варто робити ставку.
            </p>
          </div>
          
          <div className={styles.point}>
            <p className={styles.pointText}>
              <strong>Конкуренція росте щодня.</strong> Виграють не ті, кто публікує більше, а ті, хто має зрозумілу систему, власний стиль і вміє викликати довіру через контент.
            </p>
          </div>
          
          <div className={styles.point}>
            <p className={styles.pointText}>
              <strong>Блог має приносити прибуток, а не забирати час.</strong> Покажу, як створювати контент швидше, без хаосу та постійних пошуків ідей, щоб він працював на залучення аудиторії й продажі.
            </p>
          </div>

          <div className={styles.point}>
            <p className={styles.pointText}>
              <strong>Літо - найкращий час для росту.</strong> Поки більшість відкладає розвиток "на потім", можна зайняти свою нішу, посилити позиціонування та підготувати блог до нового сезону.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
