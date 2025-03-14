import Image from "next/image";
import kebabIcon from "/public/assets/icons/kebab.svg";
import Link from "next/link";
import { ShowcaseVideo } from "../VideoList/VideoList";
import styles from "./Video.module.scss";

interface VideoProps {
  showcaseVideo: ShowcaseVideo;
  display: string;
  isModalOpen: boolean;
  setIsModalOpen: (arg1: boolean) => void;
  path: string;
}

export default function Video({
  showcaseVideo,
  display,
  isModalOpen,
  setIsModalOpen,
  path,
}: VideoProps) {
  const fallbackThumbnail = "/default-thumbnail.jpg";

  return (
    <article
      className={`${styles.card} ${
        display === "row" ? styles["card--row"] : ""
      }`}
    >
      <Link href={path}>
        <div className={styles.thumbnailContainer}>
          <Image
            src={
              showcaseVideo.thumbnail_url?.startsWith("http")
                ? showcaseVideo.thumbnail_url
                : fallbackThumbnail
            }
            className={styles.thumbnail}
            alt={`Thumbnail for ${showcaseVideo.title}`}
            width={132}
            height={74}
            unoptimized // ✅ Important to prevent Next.js from touching Vimeo URLs
          />
        </div>
      </Link>

      <div
        className={`${styles.header} ${
          display === "row" ? styles["header--row"] : ""
        }`}
      >
        <h3 className={styles.title}>
          <Link href={path}>{showcaseVideo.title}</Link>
        </h3>

        <button
          className={styles.menuButton}
          onClick={() => setIsModalOpen(!isModalOpen)}
        >
          <Image src={kebabIcon} alt="Options" />
        </button>
      </div>
    </article>
  );
}
