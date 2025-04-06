"use client";

import Image from "next/image";
import DIDlogo from "/public/assets/icons/DID_logo.svg";
import styles from "./Philosophy.module.scss";

export default function Philosophy() {
  return (
    <section className={styles.philosophy}>
      <div className={styles.philosophy__logoCont}>
        <Image src={DIDlogo} alt="do it different text logo" />
      </div>
      <article className={styles.philosophy__copyCont}>
        <div className={styles.philoshopy__copy}></div>
        <h3 className="h3_title h3_title--accent">our philosophy</h3>

        <div className={styles.philosophy__par}>
          <p className="body1">
            When you think different, your results are different.
          </p>
          <p className="body1">
            <span>They&#39;re greater.</span>
          </p>
          <p className="body1">
            {" "}
            Leave the machines behind. 100% Silk fitness is key.
          </p>
        </div>
      </article>
    </section>
  );
}
