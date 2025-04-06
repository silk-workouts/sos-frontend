"use client";

import React from "react";
import styles from "./HomeElements.module.scss";
import Element from "@/components/Element/Element";
import Image from "next/image";
import boxingEl from "public/assets/icons/elements-white-bg/el-boxing-bg-white.svg";
import jumpRopeEl from "/public/assets/icons/elements-white-bg/el-jumprope-bg-white.svg";
import isoEl from "/public/assets/icons/elements-white-bg/el-isometrics-bg-white.svg";
import ccEl from "/public/assets/icons/elements-white-bg/el-corecrushers-bg-white.svg";
import lbbEl from "/public/assets/icons/elements-white-bg/el-lbb-bg-white.svg";
import ubbEl from "/public/assets/icons/elements-white-bg/el-ubb-bg-white.svg";
import Button from "@/components/ui/Button/Button";
import { useRouter } from "next/navigation";

console.log(ccEl);

export default function HomeElements() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push("/the-workout");
  };

  return (
    <section className={styles.elements}>
      <div className={styles.elements__headingCont}>
        <h2 className={`h2-title ${styles["element-container"]}`}>
          <span className="bold">Customize</span> your workout
        </h2>
        <Button
          className={`${styles.elements__elementsButton} ${styles["elements__elementsButton--hideMobile"]}`}
          variant="primary"
          onClick={handleNavigate}
        >
          Learn More
        </Button>
      </div>
      <div className={styles["element-container2"]}>
        <div className={styles.elements__elementsBox}>
          <Image
            src={boxingEl.src}
            alt="boxing icon"
            width={138}
            height={138}
            className={styles.elements__el}
          />
          <Image
            src={ccEl.src}
            alt="core crushers icon"
            className={styles.elements__el}
            width={138}
            height={138}
          />
          <Image
            src={isoEl.src}
            alt="isometrics icon"
            width={138}
            height={138}
            className={styles.elements__el}
          />
          <Image
            src={jumpRopeEl.src}
            alt="jump rope icon"
            width={138}
            height={138}
            className={styles.elements__el}
          />
          <Image
            src={ubbEl.src}
            alt="upper body bands icon"
            width={138}
            height={138}
            className={styles.elements__el}
          />
          <Image
            src={lbbEl.src}
            alt="lower body bands icon"
            width={138}
            height={138}
            className={styles.elements__el}
          />
        </div>
        {/* <div className={styles["workout-description"]}>
          <p className="body2">→</p>
          <p className={`${styles["underline"]} body2`}>A killer arm workout</p>
        </div> */}
      </div>
      <Button
        className={`${styles.elements__elementsButton} ${styles["elements__elementsButton--hideDesktop"]}`}
        variant="primary"
        onClick={handleNavigate}
      >
        Learn More
      </Button>
    </section>
  );
}
