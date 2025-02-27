"use client";

import Image from "next/image";
import jumpRopeImage from "/public/assets/images/jumpRope.png";
import styles from "./Philosophy.module.scss";

export default function Philosophy() {
  return (
    <section className={styles.philosophy}>
      <div className={styles.founder}>
        <Image src={jumpRopeImage} alt="A picture of Michael jump roping" />
        <div className={styles.founder__name}>
          <span className="text-small">
            michael olajide,
            <br className={styles.lineBreak} />
            founder & trainer
          </span>
        </div>
      </div>
      <div className={styles["philosophy-container"]}>
        <h3 className="h3_title h3_title--accent">our philosophy</h3>
        <div className={styles.philosophy__info}>
          <h4 className="h2-title">Do It Different</h4>
          <p className="body1">
            When you think different, your results are different. They&#39;re
            greater.
            <br />
            Leave the machines behind.
            <br />
            100% Silk fitness is key.
          </p>
        </div>
      </div>
    </section>
  );
}
