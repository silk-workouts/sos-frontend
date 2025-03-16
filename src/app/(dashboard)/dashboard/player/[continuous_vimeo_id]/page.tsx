"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Player from "@vimeo/player";
import Video from "@/components/pages/dashboard/Video/Video";

export default function PlayerPage() {
  const { continuous_vimeo_id } = useParams<{ continuous_vimeo_id: string }>();
  const searchParams = useSearchParams();
  const showcase_id = searchParams.get("showcase_id");
  const initialStartTime = searchParams.get("start_time")
    ? parseInt(searchParams.get("start_time") as string, 10)
    : 0;

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

  return (
    <div style={{ padding: "20px" }}>
      <h1>Workout Player</h1>

      {/* 🎥 Player */}
      <div
        ref={playerContainerRef}
        style={{
          width: "100%",
          height: "500px",
          visibility: playerReady ? "visible" : "hidden",
          transition: "visibility 0.3s ease-in-out",
        }}
      />

      {/*  Chapter List */}
      <h2>Chapters</h2>
      <ul style={{ padding: 0, marginTop: "20px" }}>
        {mergedData.map((item, index) => (
          <li
            key={item.id || index}
            onClick={() => handleChapterClick(item, index)}
            style={{
              listStyle: "none",
              cursor: "pointer",
              marginBottom: "12px",
              borderRadius: "8px",
              border:
                activeChapterIndex === index
                  ? "3px solid #0070f3"
                  : "1px solid #ddd",
              background:
                activeChapterIndex === index
                  ? "rgba(0, 112, 243, 0.1)"
                  : "#f9f9f9",
              padding: "12px",
              transition: "all 0.2s ease",
            }}
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
