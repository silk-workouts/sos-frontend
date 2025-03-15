"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import kebabIcon from "/public/assets/icons/kebab.svg";
import rightArrow from "/public/assets/icons/arrow-right.svg";
import playIcon from "/public/assets/icons/play.svg";
import clockIcon from "/public/assets/icons/clock.svg";
import { Playlist } from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import PlaylistModal from "../PlaylistModal/PlaylistModal";
import styles from "./LibraryPageContent.module.scss";

interface LibraryContentProps {
  playlists: Playlist[];
}

export default function LibraryPageContent({ playlists }: LibraryContentProps) {
  return (
    <ul className={styles.list}>
      {playlists.map((playlist) => {
        return (
          <li key={playlist.id} className={styles.list__item}>
            <PlayListCard playlist={playlist} />
          </li>
        );
      })}
    </ul>
  );
}

function PlayListCard({ playlist }: { playlist: Playlist }) {
  const router = useRouter();
  const [isOpenModal, setIsOpenModal] = useState(false);

  function handlePlaylistNavigation(id: string) {
    router.push(`/dashboard/library/${id}`);
  }
  return (
    <article className={styles.card}>
      <div className={styles.card__headerContainer}>
        <header>
          <h2 className={styles.card__title}>{playlist.title}</h2>
          <p className={styles.card__description}>{playlist.description}</p>
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
          onClick={() => handlePlaylistNavigation(playlist.id)}
          aria-label="Go to playlist"
        >
          <Image src={rightArrow} alt="" className={styles.icon} />
        </button>
      </div>
      {isOpenModal && (
        <PlaylistModal setIsOpen={setIsOpenModal} playlist={playlist} />
      )}
    </article>
  );
}
