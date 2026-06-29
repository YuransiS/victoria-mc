import React, { forwardRef } from "react";
import styles from "./Input.module.css";
import { motion, AnimatePresence } from "framer-motion";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, wrapperClassName, ...props }, ref) => {
    return (
      <div className={`${styles.wrapper} ${wrapperClassName || ""}`}>
        <label className={styles.label}>{label}</label>
        <input 
          ref={ref}
          className={`${styles.input} ${error ? styles.inputError : ""}`} 
          {...props} 
        />
        <AnimatePresence>
          {error ? (
            <motion.span 
              key="error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={styles.errorMessage}
            >
              {error}
            </motion.span>
          ) : hint && (
            <motion.span 
              key="hint"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={styles.hintMessage}
            >
              {hint}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = "Input";
