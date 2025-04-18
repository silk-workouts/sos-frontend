"use client";

import axios, { isAxiosError } from "axios";
import Image from "next/image";
import Player from "@vimeo/player";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import loadingSpinner from "/public/assets/gifs/spinner.svg";
import backArrowIcon from "/public/assets/icons/arrow-left.svg";
import { Playlist, usePlaylists } from "../../context/PlaylistContext";
import { PlaylistVideo } from "../../library/[playlist_id]/page";
import styles from "./page.module.scss";
import PlaylistPlayerVideos from "@/components/pages/dashboard/PlaylistPlayerVideos/PlaylistPlayerVideos";

export interface PlayerVideo extends PlaylistVideo {
  playlist_id: string;
  progress_seconds: number;
}

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

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [videos, setVideos] = useState<PlayerVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<PlayerVideo | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const videosRef = useRef<PlayerVideo[]>([]);

  useEffect(() => {
    videosRef.current = videos;
  }, [videos]);

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
          res.data.videos.find((v: PlayerVideo) => String(v.id) === video_id) ||
          res.data.videos[0];

        setActiveVideo({ ...startingVideo, progress_seconds });
      } catch (err) {
        if (isAxiosError(err) && err.status === 404) {
          router.push("/dashboard/library");
        }
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

  useEffect(() => {
    async function handleBeforeUnload(event: BeforeUnloadEvent) {
      console.log(
        "🔄 Page refresh or close detected. Updating URL with latest progress."
      );

      try {
        // Fetch the latest progress from the API
        const res = await axios.get(
          `/api/playlists/progress?playlist_id=${playlist_id}`,
          { headers: { "x-user-id": userId } }
        );

        const latestProgress = res.data.progress_seconds;
        const latestVideoId = res.data.video_id;

        console.log(
          "📥 Latest progress fetched before unload:",
          latestProgress
        );

        // Update the URL with the latest video ID and progress
        const newUrl = `/dashboard/playlistplayer/${playlist_id}?video_id=${latestVideoId}&progress=${latestProgress}`;
        console.log("🌐 Redirecting to latest progress URL:", newUrl);

        // Prevent the default unload to allow redirect
        event.preventDefault();
        event.returnValue = "";
        window.location.replace(newUrl);
      } catch (err) {
        console.error("❌ Failed to update URL before unload:", err);
      }
    }

    // Attach event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Clean up event listener on unmount
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [playlist_id, userId]);

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
              video_id: activeVideo?.id,
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
      if (activeVideo) {
        await saveProgress(activeVideo.id, lastUpdateTimeRef.current);

        // Find the current index of the active video in the updated videos list
        const currentVideos = videosRef.current;

        // Find the current index of the active video in the latest video order
        const currentIndex = currentVideos.findIndex(
          (v) => v.id === activeVideo.id
        );

        // Determine the next video based on the updated order
        const nextVideo =
          currentVideos[(currentIndex + 1) % currentVideos.length];

        // Only update if the next video exists (avoid looping back if not desired)
        if (nextVideo) {
          setActiveVideo({ ...nextVideo, progress_seconds: 0 });
          lastUpdateTimeRef.current = 0;
        }
      }
    });
  }

  async function handleVideoClick(video: PlayerVideo) {
    if (activeVideo) {
      await saveProgress(activeVideo.id, lastUpdateTimeRef.current);
    }
    setActiveVideo({ ...video, progress_seconds: 0 });
    lastUpdateTimeRef.current = 0;
  }

  async function saveProgress(videoId: number, progress: number) {
    console.log(
      "💾 Attempting to save progress: Video ID:",
      videoId,
      "Progress:",
      progress
    );

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

  if (!playlist || !activeVideo)
    return (
      <div className={styles.loading}>
        <Image
          src={loadingSpinner}
          alt={`Playlist videos are loading`}
          width={36}
          height={36}
          className={styles.spinner}
        />
      </div>
    );

  const activeVideoPosition =
    videos.findIndex((video) => video.id === activeVideo.id) + 1;

  function updateVideoOrder(newOrder: PlayerVideo[]) {
    setVideos(newOrder);
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentArea}>
        <button
          onClick={() => router.push(`/dashboard/library/${playlist.id}`)}
          className={styles.backButton}
          aria-label="Exit workout"
        >
          <Image
            src={backArrowIcon}
            alt=""
            aria-hidden="true"
            className={styles.backButton__icon}
          />{" "}
          <span>Exit workout</span>
        </button>

        <div ref={playerContainerRef} className={styles.playerContainer} />

        <div className={styles.videoDetails}>
          <h1 className={styles.playlistTitle}>{playlist.title}</h1>

          <h2 className={styles.activeVideoTitle}>
            {activeVideo.title.toLowerCase()}
          </h2>

          <p className={styles.videoDescription}>{activeVideo.description}</p>
        </div>
      </div>
      <PlaylistPlayerVideos
        videos={videos}
        handleVideoClick={handleVideoClick}
        activeVideo={activeVideo}
        activeVideoPosition={activeVideoPosition}
        playlist_id={playlist_id}
        userId={userId}
        setVideos={setVideos}
        updateVideoOrder={updateVideoOrder}
      />
    </div>
  );
}
