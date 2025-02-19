import Image from "next/image";
import accentImage from "/public/assets/images/about-ringwin.png";
import featureImage from "/public/assets/images/about-speedbag.png";
import newspaperImage from "/public/assets/images/about-newspaper.png";
import styles from "./page.module.scss";

export default function About() {
  return (
    <div className={styles.container}>
      <section className={styles.heroSection}>
        <h1 className="heroTitle">The Godfather of Boxing for Fitness</h1>
      </section>

      <section className={styles.experienceSection}>
        <div className={styles.experienceContent}>
          <div className={styles.textBlock}>
            <h2 className={`h2-title ${styles.title}`}>
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
              boxing fitness gyms you see all over the world today.
            </p>
          </div>
        </div>

        <Image
          className={styles.accentImage}
          src={accentImage}
          alt="Accent Image"
        />
      </section>
      <section className={styles.featuredImage}>
        <Image src={featureImage} alt="Featured Image" />
      </section>
      <section className={styles.bioSection}>
        <div className={styles.bioContent}>
          <Image
            className={styles.newsImage}
            src={newspaperImage}
            alt="Newspaper Image"
          />
          <div className={styles.textBlock}>
            <h2 className={`h2-title ${styles.title}`}>
              <span className="bold">More</span> about Michael
            </h2>
            <p className="body1">
              Currently, with his unrivaled knowledge of boxing, movement and
              teaching non-boxers how to box, Michael is the boxing
              choreographer helping to bring “ALI THE MUSICAL” to Broadway in
              2025. But it was at 16 years of age that Michael “Silk” Olajide
              Jr. began his career as a PROFESSIONAL BOXER. He was a highly
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
