"use client";

import Image from "next/image";
import DIDlogo from "/public/assets/icons/DID_logo.svg";
import styles from "./Philosophy.module.scss";

export default function Philosophy() {
  return (
    <section className={styles.philosophy}>
      <h2 className={`h3_title h3_title--accent ${styles.title}`}>
        our philosophy
      </h2>

      <Image src={DIDlogo} alt="Do It Different — brand slogan" />

      <article className={styles.philosophy__copyCont}>
        <h2 className={`h3_title h3_title--accent ${styles.title}`}>
          our philosophy
        </h2>
        <p className={styles.message}>
          <span> When you do it different, your results are different.</span>
          <strong className={styles.emphasis}>They&#39;re greater.</strong>{" "}
          <span>Leave the machines behind. 100% Silk fitness is key.</span>
        </p>
      </article>
    </section>
  );
}
