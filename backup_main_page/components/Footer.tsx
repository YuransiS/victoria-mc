import React from "react";
import styles from "./Footer.module.css";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <div className={styles.brand}>
            <span className={styles.name}>VICTORIA MESHCHERIAKOVA</span>
          </div>
          
          <div className={styles.socials}>
            <a 
              href="https://www.instagram.com/victoria_meshcheriakova?igsh=dW55YTltMTZ0Mmw1" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              Instagram
            </a>
          </div>
        </div>
        
        <div className={styles.bottomRow}>
          <p className={styles.copyright}>
            © {currentYear} Всі права захищені.
          </p>
          
          <div className={styles.legalLinks}>
            <a href="/privacy" className={styles.legalLink}>Політика конфіденційності</a>
            <a href="/offer" className={styles.legalLink}>Публічна оферта</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
