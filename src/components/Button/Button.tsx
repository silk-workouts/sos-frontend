"use client";

import React, { ReactNode } from "react";
import styles from "./Button.module.scss";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "tertiary" | "delete";
  children: ReactNode;
  onClick?: () => void; // Made optional
  className?: string;
}

export default function Button({
  type = "button",
  variant = "primary",
  children,
  onClick,
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${
        styles[`button--${variant}`]
      } ${className}`}
      onClick={onClick}
    >
      <span className={styles["button__text"]}>{children}</span>
      {(variant === "primary" || variant === "secondary") && (
        <span className={styles["button__arrow"]} />
      )}
    </button>
  );
}
