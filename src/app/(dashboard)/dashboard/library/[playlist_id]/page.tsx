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
  const { playlist_id } = useParams<{ playlist_id: string }>();
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
  const [progress, setProgress] = useState<{
    video_id: string | null;
    progress_seconds: number;
  }>({
    video_id: null,
    progress_seconds: 0,
  });

  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  // ✅ Fetch playlist videos & progress
  useEffect(() => {
    async function getPlaylistData() {
      setLoading(true);
      try {
        console.log(`📥 Fetching playlist & videos for ${playlist_id}...`);
        const response = await axios.get(`/api/playlists/${playlist_id}`, {
          headers: { "x-user-id": userId },
        });

        setPlaylist(response.data.playlist);
        setPlaylistVideos(response.data.videos);

        // ✅ Fetch last progress
        fetchLastProgress();
      } catch (error) {
        console.error(`❌ Unable to retrieve playlist:`, error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchLastProgress() {
      try {
        console.log(`📥 Fetching last progress for playlist ${playlist_id}...`);
        const res = await axios.get(
          `/api/playlists/progress?playlist_id=${playlist_id}`,
          {
            headers: { "x-user-id": userId },
          }
        );

        console.log("✅ Received progress:", res.data);
        setProgress(res.data);
      } catch (error) {
        console.error("❌ Failed to fetch last progress:", error);
      }
    }

    if (userId) {
      getPlaylistData();
    }
  }, [playlists, playlist_id, userId]);

  if (loading) {
    return <div>Loading playlists...</div>;
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
      console.error(`❌ Unable to delete playlist:`, error);
    }
  }

  async function handleDeleteVideo(video_id: number) {
    try {
      await axios.delete(`/api/playlists/${playlist_id}/videos/${video_id}`, {
        headers: { "x-user-id": userId },
      });
      refreshPlaylists();
    } catch (error) {
      console.error(`❌ Unable to delete video:`, error);
    }
  }

  function handleStartWorkout() {
    router.push(
      `/dashboard/playlistplayer/${playlist.id}?video_id=${progress.video_id}&progress=${progress.progress_seconds}`
    );
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
          onClick={handleStartWorkout}
          className={`${styles.titleCard__button} ${styles["titleCard__button--begin"]}`}
        >
          <span>Begin Workout</span>
          <Image
            src={playFilledIcon}
            alt=""
            className={styles.titleCard__icon}
          />
        </button>
      </section>
      <PlaylistVideos
        videos={playlistVideos}
        setVideos={setPlaylistVideos} // ✅ Added from B
        handleDelete={handleDeleteVideo}
        playlist_id={playlist_id} // ✅ Added from B
        userId={userId} // ✅ Added from B
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
