"use client";

import PriceCard from "../PriceCard/PriceCard";
import styles from "./GetStarted.module.scss";

export default function GetStarted() {
  return (
    <section className={styles.getStarted}>
      <div className={styles.container}>
        <h2 className={`h2-title ${styles.mainTitle}`}>
          <span className="bold">Start your</span> 100% Silk{" "}
          <span className="bold"> journey today.</span>
        </h2>
        <PriceCard />
      </div>
    </section>
  );
}
