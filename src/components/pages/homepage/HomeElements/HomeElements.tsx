"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Element from "@/components/Element/Element";
import Button from "@/components/ui/Button/Button";
import styles from "./HomeElements.module.scss";

export default function HomeElements() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push("/the-workout");
  };

  return (
    <section className={styles.elements}>
      <div className={styles["elements--wrapper"]}>
        <div className={styles.elements__headingCont}>
          <h2 className={`h2-title ${styles["element-container"]}`}>
            <span className="bold">Customize</span> your workout
          </h2>
          <Button
            className={`${styles.elements__elementsButton} ${styles["elements__elementsButton--hideMobile"]}`}
            variant="tertiary"
            onClick={handleNavigate}
          >
            Learn More
          </Button>
        </div>
        <div className={styles.elements__elementsBox}>
          <Element name="boxing" />
          <Element name="core crushers" />
          <Element name="isometrics" />
          <Element name="jump rope" />
          <Element name="lower body bands" />
          <Element name="upper body bands" />
        </div>

        <Button
          className={`${styles.elements__elementsButton} ${styles["elements__elementsButton--hideDesktop"]}`}
          variant="tertiary"
          onClick={handleNavigate}
        >
          Learn More
        </Button>
      </div>
    </section>
  );
}
