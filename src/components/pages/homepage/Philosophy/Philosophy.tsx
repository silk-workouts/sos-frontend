"use client";

import Image from "next/image";
import DIDlogo from "/public/assets/icons/DID_logo.svg";
import styles from "./Philosophy.module.scss";

export default function Philosophy() {
  return (
    <section className={styles.philosophy}>
      <h3 className={`h3_title h3_title--accent ${styles.title}`}>
        our philosophy
      </h3>

      <Image src={DIDlogo} alt="do it different text logo" />

      <article className={styles.philosophy__copyCont}>
        <h3 className={`h3_title h3_title--accent ${styles.title}`}>
          our philosophy
        </h3>
        <p className={styles.message}>
          <span> When you think different, your results are different.</span>
          <span className={styles.emphasis}>They&#39;re greater.</span>{" "}
          <span>Leave the machines behind. 100% Silk fitness is key.</span>
        </p>
      </article>
    </section>
  );
}
