import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import bookmarkIcon from "public/assets/icons/bookmark-fill.svg";
import bookmarkUnsaved from "public/assets/icons/bookmark-unsaved.svg";
import playIcon from "/public/assets/icons/play-fill.svg";
import playIcon_white from "/public/assets/icons/play-white.svg";
import AddPlaylistModalPortal from "../AddPlaylistModal/AddPlaylistModalPortal";
import { ChapterVideo } from "src/types/video";
import { usePlaylists } from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import styles from "./Video.module.scss";

interface VideoProps {
  chapterVideo: ChapterVideo;
  display: string;
  path: string;
  type?: "player";
  active?: boolean;
}

export default function Video({
  chapterVideo,
  display,
  path,
  type,
  active,
}: VideoProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { playlistVideoMap } = usePlaylists();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Pad with leading zeros if necessary
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${minutes}:${formattedSeconds}`;
  };

  return (
    <article
      className={`${styles.card} ${display === "row" ? styles.row : ""}  ${
        type === "player" ? styles.player : ""
      } ${active === true ? styles.active : ""}`}
    >
      {type === "player" && (
        <span className={styles.positionContainer}>
          {chapterVideo.position + 1}
        </span>
      )}

      {type === "player" && active && (
        <span
          aria-label={`Currently playing ${chapterVideo.title} video`}
          className={styles.playContainer}
        >
          <Image
            src={playIcon}
            alt=""
            aria-hidden="true"
            className={`${styles.icon} ${styles.playIcon}`}
          />
        </span>
      )}
      <Link
        href={path}
        className={`${styles["card__thumbnail-container"]} ${
          display === "row" ? styles.row : ""
        }  ${type === "player" ? styles.player : ""}`}
      >
        <Image
          src={
            chapterVideo.thumbnail_url || "/assets/images/default-thumbnail.jpg"
          }
          className={styles.thumbnail}
          alt={`A thumbnail image for ${chapterVideo.title} workout`}
          fill
          sizes="(max-width: 767px) 160px, (max-width: 1279px) 216px, 300px"
          style={{ objectFit: "cover" }}
        />
        <div className={styles.duration}>
          {formatDuration(chapterVideo.duration)}
        </div>
        <div className={styles.overlay}>
          <div className={styles["overlay-container"]}>
            <Image
              src={playIcon_white}
              alt=""
              aria-hidden="true"
              className={styles.overlay__icon}
            />
          </div>
        </div>
      </Link>

      <div
        className={`${styles.header} ${display === "row" ? styles.row : ""}`}
      >
        <h3
          className={`${styles.title}  ${
            type === "player" ? styles.player : ""
          }`}
        >
          <Link href={path}>{chapterVideo.title.toLowerCase()}</Link>
        </h3>

        <button
          className={`${styles.menuButton}  ${
            type === "player" ? styles.player : ""
          }`}
          onClick={() => setIsModalOpen(!isModalOpen)}
          aria-label="Add Menu"
        >
          <Image
            src={
              playlistVideoMap[chapterVideo.real_vimeo_video_id]
                ? bookmarkIcon
                : bookmarkUnsaved
            }
            alt="Options"
            className={`${styles.icon}  ${
              type === "player" ? styles.player : ""
            }`}
          />
        </button>
      </div>

      {isModalOpen && (
        <AddPlaylistModalPortal
          setIsOpen={setIsModalOpen}
          video_id={chapterVideo.real_vimeo_video_id}
        />
      )}
    </article>
  );
}
