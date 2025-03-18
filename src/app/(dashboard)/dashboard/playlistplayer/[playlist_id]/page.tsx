"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { usePlaylists } from "../../context/PlaylistContext";
import Player from "@vimeo/player";
import axios from "axios";
import styles from "./page.module.scss";

export default function PlaylistPlayerPage() {
  const { playlist_id } = useParams<{ playlist_id: string }>();
  const searchParams = useSearchParams();
  const { userId } = usePlaylists();

  const video_id = searchParams.get("video_id");
  const progress_seconds = Number(searchParams.get("progress") || 0);

  const [playlist, setPlaylist] = useState<any | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // ✅ Fetch playlist and set initial video
  useEffect(() => {
    async function fetchPlaylist() {
      try {
        console.log(`📥 Fetching playlist ${playlist_id}...`);
        const res = await axios.get(`/api/playlists/${playlist_id}`, {
          headers: { "x-user-id": userId },
        });

        setPlaylist(res.data.playlist);
        setVideos(res.data.videos);

        // ✅ Set active video from passed progress
        const startingVideo =
          res.data.videos.find((v: any) => String(v.id) === video_id) ||
          res.data.videos[0];

        console.log(
          `⏩ Starting video: ${startingVideo.title} at ${progress_seconds} sec`
        );
        setActiveVideo({ ...startingVideo, progress_seconds });
      } catch (err) {
        console.error("❌ Failed to fetch playlist:", err);
      }
    }

    if (userId) fetchPlaylist();
  }, [playlist_id, userId]);

  // ✅ Setup / Update player
  useEffect(() => {
    if (!playerContainerRef.current || !activeVideo) return;

    console.log(`🎥 Creating new player for: ${activeVideo.title}`);

    if (vimeoPlayerRef.current) {
      console.log("🔥 Destroying previous player...");
      vimeoPlayerRef.current.destroy().catch(console.error);
      vimeoPlayerRef.current = null;
    }

    const player = new Player(playerContainerRef.current, {
      id: activeVideo.vimeo_video_id,
      responsive: true,
      autoplay: true,
    });

    vimeoPlayerRef.current = player;
    console.log("✅ Vimeo player instance created:", vimeoPlayerRef.current);

    player
      .ready()
      .then(() => {
        console.log("🎯 Player is READY!");
        if (activeVideo.progress_seconds > 0) {
          console.log(`⏩ Resuming at ${activeVideo.progress_seconds} sec`);
          player
            .setCurrentTime(activeVideo.progress_seconds)
            .catch(console.error);
        }

        // ✅ Reset update time to ensure correct tracking
        lastUpdateTimeRef.current = 0;

        // ✅ Attach event listeners
        attachPlayerListeners(player);
      })
      .catch((err) => {
        console.error("❌ Player.ready() failed:", err);
      });
  }, [activeVideo]);

  // ✅ Attach event listeners (ensures listeners are only added once)
  function attachPlayerListeners(player: Player) {
    console.log("🎬 Attaching event listeners...");

    player.on("timeupdate", async (data) => {
      console.log("🎥 timeupdate event fired:", data);
      const currentTime = Math.floor(data.seconds);

      if (currentTime - lastUpdateTimeRef.current >= 5) {
        lastUpdateTimeRef.current = currentTime;
        console.log(
          `💾 Saving progress at ${currentTime} sec for ${activeVideo.title}`
        );

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
          console.log("✅ Progress updated successfully.");
        } catch (err) {
          console.error("❌ Failed to update progress:", err);
        }
      }
    });

    player.on("ended", async () => {
      console.log(`📌 Marking ${activeVideo.title} as fully watched`);

      // ✅ Ensure final progress save before switching
      await saveProgress(activeVideo.id, lastUpdateTimeRef.current);

      const nextIndex = videos.findIndex((v) => v.id === activeVideo.id) + 1;
      if (nextIndex < videos.length) {
        const nextVideo = videos[nextIndex];
        console.log(`⏭️ Auto-playing next: ${nextVideo.title}`);

        // ✅ Reset progress & update active video
        setActiveVideo({ ...nextVideo, progress_seconds: 0 });
        lastUpdateTimeRef.current = 0;
      } else {
        console.log("✅ No more videos to play");
      }
    });
  }

  // ✅ Save progress on video switch & Reset progress to 0
  async function handleVideoClick(video: any) {
    console.log(`🔄 Switching to ${video.title}, resetting progress.`);

    // ✅ Save current progress before switching
    if (activeVideo) {
      await saveProgress(activeVideo.id, lastUpdateTimeRef.current);
    }

    // ✅ Reset progress & update active video
    setActiveVideo({ ...video, progress_seconds: 0 });
    lastUpdateTimeRef.current = 0;
  }

  // ✅ Function to save progress before switching
  async function saveProgress(videoId: number, progress: number) {
    if (!videoId || progress <= 0) return;

    console.log(`💾 Saving final progress for ${videoId}: ${progress} sec`);

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
      console.log("✅ Final progress saved before switching.");
    } catch (err) {
      console.error("❌ Failed to save progress:", err);
    }
  }

  if (!playlist || !activeVideo) return <div>Loading...</div>;

  return (
    <div className={styles.pageContainer}>
      <h1>{playlist.title}</h1>
      {playlist.description && <p>{playlist.description}</p>}
      {activeVideo.title && <p>{`Now playing: ${activeVideo.title}`}</p>}

      {/* 🎥 Video Player */}
      <div
        ref={playerContainerRef}
        className={styles.playerContainer}
        style={{ width: "100%", height: "500px" }}
      />

      {/* 🔽 Playlist Thumbnails */}
      <div className={styles.thumbnailGallery}>
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
            <p>{video.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
