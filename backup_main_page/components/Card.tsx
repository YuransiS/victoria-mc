import React from "react";
import styles from "./Card.module.css";
import Image from "next/image";

interface CardProps {
  title: string;
  description: string;
  imageUrl: string;
}

export const Card: React.FC<CardProps> = ({ title, description, imageUrl }) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image 
          src={imageUrl} 
          alt={title} 
          fill 
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
};
