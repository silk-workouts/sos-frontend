"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import silkHeadshot from "/public/assets/images/silk_headshot_1_red_patch.png";
import Button from "@/components/ui/Button/Button";
import styles from "./About.module.scss";

export default function About() {
  const router = useRouter();

  return (
    <section className={styles.about}>
      <div className={styles["about--wrapper"]}>
        <div className={styles.about__imageContainer}>
          <Image
            src={silkHeadshot}
            alt="A headshot of Michael `Silk` Olajide"
            className={styles.about__image}
          />
          {/* Button appears below the image only on mobile */}
          <Button
            variant="tertiary"
            onClick={() => router.push("/about")}
            className={styles.about__mobileButton}
          >
            More about Michael
          </Button>
        </div>
        <div className={styles.about__textContainer}>
          <h3 className={`h3_title h3_title--accent ${styles.about__title}`}>
            about
          </h3>
          <div className={styles.about__info}>
            <h4 className={`h2-title-white ${styles.about__subHeading}`}>
              <span className="bold">the godfather</span> of Boxing for Fitness
            </h4>
            <p className={`body1-white ${styles.about__message}`}>
              Michael “Silk” Olajide Jr., began his career as a prizefighter. He
              was a highly respected championship boxer whose fights were
              televised internationally. In 1991 he retired from an eye injury
              and ushered in the age of boxing fitness.
            </p>
            <div className={styles.about__desktopButton}>
              {/* Button remains in the original location on desktop */}
              <Button variant="tertiary" onClick={() => router.push("/about")}>
                More about Michael
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
