import { useState } from "react";
import Image from "next/image";
import bookmarkIcon from "/public/assets/icons/bookmark-fill.svg";
import bookmarkUnsavedIcon from "/public/assets/icons/bookmark-unsaved.svg";
import playIcon from "/public/assets/icons/play-fill.svg";
import playIcon_white from "/public/assets/icons/play-white.svg";
import grabIcon from "/public/assets/icons/grab.svg";
import { PlayerVideo } from "src/app/(dashboard)/dashboard/playlistplayer/[playlist_id]/page";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AddPlaylistModalPortal from "../AddPlaylistModal/AddPlaylistModalPortal";
import { usePlaylists } from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import styles from "./SortablePlaylistPlayerVideo.module.scss";

interface SortableVideoProps {
  video: PlayerVideo;
  activeId: UniqueIdentifier | undefined;
  activeVideo: PlayerVideo;
  handleVideoClick: (arg1: PlayerVideo) => Promise<void>;
  videos: PlayerVideo[];
}

export default function SortablePlaylistPlayerVideo({
  video,
  activeId,
  activeVideo,
  handleVideoClick,
  videos,
}: SortableVideoProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { playlistVideoMap } = usePlaylists();

  const { listeners, setNodeRef, setActivatorNodeRef, transform, transition } =
    useSortable({ id: video.id, data: { video } });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const minute = `${Math.floor(video.duration / 60) || "00"}`;
  const seconds = `${Math.floor(video.duration % 60)}`.padStart(2, "0");
  const duration = `${minute}:${seconds}`;

  return (
    <li
      ref={setNodeRef}
      role="listitem"
      style={style}
      onClick={() => handleVideoClick(video)}
      className={`${styles.thumbnailCard} ${
        activeVideo.id === video.id ? styles.active : ""
      } ${activeId === video.id ? styles.grab : ""}`}
    >
      <button
        aria-label="Grab to reorder video in playlist"
        className={styles.grabButton}
        ref={setActivatorNodeRef}
        {...listeners}
      >
        <Image
          src={grabIcon}
          alt=""
          aria-hidden="true"
          className={styles.icon}
        />
      </button>

      <span
        aria-label={`Currently playing ${activeVideo.title} video`}
        className={styles.playContainer}
      >
        <Image
          src={playIcon}
          alt=""
          aria-hidden="true"
          className={styles.icon}
        />
      </span>

      <span className={styles.positionContainer}>
        {videos.findIndex((playlistVideo) => video.id === playlistVideo.id) + 1}
      </span>
      <div className={styles.header}>
        <div className={styles.thumbnailContainer}>
          <Image
            src={video.thumbnail_url || "/assets/images/default-thumbnail.jpg"}
            alt={`A thumbnail image for the ${video.title} workout`}
            className={styles.thumbnailImage}
            fill
            sizes="(max-width: 767px) 160px,(max-width: 1279px) 216px, 160px"
            style={{ objectFit: "cover" }}
          />
          <div className={styles.duration}>{duration}</div>
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
        </div>
        <p className={styles.videoTitle}>{video.title.toLowerCase()}</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        className={styles.bookmarkButton}
        aria-label="Save video"
      >
        <Image
          src={
            playlistVideoMap[video.vimeo_video_id]
              ? bookmarkIcon
              : bookmarkUnsavedIcon
          }
          alt="Bookmark"
          className={styles.icon}
        />
      </button>

      {isModalOpen && (
        <AddPlaylistModalPortal
          setIsOpen={setIsModalOpen}
          video_id={video.vimeo_video_id}
        />
      )}
    </li>
  );
}
