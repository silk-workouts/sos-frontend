"use client";
import axios from "axios";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import leftArrowIcon from "/public/assets/icons/chevron-left.svg";
import editIcon from "/public/assets/icons/edit.svg";
import deleteIcon from "/public/assets/icons/trash.svg";
import playIcon from "/public/assets/icons/play.svg";
import playFilledIcon from "/public/assets/icons/play-fill.svg";
import clockIcon from "/public/assets/icons/clock.svg";
import { Playlist, usePlaylists } from "../../context/PlaylistContext";
import EditPlaylistModal from "@/components/pages/library/EditPlaylistModal/EditPlaylistModal";
import DeletePlaylistModal from "@/components/pages/library/DeletePlaylistModal/DeletePlaylistModal";
import PlaylistVideos from "@/components/pages/dashboard/PlaylistVideos/PlaylistVideos";
import styles from "./page.module.scss";

export interface PlaylistVideo {
  description: string | null;
  duration: number;
  id: number;
  position: number;
  thumbnail_url: string;
  title: string;
  vimeo_video_id: number;
}

export default function PlaylistPage() {
  const { playlist_id } = useParams();
  const { playlists, userId, refreshPlaylists } = usePlaylists();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState<Playlist>({
    created_at: "",
    description: "",
    id: "",
    title: "",
    user_id: "",
  });
  const [playlistVideos, setPlaylistVideos] = useState<PlaylistVideo[]>([]);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  useEffect(() => {
    async function getPlaylistVideos() {
      setLoading(true);
      try {
        const response = await axios.get(`/api/playlists/${playlist_id}`, {
          headers: { "x-user-id": userId },
        });
        setPlaylist(response.data.playlist);
        setPlaylistVideos(response.data.videos);
      } catch (error) {
        console.error(`Unable to retrieve videos for playlist: ${error}`);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      getPlaylistVideos();
    }
  }, [playlists, playlist_id, userId]);

  if (loading) {
    return <div>Loading playlists</div>;
  }

  function handleCloseDeleteModal() {
    setIsOpenDeleteModal(false);
  }

  function handleCloseEditModal() {
    setIsOpenEditModal(false);
  }

  async function handleDeletePlaylist() {
    try {
      await axios.delete(`/api/playlists/${playlist_id}`, {
        headers: { "x-user-id": userId },
      });

      router.push("/dashboard/library");
      refreshPlaylists();
      setIsOpenDeleteModal(false);
    } catch (error) {
      console.error(
        `Unable to delete playlist with id ${playlist_id}: ${error}`,
      );
    }
  }

  async function handleDeleteVideo(video_id: number) {
    try {
      await axios.delete(`/api/playlists/${playlist_id}/videos/${video_id}`, {
        headers: { "x-user-id": userId },
      });
      refreshPlaylists();
    } catch (error) {
      console.error(
        `Unable to delete playlist with id ${playlist_id}: ${error}`,
      );
    }
  }

  return (
    <div>
      <section className={styles.titleCard}>
        <div className={styles["titleCard__controls-container"]}>
          <button
            aria-label="Navigate back"
            className={styles.titleCard__button}
            onClick={() => router.back()}
          >
            <Image
              src={leftArrowIcon}
              alt=""
              className={`${styles.titleCard__icon} ${styles["titleCard__icon--back"]}`}
            />
          </button>
          <div className={styles.titleCard__controls}>
            <button
              aria-label="Edit playlist"
              className={styles.titleCard__button}
              onClick={() => setIsOpenEditModal(true)}
            >
              <Image src={editIcon} alt="" className={styles.titleCard__icon} />
            </button>
            <button
              aria-label="Delete playlist"
              className={styles.titleCard__button}
              onClick={() => setIsOpenDeleteModal(true)}
            >
              <Image
                src={deleteIcon}
                alt=""
                className={styles.titleCard__icon}
              />
            </button>
          </div>
        </div>
        <div className={styles["titleCard-content"]}>
          <div className={styles["titleCard__image-container"]}></div>
          <header>
            <h1 className={styles.titleCard__title}>{playlist.title}</h1>
            <div className={styles.titleCard__info}>
              <span className={styles.titleCard__message}>
                <Image
                  src={playIcon}
                  alt=""
                  className={styles.titleCard__icon}
                />
                <span>{playlistVideos.length} Videos</span>
              </span>
              <span className={styles.titleCard__message}>
                <Image
                  src={clockIcon}
                  alt=""
                  className={styles.titleCard__icon}
                />
                <span>[num] mins</span>
              </span>
            </div>
          </header>
          <p className={styles.titleCard__description}>
            {playlist.description}
          </p>
        </div>
        <button
          className={`${styles.titleCard__button} ${styles["titleCard__button--begin"]}`}
        >
          <span>begin workout</span>{" "}
          <Image
            src={playFilledIcon}
            alt=""
            className={styles.titleCard__icon}
          />
        </button>
      </section>
      <PlaylistVideos
        videos={playlistVideos}
        handleDelete={handleDeleteVideo}
      />
      {isOpenEditModal && (
        <EditPlaylistModal
          handleClose={handleCloseEditModal}
          playlist={playlist}
          userId={userId}
          refreshPlaylists={refreshPlaylists}
        />
      )}
      {isOpenDeleteModal && (
        <DeletePlaylistModal
          handleClose={handleCloseDeleteModal}
          handleDelete={handleDeletePlaylist}
        />
      )}
    </div>
  );
}
