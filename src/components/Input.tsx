import React, { forwardRef } from "react";
import styles from "./Input.module.css";
import { motion, AnimatePresence } from "framer-motion";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, wrapperClassName, ...props }, ref) => {
    return (
      <div className={`${styles.wrapper} ${wrapperClassName || ""}`}>
        <label className={styles.label}>{label}</label>
        <input 
          ref={ref}
          className={`${styles.input} ${error ? styles.inputError : ""}`} 
          {...props} 
        />
        <AnimatePresence>
          {error && (
            <motion.span 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={styles.errorMessage}
            >
              {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = "Input";
