import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import bookmarkUnsaved from "public/assets/icons/bookmark-unsaved.svg";
import AddPlaylistModal from "../AddPlaylistModal/AddPlaylistModal";
import { ChapterVideo } from "src/types/video";
import styles from "./Video.module.scss";

interface VideoProps {
  chapterVideo: ChapterVideo;
  display: string;
  path: string;
}

export default function Video({ chapterVideo, display, path }: VideoProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  //   console.log(chapterVideo, "chap vid");

  const fallbackThumbnail = "/default-thumbnail.jpg";
  const validThumbnail = chapterVideo.thumbnail_url?.startsWith("http")
    ? chapterVideo.thumbnail_url
    : fallbackThumbnail;

  const durationSeconds = chapterVideo.duration || 0;
  const minute = `${Math.floor(durationSeconds / 60) || "00"}`;
  const seconds = `${Math.floor(durationSeconds % 60)}`.padStart(2, "0");
  const duration = `${minute}:${seconds}`;

  console.log(chapterVideo, "chapVid");

  return (
    <article
      className={`${styles.card} ${
        display === "row" ? styles["card--row"] : ""
      }`}
    >
      <Link href={path} className={styles["card__thumbnail-container"]}>
        <Image
          src={validThumbnail}
          className={styles.thumbnail}
          alt={`A thumbnail image for ${chapterVideo.title} workout`}
          fill
          sizes="(max-width: 767px) 160px, (max-width: 1279px) 216px, 300px"
          style={{ objectFit: "cover" }}
        />
        <div className={styles.duration}>{duration}</div>
      </Link>

      <div
        className={`${styles.header} ${
          display === "row" ? styles["header--row"] : ""
        }`}
      >
        <h3 className={styles.title}>
          <Link href={path}>{chapterVideo.title.toLowerCase()}</Link>
        </h3>

        <button
          className={styles.menuButton}
          onClick={() => setIsModalOpen(!isModalOpen)}
          aria-label="Add Menu"
        >
          <Image src={bookmarkUnsaved} alt="Options" className={styles.icon} />
        </button>
      </div>

      {isModalOpen && (
        <AddPlaylistModal
          setIsOpen={setIsModalOpen}
          video_id={chapterVideo.real_vimeo_video_id}
        />
      )}
    </article>
  );
}
