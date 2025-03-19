"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import kebabIcon from "/public/assets/icons/kebab.svg";
import rightArrow from "/public/assets/icons/arrow-right.svg";
import playIcon from "/public/assets/icons/play.svg";
import clockIcon from "/public/assets/icons/clock.svg";
import PlaylistModal from "../PlaylistModal/PlaylistModal";
import { Playlist } from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import styles from "./PlayListCard.module.scss";

export default function PlayListCard({
  playlist,
  refreshSavedPrograms,
}: {
  playlist: Playlist;
  refreshSavedPrograms?: () => void;
}) {
  const router = useRouter();
  const [isOpenModal, setIsOpenModal] = useState(false);

  function handleNavigate() {
    if (playlist.type === "savedProgram") {
      const routeName = playlist.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[%\.]/g, ""); // Clean up title for the route

      router.push(`/dashboard/${routeName}/${playlist.id}/videos`);
    } else {
      router.push(`/dashboard/library/${playlist.id}`);
    }
  }

  return (
    <article className={styles.card}>
      <div className={styles.card__headerContainer}>
        <header>
          <h2 className={styles.card__title}>{playlist.title}</h2>
          <p className={styles.card__description}>
            {playlist.description || "No description available"}
          </p>
        </header>
        <button
          className={styles.button}
          aria-label="Playlist actions menu"
          onClick={() => setIsOpenModal(true)}
        >
          <Image src={kebabIcon} alt="" />
        </button>
      </div>
      <div className={styles.card__infoContainer}>
        <div className={styles.info}>
          <span>
            <Image src={playIcon} alt="" className={styles.icon} />
            <span>[num] Videos</span>
          </span>
          <span>
            <Image src={clockIcon} alt="" className={styles.icon} />
            <span>[num] mins</span>
          </span>
        </div>
        <button
          className={styles.button}
          onClick={handleNavigate} // ✅ Fix: Pass function directly
          aria-label="Go to playlist"
        >
          <Image src={rightArrow} alt="" className={styles.icon} />
        </button>
      </div>
      {isOpenModal && (
        <PlaylistModal
          setIsOpen={setIsOpenModal}
          playlist={playlist}
          refreshSavedPrograms={refreshSavedPrograms}
        />
      )}
    </article>
  );
}
