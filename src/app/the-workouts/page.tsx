import Image from "next/image";
import Button from "@/components/Button/Button";
import Element from "@/components/Element/Element";
import styles from "./page.module.scss";
import Accordion from "@/components/Accordion/Accordion";

export default function TheWorkouts() {
  return (
    <div className={styles.workout}>
      <section className={styles.workout__hero}>
        <h1 className={styles.workout__heroTitle}>The Workout</h1>
      </section>

      <section className={styles.workout__whatsSOS}>
        <div className={styles.workout__whatsSOSContent}>
          <Image
            className={styles.workout__featureImage}
            src="/assets/images/workouts-speedpunches.png"
            alt="Feature Image"
            width={745}
            height={745}
          />{" "}
          <div className={styles.textContainer}>
            <h2 className={`h2-title ${styles.workout__copy}`}>
              <span className="bold">What's</span> the System of Silk?
            </h2>
            <p className="body1">
              The only boxing fitness program that will enhance a professional
              boxer’s fight and the non-boxer’s level of fitness. Designed by
              former professional boxer, Michael Olajide Jr.
            </p>
            <Button variant="secondary" className={styles.workout__cta}>
              Start 7-day free trial
            </Button>
          </div>
        </div>
      </section>
      <section className={styles.workout__formula}>
        <h2 className={`${styles.workout__formulaTitle}`}>
          <span className={styles.workout__formulaBold}>Formulate</span> your
          workout
        </h2>
        <div className={styles.workout__formulaElements}>
          <Element number="1" letter="B" name="Boxing" />
          <p>+</p>
          <Element number="1" letter="B" name="Boxing" />
          <p>+</p>
          <Element number="1" letter="B" name="Boxing" />
          <p>→</p>
          <p>A killer arm workout</p>
        </div>
      </section>

      <section className={styles.workout__accordionContainer}>
        <div className={styles.workout__accordions}>
          <Accordion
            title="The Elements"
            description="Elements are categories of exercises that can be used to master a certain skill, or add to your cross-disciplinary workouts."
          />
          <Accordion
            title="Building a workout"
            description="Workouts are playlists built by adding exercise videos into a queue, or they are preset progressions. Save them to your library to track progress."
          />{" "}
          <Accordion
            title="Equipment"
            description="Basic equipment is vital to achieving maximum success. All you need are light weights, an exercise band, and jump rope to reach your full potential."
          />
        </div>
        <div className={`${styles.workout__accordionSubtitle}`}>
          <p className={styles.workout__accordionSubtitleCopy}>
            Use System of Silk to produce radical change through the forces of{" "}
            <span className={styles.boldRed}>
              atheletics, energy, & intent.
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
