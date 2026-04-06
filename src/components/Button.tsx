import React from "react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = "primary", 
  className,
  ...props 
}) => {
  return (
    <button 
      className={`${styles.button} ${styles[variant]} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
};
