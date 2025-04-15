import Image, { StaticImageData } from "next/image";
import Element from "@/components/Element/Element";
import styles from "./ElementCard.module.scss";

interface ElementInfo {
  element: string;
  content: string;
  imageSrc: StaticImageData;
  imageAlt: string;
}

export default function ElementCard({
  element,
  content,
  imageSrc,
  imageAlt,
}: ElementInfo) {
  return (
    <article className={styles.card}>
      <div className={styles.card__info}>
        <Element name={element} />
        <Image
          src={imageSrc}
          alt={imageAlt}
          className={`${styles.card__hideDesktop} ${styles.card__hideDesktop}`}
          unoptimized
        />
        <p className={styles.card__message}>{content}</p>
      </div>
      <Image
        src={imageSrc}
        alt={imageAlt}
        className={`${styles.card__image} ${styles.card__hideMobile}`}
        unoptimized
      />
    </article>
  );
}
