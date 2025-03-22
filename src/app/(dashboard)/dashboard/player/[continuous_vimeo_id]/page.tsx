"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Player from "@vimeo/player";
import Video from "@/components/pages/dashboard/Video/Video";

import styles from "./page.module.scss";

export default function PlayerPage() {
  const { continuous_vimeo_id } = useParams<{ continuous_vimeo_id: string }>()!;
  const searchParams = useSearchParams()!;
  const showcase_id = searchParams.get("showcase_id");
  const initialStartTime = searchParams.get("start_time")
    ? parseInt(searchParams.get("start_time") as string, 10)
    : 0;
  const autoplay = searchParams.get("autoplay") === "1";
  const [chapters, setChapters] = useState<any[]>([]);
  const [showcaseVideos, setShowcaseVideos] = useState<any[]>([]);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | null>(
    null
  );
  const [playerReady, setPlayerReady] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);

  //  Fetch chapters
  useEffect(() => {
    async function fetchChapters() {
      try {
        const res = await fetch(
          `/api/chapters?continuous_vimeo_id=${continuous_vimeo_id}`
        );
        const data = await res.json();
        setChapters(data);
      } catch (error) {
        console.error("Failed to load chapters:", error);
      }
    }
    fetchChapters();
  }, [continuous_vimeo_id]);

  //  Fetch showcase videos (for thumbnails)
  useEffect(() => {
    async function fetchVideos() {
      if (!showcase_id) return;
      try {
        const res = await fetch(`/api/showcases/${showcase_id}`);
        const data = await res.json();
        setShowcaseVideos(data.videos);
      } catch (error) {
        console.error("Failed to load showcase videos:", error);
      }
    }
    fetchVideos();
  }, [showcase_id]);

  // Setup player (only once when chapters are loaded!)
  useEffect(() => {
    if (!playerContainerRef.current || vimeoPlayerRef.current) return;

    const player = new Player(playerContainerRef.current, {
      id: parseInt(continuous_vimeo_id, 10),
      responsive: true,
      autoplay: false, // Don't force autoplay on init
    });

    vimeoPlayerRef.current = player;

    player.ready().then(async () => {
      console.log("✅ Vimeo player ready");
      setPlayerReady(true);

      if (initialStartTime > 0) {
        await player.setCurrentTime(initialStartTime).catch(console.error);
        // Don't force autoplay — some browsers block this
        try {
          await player.play();
        } catch (err) {
          console.warn("Autoplay blocked (expected in some browsers):", err);
        }
      }

      // Active chapter tracker
      player.on("timeupdate", (data) => {
        const currentTime = data.seconds;
        const index =
          chapters.filter((c) => c.start_time <= currentTime).length - 1;
        if (index !== activeChapterIndex) setActiveChapterIndex(index);
      });
    });

    // Cleanup
    return () => {
      console.log("🔥 Destroying player instance");
      player.destroy().catch(console.error);
      vimeoPlayerRef.current = null;
    };
  }, [continuous_vimeo_id, chapters, initialStartTime]);

  //  Handle chapter click
  const handleChapterClick = (chapter: any, index: number) => {
    if (vimeoPlayerRef.current) {
      vimeoPlayerRef.current.setCurrentTime(chapter.start_time).then(() => {
        vimeoPlayerRef.current?.play().catch((err) => {
          console.warn("Autoplay blocked on chapter click:", err);
        });
        setActiveChapterIndex(index);
      });
    }
  };

  //  Merged data (chapters + thumbnails)
  const mergedData = chapters.map((chapter, index) => {
    const video = showcaseVideos[index];
    return {
      ...chapter,
      ...video,
      start_time: chapter.start_time,
      title: chapter.title || video?.title,
      thumbnail_url: video?.thumbnail_url || "",
    };
  });

  useEffect(() => {
    if (autoplay && playerReady && vimeoPlayerRef.current) {
      console.log("▶️ Autoplaying video...");

      //  Find the correct index based on start time
      const startIndex = chapters.findIndex(
        (c) => c.start_time >= initialStartTime
      );
      const validIndex = startIndex !== -1 ? startIndex : 0; // Default to first chapter

      // Set the active chapter index to highlight the correct thumbnail
      setActiveChapterIndex(validIndex);
      console.log(
        `🎯 Autoplay started - Active chapter set to index: ${validIndex}`
      );

      // Start playing video
      vimeoPlayerRef.current.play().catch((err) => {
        console.warn("Autoplay blocked by browser:", err);
      });
    }
  }, [autoplay, playerReady, chapters]);

  useEffect(() => {
    if (!playerContainerRef.current) return;

    const cleanupInjectedStyles = () => {
      const container = playerContainerRef.current;
      if (!container) return; // Ensure it's not null

      const injectedDivs = container.querySelectorAll<HTMLDivElement>(
        "div[style*='padding:56.25%']"
      );

      injectedDivs.forEach((div) => {
        if (div instanceof HTMLDivElement) {
          div.style.padding = "0";
          div.style.position = "static";
          div.style.height = "100%";
        }
      });

      console.log("✅ Removed extra Vimeo-injected padding divs");
    };

    // Run cleanup initially (in case the divs are already there)
    cleanupInjectedStyles();

    // Also run cleanup again after a short delay (for dynamically injected elements)
    const cleanupTimeout = setTimeout(cleanupInjectedStyles, 500);

    return () => {
      clearTimeout(cleanupTimeout);
      console.log("Cleaning up Vimeo-injected styles on unmount");
    };
  }, [playerReady]); // Runs only when the player is ready

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Workout Player</h1>

      {/* 🎥 Player Wrapper */}
      <div
        ref={playerContainerRef}
        className={`${styles.playerContainer} ${
          playerReady ? styles.playerVisible : ""
        }`}
      />

      {/* 📜 Chapter List */}
      <h2 className={styles.chapterTitle}>Chapters</h2>
      <ul className={styles.chapterList}>
        {mergedData.map((item, index) => (
          <li
            key={item.id || index}
            onClick={() => handleChapterClick(item, index)}
            className={`${styles.chapterItem} ${
              activeChapterIndex === index ? styles.activeChapter : ""
            }`}
          >
            <Video
              showcaseVideo={{
                id: item.id,
                title: item.title,
                thumbnail_url: item.thumbnail_url,
                description:
                  item.description || `Starts at ${item.start_time}s`,
                duration: item.duration || 0,
                vimeo_video_id: String(continuous_vimeo_id),
                real_vimeo_video_id: item.real_vimeo_video_id,
                created_at: item.created_at || "",
                showcase_id: showcase_id || "",
                start_time: item.start_time,
                position: item.position,
              }}
              display="row"
              path="#" // Handled via onClick now
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
