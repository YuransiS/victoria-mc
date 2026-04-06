import React from "react";
import styles from "./SharedBlocks.module.css";
import { Form } from "@/components/Form";

export function Block6Registration() {
  return (
    <section id="register" className={`${styles.section} ${styles.sectionAlt}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        <div>
          <h2 className={styles.sectionTitle} style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", textAlign: "center" }}>
            Реєструйся на практичний майстер-клас
          </h2>
          <p style={{ textAlign: "center", color: "var(--on-surface-variant)", lineHeight: 1.6 }}>
            та отримуй готову структуру блогу під будь яку нішу на 6 місяців вперед.<br />
            <strong style={{ color: "var(--accent)" }}>Кількість безкоштовних місць на майстер-класі - обмежена.</strong>
          </p>
        </div>
        <Form />
      </div>
    </section>
  );
}
