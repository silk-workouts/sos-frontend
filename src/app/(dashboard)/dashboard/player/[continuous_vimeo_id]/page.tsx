"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Player from "@vimeo/player";
import Video from "@/components/pages/dashboard/Video/Video";

import styles from "./page.module.scss";

export default function PlayerPage() {
  const { continuous_vimeo_id } = useParams<{ continuous_vimeo_id: string }>()!;
  const searchParams = useSearchParams()!;
  const continuous_video_id = searchParams.get("continuous_video_id");
  const initialStartTime = searchParams.get("start_time")
    ? parseInt(searchParams.get("start_time") as string, 10)
    : 0;
  const autoplay = searchParams.get("autoplay") === "1";

  const [chapters, setChapters] = useState<any[]>([]);
  const [videoThumbnails, setVideoThumbnails] = useState<any[]>([]);
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

  //  Fetch video thumbnails
  useEffect(() => {
    if (!continuous_video_id) return;
    console.log(continuous_video_id);

    async function fetchVideoThumbnails() {
      try {
        const res = await fetch(
          `/api/continuous-videos/${continuous_video_id}`
        );
        const data = await res.json();
        console.log(data);
        setVideoThumbnails(data.chapters); // These contain thumbnails, real_vimeo_video_id, etc.
      } catch (error) {
        console.error("Failed to load video thumbnails:", error);
      }
    }

    fetchVideoThumbnails();
  }, [continuous_video_id]);

  //  Setup Vimeo player
  useEffect(() => {
    if (!playerContainerRef.current || vimeoPlayerRef.current) return;

    const player = new Player(playerContainerRef.current, {
      id: parseInt(continuous_vimeo_id, 10),
      responsive: true,
      autoplay: false,
    });

    vimeoPlayerRef.current = player;

    player.ready().then(async () => {
      setPlayerReady(true);
      if (initialStartTime > 0) {
        await player.setCurrentTime(initialStartTime).catch(console.error);
        try {
          await player.play();
        } catch (err) {
          console.warn("Autoplay blocked (expected in some browsers):", err);
        }
      }

      player.on("timeupdate", (data) => {
        const currentTime = data.seconds;
        const index =
          chapters.filter((c) => c.start_time <= currentTime).length - 1;
        if (index !== activeChapterIndex) setActiveChapterIndex(index);
      });
    });

    return () => {
      player.destroy().catch(console.error);
      vimeoPlayerRef.current = null;
    };
  }, [continuous_vimeo_id, chapters, initialStartTime]);

  //  Autoplay logic
  useEffect(() => {
    if (autoplay && playerReady && vimeoPlayerRef.current) {
      const startIndex = chapters.findIndex(
        (c) => c.start_time >= initialStartTime
      );
      const validIndex = startIndex !== -1 ? startIndex : 0;
      setActiveChapterIndex(validIndex);

      vimeoPlayerRef.current.play().catch((err) => {
        console.warn("Autoplay blocked by browser:", err);
      });
    }
  }, [autoplay, playerReady, chapters]);

  //  Clean up injected Vimeo styles
  useEffect(() => {
    if (!playerContainerRef.current) return;

    const cleanupInjectedStyles = () => {
      const container = playerContainerRef.current;
      const injectedDivs = container?.querySelectorAll<HTMLDivElement>(
        "div[style*='padding:56.25%']"
      );

      injectedDivs?.forEach((div) => {
        div.style.padding = "0";
        div.style.position = "static";
        div.style.height = "100%";
      });
    };

    cleanupInjectedStyles();
    const cleanupTimeout = setTimeout(cleanupInjectedStyles, 500);

    return () => clearTimeout(cleanupTimeout);
  }, [playerReady]);

  //  Merge chapters with thumbnails
  const mergedData = chapters.map((chapter, index) => {
    const meta = videoThumbnails[index] || {};
    return {
      ...chapter,
      ...meta,
      title: chapter.title || meta.corresponding_video_title || "Untitled",
      thumbnail_url: meta.thumbnail_url || "/default-thumbnail.jpg",
      real_vimeo_video_id:
        chapter.real_vimeo_video_id || meta.real_vimeo_video_id,
    };
  });

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
              chapterVideo={{
                id: item.id,
                title: item.title,
                thumbnail_url: item.thumbnail_url,
                description:
                  item.description || `Starts at ${item.start_time}s`,
                duration: item.duration || 0,
                vimeo_video_id: String(continuous_vimeo_id),
                real_vimeo_video_id: item.real_vimeo_video_id,
                created_at: item.created_at || "",
                continuous_video_id: Number(continuous_video_id) || 0,
                start_time: item.start_time,
                position: item.position ?? index,
              }}
              display="row"
              path="#" // Handled via click handler
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
