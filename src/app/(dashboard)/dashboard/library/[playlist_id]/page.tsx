"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios, { isAxiosError } from "axios";
import defaultThumbnail from "/public/assets/images/defaultPlaylistThumbnail.png";
import loadingSpinner from "/public/assets/gifs/spinner.svg";
import leftArrowIcon from "/public/assets/icons/chevron-left-white.svg";
import leftArrow from "/public/assets/icons/arrow-left.svg";
import kebabIcon from "/public/assets/icons/kebab-white.svg";
import playIcon from "/public/assets/icons/play-red.svg";
import playFilledIcon from "/public/assets/icons/play-fill.svg";
import clockIcon from "/public/assets/icons/clock-red.svg";
import { playlistDuration } from "@/components/pages/library/PlayListCard/PlayListCard";
import { Playlist, usePlaylists } from "../../context/PlaylistContext";
import PlaylistVideos from "@/components/pages/dashboard/PlaylistVideos/PlaylistVideos";
import PlaylistModal from "@/components/pages/library/PlaylistModal/PlaylistModal";
import styles from "./page.module.scss";

export interface PlaylistVideo {
  description: string | null;
  duration: number;
  id: number;
  position: number;
  thumbnail_url: string;
  title: string;
  vimeo_video_id: string;
}

export default function PlaylistPage() {
  const { playlist_id } = useParams<{ playlist_id: string }>()!;
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

  const [isOpenModal, setIsOpenModal] = useState(false); // ⚠️ B-only

  useEffect(() => {
    async function getPlaylistData() {
      setLoading(true);
      try {
        const response = await axios.get(`/api/playlists/${playlist_id}`, {
          headers: { "x-user-id": userId },
        });

        setPlaylist(response.data.playlist);
        setPlaylistVideos(response.data.videos);

        fetchLastProgress();
      } catch (error) {
        if (isAxiosError(error) && error.status === 404) {
          router.push("/dashboard/library");
        }
        console.error(`❌ Unable to retrieve playlist:`, error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchLastProgress() {
      try {
        const res = await axios.get(
          `/api/playlists/progress?playlist_id=${playlist_id}`,
          {
            headers: { "x-user-id": userId },
          }
        );

        setProgress(res.data);
      } catch (error) {
        console.error("❌ Failed to fetch last progress:", error);
      }
    }

    if (userId) {
      getPlaylistData();
    }
  }, [playlists, playlist_id, userId]);

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
    // Check if there is saved progress
    if (progress.video_id) {
      console.log("✅ Resuming from last watched video:", progress.video_id);
      router.push(
        `/dashboard/playlistplayer/${playlist.id}?video_id=${progress.video_id}&progress=${progress.progress_seconds}`
      );
    } else {
      // No progress, start from the first video in the (possibly reordered) list
      const startVideo = playlistVideos[0];
      console.log(
        "🎬 Starting from the first video in the list:",
        startVideo.id
      );
      router.push(
        `/dashboard/playlistplayer/${playlist.id}?video_id=${startVideo.id}&progress=0`
      );
    }
  }

  const duration = playlistDuration(
    playlistVideos.reduce((prev, curr) => prev + curr.duration, 0)
  );

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        {/* Back buttons */}
        <button
          aria-label="Navigate back"
          className={`${styles.hero__button} ${styles["hero__button--desktop"]}`}
          onClick={() => router.push("/dashboard/library")}
        >
          <Image
            src={leftArrow}
            alt=""
            className={styles.hero__icon}
            aria-hidden="true"
          />
          <span>Back</span>
        </button>
        <button
          aria-label="Navigate back"
          className={`${styles.hero__button} ${styles["hero__button--back"]}`}
          onClick={() => router.push("/dashboard/library")}
        >
          <Image
            src={leftArrowIcon}
            alt=""
            className={styles.hero__icon}
            aria-hidden="true"
          />
        </button>

        <div className={styles.playlist__info}>
          {/* Playlist thumbnail */}
          <div className={styles["hero__image-container"]}>
            {/* {playlist.title} */}
            <Image
              src={
                playlistVideos.length > 0
                  ? playlistVideos[0].thumbnail_url
                  : defaultThumbnail
              }
              alt={`Thumbnail for ${playlist.title} playlist`}
              fill
              sizes="(max-width: 1279px) 100%, 312px"
              style={{ objectFit: "contain" }}
              className={styles.hero__image}
            />
          </div>

          {/* Title, options, meta, CTA */}
          <div className={styles.hero__actions}>
            {!loading && (
              <header className={styles.hero__header}>
                <div className={styles["hero__title-container"]}>
                  <h1 className={styles.hero__title}>{playlist.title}</h1>
                  <button
                    id="menu"
                    aria-label={`View Options for ${playlist.title} playlist`}
                    className={`${styles.hero__button} ${styles["hero__button--menu"]}`}
                    onClick={() => setIsOpenModal(!isOpenModal)}
                  >
                    <Image
                      id="menu-icon"
                      src={kebabIcon}
                      alt=""
                      className={`${styles.hero__icon} ${styles["hero__icon--options"]}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpenModal && (
                    <PlaylistModal
                      setIsOpen={setIsOpenModal}
                      playlist={playlist}
                    />
                  )}
                </div>

                {playlist.description && (
                  <p className={styles.hero__description}>
                    {playlist.description}
                  </p>
                )}

                <div className={styles.hero__info}>
                  <span className={styles.hero__message}>
                    <Image
                      src={playIcon}
                      alt=""
                      className={styles.hero__icon}
                      aria-hidden="true"
                    />
                    <span>
                      {playlistVideos.length}{" "}
                      {playlistVideos.length === 1 ? "video" : "video"}
                    </span>
                  </span>
                  <span className={styles.hero__message}>
                    <Image
                      src={clockIcon}
                      alt=""
                      className={styles.hero__icon}
                      aria-hidden="true"
                    />
                    <span>{duration}</span>
                  </span>
                </div>
              </header>
            )}
            {/* CTA */}
            <button
              onClick={handleStartWorkout}
              className={`${styles.hero__button} ${
                styles["hero__button--begin"]
              } ${playlistVideos.length === 0 ? styles.disabled : ""}`}
              aria-label={`Play all videos in the ${playlist.title} playlist`}
              disabled={playlistVideos.length === 0}
            >
              <span>Play all</span>
              <Image
                src={playFilledIcon}
                alt=""
                className={styles.hero__icon}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </section>

      {/* Video list */}
      {loading ? (
        //If data has not yet been fetched, display loading spinner
        <div className={styles.loading}>
          <Image
            src={loadingSpinner}
            alt={`Workout videos in this playlist are loading`}
            width={36}
            height={36}
            className={styles.spinner}
          />
        </div>
      ) : (
        <>
          {playlistVideos.length > 0 ? (
            <PlaylistVideos
              videos={playlistVideos}
              setVideos={setPlaylistVideos}
              handleDelete={handleDeleteVideo}
              playlist_id={playlist_id}
              userId={userId}
            />
          ) : (
            <div className={styles.empty}>
              <p className={styles.empty__title}>No videos yet</p>
              <p className={styles.empty__message}>
                <span>
                  Scroll. Select.{" "}
                  <Link href="/dashboard" id={styles.link}>
                    Save.
                  </Link>
                </span>
                <span>Formulate your workout - one element at a time</span>
              </p>{" "}
            </div>
          )}
        </>
      )}
    </div>
  );
}
