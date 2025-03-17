"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { usePlaylists } from "../../context/PlaylistContext";
import Player from "@vimeo/player";
import styles from "./page.module.scss"; // Your scoped styles

export default function PlaylistPlayerPage() {
  const { playlist_id } = useParams<{ playlist_id: string }>();
  const { userId } = usePlaylists();

  const [playlist, setPlaylist] = useState<any | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);

  useEffect(() => {
    async function fetchPlaylist() {
      try {
        const res = await fetch(`/api/playlists/${playlist_id}`, {
          headers: { "x-user-id": userId },
        });
        const data = await res.json();
        setPlaylist(data.playlist);
        setVideos(data.videos);
        setActiveVideo(data.videos[0]); // Default to first video
      } catch (err) {
        console.error("Failed to fetch playlist", err);
      }
    }

    if (userId) fetchPlaylist();
  }, [playlist_id, userId]);

  // Setup or update player
  useEffect(() => {
    if (!playerContainerRef.current || !activeVideo) return;

    if (vimeoPlayerRef.current) {
      // If player already exists, load new video
      vimeoPlayerRef.current
        .loadVideo(activeVideo.vimeo_video_id)
        .catch((err) => console.error("Failed to load video:", err));
    } else {
      // If no player yet, create one
      const player = new Player(playerContainerRef.current, {
        id: activeVideo.vimeo_video_id,
        responsive: true,
        autoplay: true,
      });

      vimeoPlayerRef.current = player;

      // Optional: Listen to player events
      player.on("ended", () => console.log("Video ended!"));
    }
  }, [activeVideo]);

  if (!playlist || !activeVideo) return <div>Loading...</div>;

  return (
    <div className={styles.pageContainer}>
      <h1>{playlist.title}</h1>
      {playlist.description && <p>{playlist.description}</p>}

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
            onClick={() => setActiveVideo(video)}
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
