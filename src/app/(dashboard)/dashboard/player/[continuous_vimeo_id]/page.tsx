"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import backArrowIcon from "/public/assets/icons/arrow-left.svg";
import Player from "@vimeo/player";
import Video from "@/components/pages/dashboard/Video/Video";
import { Chapter } from "../../[continuous_video_name]/[continuous_video_id]/videos/page";
import styles from "./page.module.scss";
import axios from "axios";

interface VideoThumbnails {
  chapter_id: string;
  chapter_title: string;
  corresponding_video_title: string;
  created_at: string;
  duration: number;
  id: number;
  real_vimeo_video_id: string;
  start_time: number;
  thumbnail_url: string;
  video_description: string;
}

interface VideoItem extends Chapter {
  chapter_id: string;
  chapter_title: string;
  corresponding_video_title: string;
  created_at: string;
  thumbnail_url: string;
  video_description: string;
}

export default function PlayerPage() {
  const router = useRouter();
  const { continuous_vimeo_id } = useParams<{ continuous_vimeo_id: string }>()!;
  const searchParams = useSearchParams()!;
  const continuous_video_id = searchParams.get("continuous_video_id");
  const initialStartTime = searchParams.get("start_time")
    ? parseInt(searchParams.get("start_time") as string, 10)
    : 0;
  const autoplay = searchParams.get("autoplay") === "1";
  const [continuousVideo, setContinuousVideo] = useState({
    continuous_video_id: "",
    continuous_video_title: "",
    description: "",
    video_description: "",
  });
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [videoThumbnails, setVideoThumbnails] = useState<VideoThumbnails[]>([]);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | null>(
    null
  );
  const [playerReady, setPlayerReady] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);

  //  Fetch chapters & continuous video
  useEffect(() => {
    async function fetchData() {
      try {
        const [chapterRes, continuosRes] = await Promise.all([
          axios.get(`/api/chapters?continuous_vimeo_id=${continuous_vimeo_id}`),
          axios.get(
            `/api/continuous-videos/${continuous_vimeo_id}/continuous-video`
          ),
        ]);

        setChapters(chapterRes.data);
        setContinuousVideo(continuosRes.data.continuousVideo);
      } catch (error) {
        console.error("Failed to load chapters & continuous video:", error);
      }
    }
    fetchData();
  }, [continuous_vimeo_id]);

  //  Fetch video thumbnails
  useEffect(() => {
    if (!continuous_vimeo_id) return;

    async function fetchVideoThumbnails() {
      try {
        const res = await fetch(
          `/api/continuous-videos/${continuous_vimeo_id}`
        );

        const data = await res.json();

        setVideoThumbnails(data.chapters); // These contain thumbnails, real_vimeo_video_id, etc.
      } catch (error) {
        console.error("Failed to load video thumbnails:", error);
      }
    }

    fetchVideoThumbnails();
  }, [continuous_vimeo_id]);

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
      });
    };

    cleanupInjectedStyles();
    const cleanupTimeout = setTimeout(cleanupInjectedStyles, 500);

    return () => clearTimeout(cleanupTimeout);
  }, [playerReady]);

  // 1. Build a map of thumbnails using real_vimeo_video_id
  const thumbnailMap = new Map<string, VideoThumbnails>();
  videoThumbnails.forEach((item) => {
    if (item.real_vimeo_video_id) {
      thumbnailMap.set(item.real_vimeo_video_id, item);
    }
  });

  //  Merge chapters with thumbnails
  const mergedData = chapters.map((chapter, index) => {
    const meta = videoThumbnails[index] || {};
    return {
      ...chapter,
      ...meta,
      video_description:
        meta.video_description ||
        continuousVideo.video_description || // Get from continuousVideo if not in chapter
        "",
      title: chapter.title || meta.corresponding_video_title || "Untitled",
      thumbnail_url: meta?.thumbnail_url?.startsWith("http")
        ? meta.thumbnail_url
        : "/assets/images/default-thumbnail.jpg",
      real_vimeo_video_id:
        chapter.real_vimeo_video_id || meta.real_vimeo_video_id,
    };
  });

  const handleChapterClick = (
    chapter: VideoItem,
    index: number,
    event: React.MouseEvent<HTMLLIElement>
  ) => {
    if (
      event.target instanceof HTMLElement &&
      (event.target.closest("button") ||
        event.target.closest("input") ||
        event.target.closest("label"))
    ) {
      return;
    }

    if (vimeoPlayerRef.current) {
      vimeoPlayerRef.current.setCurrentTime(chapter.start_time).then(() => {
        vimeoPlayerRef.current?.play().catch((err) => {
          console.warn("Autoplay blocked on chapter click:", err);
        });
        setActiveChapterIndex(index);
      });
    }
  };

  function formatSilkTitle(continuousTitle: string): string {
    const numberMap: Record<string, string> = {
      one: "1",
      two: "2",
      three: "3",
      four: "4",
      five: "5",
      six: "6",
      seven: "7",
      eight: "8",
      nine: "9",
      ten: "10",
      eleven: "11",
      twelve: "12",
      thirteen: "13",
      fourteen: "14",
      fifteen: "15",
    };

    // Normalize the input by trimming and converting to lowercase
    const normalizedTitle = continuousTitle.trim().toLowerCase();

    // Check for 'Silk Continuous' using lowercase comparison
    if (normalizedTitle.includes("silk continuous")) {
      return continuousTitle.replace(/silk continuous/i, "").trim();
    } else {
      console.error(`title no working: ${normalizedTitle}`);
    }

    // Check for 'Silk Workout' using lowercase comparison
    if (normalizedTitle.includes("silk workout")) {
      const words = continuousTitle
        .replace(/silk workout/i, "")
        .trim()
        .split(" ");
      const lastWord = words[words.length - 1].toLowerCase();

      if (numberMap[lastWord]) {
        words[words.length - 1] = numberMap[lastWord];
      }

      return `100% Prescription Program ${words.join(" ")}`;
    }

    // Return the input unchanged if no conditions are met
    return continuousTitle;
  }

  return (
    <div className={styles.container}>
      <section className={styles.contentArea}>
        <button onClick={() => router.back()} className={styles.backButton}>
          <Image src={backArrowIcon} alt="" aria-hidden="true" />
          <span>Exit workout</span>
        </button>

        {/* 🎥 Player Wrapper */}
        <div ref={playerContainerRef} className={styles.playerContainer} />

        <div className={styles.videoDetails}>
          <h1 className={styles.playlistTitle}>
            {continuousVideo.continuous_video_title
              ? formatSilkTitle(
                  continuousVideo.continuous_video_title
                ).toLowerCase()
              : "Loading..."}
          </h1>
          {activeChapterIndex !== null && activeChapterIndex >= 0 && (
            <>
              <h2 className={styles.activeVideoTitle}>
                {formatSilkTitle(
                  mergedData[activeChapterIndex].corresponding_video_title
                ).toLowerCase()}
              </h2>
              <p
                className={styles.videoDescription}
                dangerouslySetInnerHTML={{
                  __html: mergedData[
                    activeChapterIndex
                  ].video_description.replace(/\.(\d+:\d+)$/, ".<br>$1"),
                }}
              ></p>
            </>
          )}
        </div>
      </section>

      {/* 📜 Chapter List */}
      <section className={styles.chapter}>
        <h2 className={styles.chapterTitle}>Chapters</h2>
        <ul className={styles.chapterList}>
          {mergedData.map((item, index) => {
            return (
              <li
                key={item.id || index}
                onClick={(event) => handleChapterClick(item, index, event)}
                className={`${styles.chapterItem} ${
                  activeChapterIndex === index ? styles.activeChapter : ""
                }`}
              >
                <Video
                  chapterVideo={{
                    id: item.id,
                    title: item.title,
                    thumbnail_url: item.thumbnail_url,
                    description: `Starts at ${item.start_time}s`,
                    duration: item.duration || 0,
                    vimeo_video_id: String(continuous_vimeo_id),
                    real_vimeo_video_id: item.real_vimeo_video_id,
                    created_at: item.created_at || "",
                    continuous_vimeo_id:
                      item.continuous_vimeo_id || String(continuous_video_id),
                    start_time: item.start_time,
                    position: index,
                  }}
                  display="row"
                  type="player"
                  path="#" // Handled via click handler
                />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
