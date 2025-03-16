import Image from "next/image";
import Link from "next/link";
import kebabIcon from "/public/assets/icons/kebab.svg";
import { ShowcaseVideo } from "../VideoList/VideoList";
import AddToModal from "@/components/pages/dashboard/AddToModal/AddToModal";
import { useState } from "react";

import styles from "./Video.module.scss";

interface VideoProps {
  showcaseVideo: ShowcaseVideo;
  display: string;
  path: string;
}

export default function Video({ showcaseVideo, display, path }: VideoProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fallbackThumbnail = "/default-thumbnail.jpg";

  return (
    <article
      className={`${styles.card} ${
        display === "row" ? styles["card--row"] : ""
      }`}
    >
      <Link href={path}>
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
          unoptimized
        />
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
          aria-label="Add Menu"
        >
          <Image src={kebabIcon} alt="Options" />
        </button>
      </div>

      <AddToModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        video_id={showcaseVideo.vimeo_video_id}
      />
    </article>
  );
}
