"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import silkCross from "public/assets/images/workouts-speedpunches.png";
import Button from "@/components/ui/Button/Button";
import styles from "./WhatsSOS.module.scss";

export default function WhatsSOS() {
  const router = useRouter();

  return (
    <section className={styles.about}>
      <div className={styles.about__imageContainer}>
        <Image
          src={silkCross}
          alt="A headshot of Michael `Silk` Olajide"
          className={styles.about__image}
        />
        <div className={styles.about__mobileButton}>
          {/* Button appears below the image only on mobile */}
          <Button variant="secondary" onClick={() => router.push("/signup")}>
            Start 7-day free trial
          </Button>
        </div>
      </div>
      <div className={styles["about-container"]}>
        <h3 className="h3_title h3_title--accent">how it works</h3>
        <div className={styles.about__info}>
          <h4 className={`h2-title ${styles.about__subHeading}`}>
            <span className="bold">What's</span> the System of Silk?
          </h4>
          <p className={`body1 ${styles.about__message}`}>
            The only boxing fitness program that will enhance a professional
            boxer’s fight and the non-boxer’s level of fitness. Designed by
            former professional boxer, Michael Olajide Jr.
          </p>
          <div className={styles.about__desktopButton}>
            {/* Button remains in the original location on desktop */}
            <Button variant="secondary" onClick={() => router.push("/signup")}>
              Start 7-day free trial
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
