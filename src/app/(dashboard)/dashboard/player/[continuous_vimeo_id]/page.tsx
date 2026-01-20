"use client";
import Image from "next/image";
import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import backArrowIcon from "/public/assets/icons/arrow-left.svg";
import Player from "@vimeo/player";
import Video from "@/components/pages/dashboard/Video/Video";
import { Chapter } from "../../[continuous_video_name]/[continuous_video_id]/videos/page";
import styles from "./page.module.scss";
import axios, { isAxiosError } from "axios";

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
  const scrollableContainerRef = useRef<HTMLUListElement | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [shouldRenderDetails, setShouldRenderDetails] = useState(false);
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

  // Build thumbnail lookup by real_vimeo_video_id (stable join key)
  const thumbnailMap = useMemo(() => {
    const m = new Map<string, VideoThumbnails>();
    videoThumbnails.forEach((item) => {
      const key = String(item?.real_vimeo_video_id ?? "").trim();
      if (key) m.set(key, item);
    });
    return m;
  }, [videoThumbnails]);

  // Merge chapters with thumbnails/descriptions by real_vimeo_video_id (NOT array index)
  const mergedData: VideoItem[] = useMemo(() => {
    return chapters
      .slice()
      .sort((a, b) => a.start_time - b.start_time)
      .map((chapter) => {
        const chapterKey = String(chapter.real_vimeo_video_id ?? "").trim();
        const meta = chapterKey ? thumbnailMap.get(chapterKey) : undefined;

        return {
          ...chapter,
          ...(meta ?? {}),
          id: chapter.id, // prevent meta.id from overwriting chapters.id
          title: chapter.title || meta?.corresponding_video_title || "Untitled",
          thumbnail_url: meta?.thumbnail_url?.startsWith("http")
            ? meta.thumbnail_url
            : "/assets/images/default-thumbnail.jpg",
          video_description:
            meta?.video_description || continuousVideo.video_description || "",
          real_vimeo_video_id: String(
            chapter.real_vimeo_video_id || meta?.real_vimeo_video_id || ""
          ).trim(),
          chapter_id: meta?.chapter_id ?? "",
          chapter_title: meta?.chapter_title ?? "",
          corresponding_video_title: meta?.corresponding_video_title ?? "",
          created_at: meta?.created_at ?? "",
        };
      });
  }, [chapters, thumbnailMap, continuousVideo.video_description]);

  // Keep latest mergedData accessible to the Vimeo event handler (avoid stale closure)
  const mergedDataRef = useRef<VideoItem[]>([]);
  useEffect(() => {
    mergedDataRef.current = mergedData;
  }, [mergedData]);

  //Check if the screen is a desktop
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
        if (isAxiosError(error) && error.status === 404) {
          router.push("/dashboard");
        }
        console.error("Failed to load chapters & continuous video:", error);
      }
    }
    fetchData();
  }, [continuous_vimeo_id, router]);

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

    let isMounted = true;

    const player = new Player(playerContainerRef.current, {
      id: parseInt(continuous_vimeo_id, 10),
      responsive: true,
      autoplay: false,
    });

    vimeoPlayerRef.current = player;

    const onTimeUpdate = (data: { seconds: number }) => {
      const list = mergedDataRef.current;
      if (!list.length) return;

      const t = data.seconds;

      let idx = list.findIndex((c, i) => {
        const start = c.start_time;
        const nextStart = list[i + 1]?.start_time ?? Number.POSITIVE_INFINITY;
        return t >= start && t < nextStart;
      });

      if (idx === -1) idx = 0;
      setActiveChapterIndex((prev) => (prev === idx ? prev : idx));
    };

    player
      .ready()
      .then(async () => {
        if (!isMounted) return;

        setPlayerReady(true);

        if (initialStartTime > 0) {
          await player.setCurrentTime(initialStartTime).catch(console.error);
          try {
            await player.play();
          } catch (err) {
            console.warn("Autoplay blocked (expected in some browsers):", err);
          }
        }

        player.on("timeupdate", onTimeUpdate);
      })
      .catch((err) => {
        const msg = String(err?.message ?? err);
        if (msg.includes("Unknown player") || msg.includes("unloaded")) return;
        console.error("Vimeo player ready() failed:", err);
      });

    return () => {
      isMounted = false;

      try {
        player.off("timeupdate", onTimeUpdate);
      } catch {
        // ignore
      }

      player.destroy().catch((err) => {
        const msg = String(err?.message ?? err);
        if (msg.includes("Unknown player") || msg.includes("unloaded")) return;
        console.error(err);
      });

      vimeoPlayerRef.current = null;
    };
  }, [continuous_vimeo_id, initialStartTime]);

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
  }, [autoplay, playerReady, chapters, initialStartTime]);

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

  //Enables auto scrolling for activeVideo to make sure it is always in view
  useEffect(() => {
    if (
      isDesktop &&
      typeof activeChapterIndex === "number" &&
      activeChapterIndex >= 0 &&
      scrollableContainerRef.current
    ) {
      const activeChapter = Array.from(
        scrollableContainerRef.current.children
      ).find((item) => item.className.includes("activeChapter"));

      activeChapter?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeChapterIndex, isDesktop]);

  // NOTE: removed debug-only duplicate logging for production cleanliness

  const handleChapterClick = async (
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

    const player = vimeoPlayerRef.current;
    if (!player) return;

    // Optimistically set highlight immediately
    setActiveChapterIndex(index);

    try {
      // Nudge forward by a tiny epsilon so boundary conditions won't snap to prior chapter
      const target = Math.max(0, Number(chapter.start_time) + 0.01);
      await player.setCurrentTime(target);

      player.play().catch((err) => {
        console.warn("Autoplay blocked on chapter click:", err);
      });
    } catch (e) {
      console.error("Failed to seek to chapter:", e);
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

    const normalizedTitle = continuousTitle.trim().toLowerCase();

    if (normalizedTitle.includes("silk continuous")) {
      return continuousTitle.replace(/silk continuous/i, "").trim();
    }

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

    if (process.env.NODE_ENV === "development") {
      console.info(
        `formatSilkTitle skipped unformatted title: ${continuousTitle}`
      );
    }

    return continuousTitle;
  }

  // delay rendering title and details of video near thumbnail b/c of Prescription programs having Warmup
  useEffect(() => {
    if (
      playerReady &&
      typeof activeChapterIndex === "number" &&
      activeChapterIndex >= 0
    ) {
      const timeout = setTimeout(() => {
        setShouldRenderDetails(true);
      }, 1000);

      return () => {
        clearTimeout(timeout);
        setShouldRenderDetails(false);
      };
    }
  }, [activeChapterIndex, playerReady]);

  return (
    <div className={styles.container}>
      <section className={styles.contentArea}>
        <button onClick={() => router.back()} className={styles.backButton}>
          <Image
            src={backArrowIcon}
            alt=""
            aria-hidden="true"
            className={styles.backButton__icon}
          />
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
              <h2
                className={`${styles.activeVideoTitle} ${
                  shouldRenderDetails
                    ? styles.activeDetailVisible
                    : styles.activeDetailHidden
                }`}
              >
                {formatSilkTitle(
                  mergedData[activeChapterIndex]?.corresponding_video_title ??
                    ""
                ).toLowerCase()}
              </h2>
              <p
                className={`${styles.videoDescription} ${
                  shouldRenderDetails
                    ? styles.activeDetailVisible
                    : styles.activeDetailHidden
                }`}
                dangerouslySetInnerHTML={{
                  __html:
                    mergedData[activeChapterIndex]?.video_description.replace(
                      /\.(\d+:\d+)$/,
                      ".<br>$1"
                    ) ?? "",
                }}
              ></p>
            </>
          )}
        </div>
      </section>

      {/* 📜 Chapter List */}
      <section className={styles.chapter}>
        <h2 className={styles.chapterTitle} id="chapter-heading">
          Chapters
        </h2>
        <ul
          role="list"
          aria-labelledby="chapter-heading"
          className={styles.chapterList}
          ref={scrollableContainerRef}
        >
          {mergedData.map((item, index) => {
            return (
              <li
                key={`${item.continuous_vimeo_id}:${item.start_time}:${item.real_vimeo_video_id}`}
                role="listitem"
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
                  active={activeChapterIndex === index}
                />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
