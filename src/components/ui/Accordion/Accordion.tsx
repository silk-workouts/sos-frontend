"use client";
import React, { useState } from "react";
import styles from "./Accordion.module.scss";

interface AccordionProps {
  title: string;
  description: string;
  className?: string;
}

export default function Accordion({ title, description }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.accordion}>
      <div className={styles.header} onClick={() => setIsOpen(!isOpen)}>
        <h3 className={styles.title}>{title}</h3>
        {/* Plus when closed, Minus when open */}
        <div className={styles.icon}>{isOpen ? "−" : "+"}</div>
      </div>

      <div className={`${styles.content} ${isOpen ? styles.open : ""}`}>
        <p>{description}</p>
      </div>
    </div>
  );
}
