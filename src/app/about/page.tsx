import Image from "next/image";
import styles from "./page.module.scss";

export default function About() {
  return (
    <div className={styles.about}>
      <section className={styles.about__hero}>
        <h1 className={styles.about__heroTitle}>
          The Godfather of Boxing for Fitness
        </h1>
      </section>

      <section className={styles.about__silkExperience}>
        <div className={styles.about__silkExperienceCopy}>
          <div className={styles.textContainer}>
            <h2 className={`h2-title ${styles.about__copy}`}>
              <span className="bold">The Silk</span> Experience
            </h2>
            <p className="body1">
              Michael “Silk” Olajide is fitness’s single most influential
              trainer having ushered in the age of the boxer. Michael began
              teaching boxing for fitness in 1991 and having been featured in
              Vogue, GQ, Sports Illustrated, and Time magazine, Michael is
              generally recognized as The Godfather of Boxing for Fitness.
            </p>
            <p className="body1">
              Michael’s concept of boxing for fitness and his gym Aerospace
              High-Performance Center were the driving concept for all the
              boxing fitness Gym’s you see all over the world today.
            </p>
          </div>
        </div>

        <Image
          className={styles.about__accentImage}
          src="/assets/images/about-ringwin.png"
          alt="Feature Image"
          width={491}
          height={575}
        />
      </section>

      <Image
        className={styles.about__featureImage}
        src="/assets/images/about-speedbag.png"
        alt="Feature Image"
        width={1440}
        height={592}
      />

      <section className={styles.about__moreMichael}>
        <div className={styles.about__moreMichaelContent}>
          <Image
            className={styles.about__featureImage}
            src="/assets/images/about-newspaper.png"
            alt="Feature Image"
            width={620}
            height={822}
          />{" "}
          <div className={styles.textContainer}>
            <h2 className={`h2-title ${styles.about__copy}`}>
              <span className="bold">More</span> about Michael
            </h2>
            <p className="body1">
              Currently, with his unrivaled knowledge of boxing, movement and
              teaching non boxers how to box, Michael is the boxing
              choreographer helping to bring “ALI THE MUSICAL” to Broadway in
              2025. But it was at 16 years of age, that Michael “Silk” Olajide
              Jr., began his career as a PROFESSIONAL BOXER. He was a highly
              respected championship boxer whose fights were televised
              internationally. In 1991, Michael STOPPED BOXING. Since then, he
              has choreographed major film and theater projects, working with
              some of today’s top directors, actors, and producers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
