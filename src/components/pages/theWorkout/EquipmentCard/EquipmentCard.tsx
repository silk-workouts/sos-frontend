"use client";
import Image, { StaticImageData } from "next/image";
import Button from "@/components/ui/Button/Button";
import styles from "./EquipmentCard.module.scss";

interface EquipmentInfo {
  imageSrc: StaticImageData;
  imageAlt: string;
  title: string;
  content: string;
  link: string;
}

export default function EquipmentCard({
  link,
  title,
  content,
  imageSrc,
  imageAlt,
}: EquipmentInfo) {
  const handleOpenShop = () => {
    window.open(`${link}`, "_blank");
  };
  return (
    <article className={styles.card}>
      <Image
        src={imageSrc}
        alt={imageAlt}
        className={styles.card__image}
        width={250}
      />
      <div className={styles.card__content}>
        <h3 className={styles.card__title}>{title}</h3>
        <p className={styles.card__description}>{content}</p>

        <Button
          onClick={handleOpenShop}
          variant="secondary"
          className={styles.card__button}
        >
          shop
        </Button>
      </div>
    </article>
  );
}
