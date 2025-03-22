"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { usePlaylists } from "../../context/PlaylistContext";
import Player from "@vimeo/player";
import axios from "axios";
import Image from "next/image";
import styles from "./page.module.scss";
import backArrowIcon from "/public/assets/icons/chevron-left.svg";
import bookmarkIcon from "/public/assets/icons/bookmark.svg";
import bookmarkUnsavedIcon from "/public/assets/icons/bookmark-unsaved.svg";

export default function PlaylistPlayerPage() {
  const router = useRouter();
  const { playlist_id } = useParams<{ playlist_id: string }>()!;
  const searchParams = useSearchParams()!;
  const { userId } = usePlaylists();

  const searchParamsVideoId = useSearchParams()!;
  const video_id =
    searchParamsVideoId.get("video_id") ??
    (() => {
      throw new Error("Missing video_id param");
    })();
  const progress_seconds = Number(searchParams.get("progress") ?? "0");

  const [playlist, setPlaylist] = useState<any | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [savedVideos, setSavedVideos] = useState<{ [key: string]: boolean }>(
    {}
  );
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  //  Fetch playlist and set initial video
  useEffect(() => {
    async function fetchPlaylist() {
      try {
        const res = await axios.get(`/api/playlists/${playlist_id}`, {
          headers: { "x-user-id": userId },
        });

        setPlaylist(res.data.playlist);
        setVideos(res.data.videos);

        const startingVideo =
          res.data.videos.find((v: any) => String(v.id) === video_id) ||
          res.data.videos[0];

        setActiveVideo({ ...startingVideo, progress_seconds });
      } catch (err) {
        console.error("❌ Failed to fetch playlist:", err);
      }
    }

    if (userId) fetchPlaylist();
  }, [playlist_id, userId]);

  // Setup / Update player
  useEffect(() => {
    if (!playerContainerRef.current || !activeVideo) return;

    if (vimeoPlayerRef.current) {
      vimeoPlayerRef.current.destroy().catch(console.error);
      vimeoPlayerRef.current = null;
    }

    const player = new Player(playerContainerRef.current, {
      id: activeVideo.vimeo_video_id,
      responsive: true,
      autoplay: true,
    });

    vimeoPlayerRef.current = player;

    player
      .ready()
      .then(() => {
        if (activeVideo.progress_seconds > 0) {
          player
            .setCurrentTime(activeVideo.progress_seconds)
            .catch(console.error);
        }
        lastUpdateTimeRef.current = 0;
        attachPlayerListeners(player);
      })
      .catch((err) => console.error("❌ Player.ready() failed:", err));
  }, [activeVideo]);

  function attachPlayerListeners(player: Player) {
    player.on("timeupdate", async (data) => {
      const currentTime = Math.floor(data.seconds);

      if (currentTime - lastUpdateTimeRef.current >= 5) {
        lastUpdateTimeRef.current = currentTime;

        try {
          await axios.put(
            "/api/playlists/progress",
            {
              playlist_id,
              video_id: activeVideo.id,
              progress_seconds: currentTime,
            },
            { headers: { "x-user-id": userId } }
          );
        } catch (err) {
          console.error("❌ Failed to update progress:", err);
        }
      }
    });

    player.on("ended", async () => {
      await saveProgress(activeVideo.id, lastUpdateTimeRef.current);
      const nextIndex = videos.findIndex((v) => v.id === activeVideo.id) + 1;
      if (nextIndex < videos.length) {
        const nextVideo = videos[nextIndex];
        setActiveVideo({ ...nextVideo, progress_seconds: 0 });
        lastUpdateTimeRef.current = 0;
      }
    });
  }

  async function handleVideoClick(video: any) {
    if (activeVideo) {
      await saveProgress(activeVideo.id, lastUpdateTimeRef.current);
    }
    setActiveVideo({ ...video, progress_seconds: 0 });
    lastUpdateTimeRef.current = 0;
  }

  async function saveProgress(videoId: number, progress: number) {
    if (!videoId || progress <= 0) return;
    try {
      await axios.put(
        "/api/playlists/progress",
        {
          playlist_id,
          video_id: videoId,
          progress_seconds: progress,
        },
        { headers: { "x-user-id": userId } }
      );
    } catch (err) {
      console.error("❌ Failed to save progress:", err);
    }
  }

  function handleBookmark(videoId: number) {
    setSavedVideos((prev) => {
      const isSaved = !prev[videoId];
      return { ...prev, [videoId]: isSaved };
    });
  }

  if (!playlist || !activeVideo) return <div>Loading...</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentArea}>
        <button
          onClick={() => router.back()}
          className={styles.backButton}
          aria-label="Go back"
        >
          <Image src={backArrowIcon} alt="Back" width={24} height={24} />
        </button>

        <div ref={playerContainerRef} className={styles.playerContainer} />

        <div className={styles.videoDetails}>
          <h2 className={styles.playlistTitle}>{playlist.title}</h2>
          <div className={styles.videoHeader}>
            <h3 className={styles.videoTitle}>{activeVideo.title}</h3>

            <button
              onClick={() => handleBookmark(activeVideo.id)}
              className={styles.bookmarkButton}
              aria-label="Save video"
            >
              <Image
                src={
                  savedVideos[activeVideo.id]
                    ? bookmarkIcon
                    : bookmarkUnsavedIcon
                }
                alt="Bookmark"
                className={styles.bookmarkIcon}
              />
            </button>
          </div>
          <p className={styles.videoDescription}>{activeVideo.description}</p>
        </div>
      </div>

      <div className={styles.videoList}>
        <p className={styles.videoListTitle}>Up Next</p>
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => handleVideoClick(video)}
            className={`${styles.thumbnailCard} ${
              activeVideo.id === video.id ? styles.active : ""
            }`}
          >
            <img
              src={video.thumbnail_url || "/default-thumbnail.jpg"}
              alt={video.title}
              className={styles.thumbnailImage}
            />
            <div className={styles.videoInfo}>
              <p className={styles.videoTitle}>{video.title}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBookmark(video.id);
              }}
              className={styles.bookmarkButton}
              aria-label="Save video"
            >
              <Image
                src={savedVideos[video.id] ? bookmarkIcon : bookmarkUnsavedIcon}
                alt="Bookmark"
                className={styles.bookmarkIcon}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
