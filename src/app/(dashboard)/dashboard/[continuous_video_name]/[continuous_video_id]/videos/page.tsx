"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import chevronLeftIcon from "/public/assets/icons/chevron-left.svg";
import helpIcon from "/public/assets/icons/help.svg";
import playIcon from "/public/assets/icons/play.svg";
import clockIcon from "/public/assets/icons/clock.svg";
import axios from "axios";
import Video from "@/components/pages/dashboard/Video/Video";
import styles from "./page.module.scss";
import { ChapterVideo } from "src/types/video";

interface Chapter {
  id: number;
  title: string;
  start_time: number;
  duration: number | null;
  continuous_vimeo_id: string;
  real_vimeo_video_id: string;
}

interface MergedChapterVideo extends ChapterVideo {
  // title: string;
  // duration: number;
  thumbnail_url: string;
  start_time: number;
  real_vimeo_video_id: string;
  // continuous_vimeo_id: string;
  // vimeo_video_id: string;
  // description: string;
  // position?: number;
  // created_at?: string;
}

export default function SingleContinuousVideoPage() {
  const router = useRouter();

  const { continuous_video_name, continuous_video_id } =
    useParams<{
      continuous_video_name: string;
      continuous_video_id: string;
    }>() || {};

  const [loading, setLoading] = useState(true);
  const [continuousVideo, setContinuousVideo] = useState<{
    continuous_video_id: string;
    name: string;
    description?: string;
  } | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterVideos, setChapterVideos] = useState<ChapterVideo[]>([]);

  const routeName = continuous_video_name?.replaceAll("-", " ") || "Program";

  console.log("id", continuous_video_id);

  useEffect(() => {
    async function fetchData() {
      if (!continuous_video_id) return;

      try {
        const [metaRes, videoRes, chapterRes] = await Promise.all([
          axios.get(
            `/api/continuous-videos/${continuous_video_id}/continuous-video`
          ),
          axios.get(`/api/continuous-videos/${continuous_video_id}`),
          axios.get(`/api/chapters`, {
            params: { continuous_vimeo_id: continuous_video_id },
          }),
        ]);

        console.log("meta ", metaRes.data);

        setContinuousVideo(metaRes.data.continuousVideo);
        setChapterVideos(videoRes.data.chapters || []);
        setChapters(chapterRes.data || []);
      } catch (error) {
        console.error("❌ Error loading continuous video page:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [continuous_video_id]);

  if (loading || !continuousVideo) {
    return <div>Loading videos for this {routeName}...</div>;
  }

  const chapterVideoMap = new Map<string, ChapterVideo>();
  for (const video of chapterVideos) {
    if (video.real_vimeo_video_id) {
      chapterVideoMap.set(video.real_vimeo_video_id, video);
    }
  }

  const mergedData: MergedChapterVideo[] = chapters
    .filter((ch) => {
      const title = ch.title.toLowerCase();
      return !title.includes("warmup") && !title.includes("cooldown");
    })
    .map((chapter) => {
      const videoMeta = chapterVideoMap.get(chapter.real_vimeo_video_id);

      return {
        id: chapter.id,
        title: chapter.title || videoMeta?.title || "Untitled",
        start_time: chapter.start_time ?? 0,
        duration: chapter.duration ?? videoMeta?.duration ?? 0,
        thumbnail_url: videoMeta?.thumbnail_url?.startsWith("http")
          ? videoMeta.thumbnail_url
          : "/assets/images/default-thumbnail.jpg",
        real_vimeo_video_id:
          chapter.real_vimeo_video_id ?? videoMeta?.real_vimeo_video_id ?? "",
        continuous_vimeo_id:
          chapter.continuous_vimeo_id ?? continuous_video_id ?? "",
        vimeo_video_id: videoMeta?.vimeo_video_id || "",
        description: videoMeta?.description ?? "",
        position: videoMeta?.position ?? 0,
        created_at: videoMeta?.created_at || "",
      };
    });

  function handlePlayAll() {
    if (continuousVideo?.continuous_video_id) {
      router.push(
        `/dashboard/player/${continuousVideo.continuous_video_id}?autoplay=1`
      );
    }
  }

  return (
    <>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles["title-container"]}>
          <button
            className={styles.header__button}
            onClick={() => router.back()}
            aria-label="Navigate back"
          >
            <Image
              src={chevronLeftIcon}
              alt="A left Chevron icon to navigate back"
              className={styles.hero__icon}
            />
          </button>
          <h1 className={styles.header__title}>{routeName}</h1>
        </div>
        <button className={styles.header__button} aria-label="Get help">
          <Image
            src={helpIcon}
            alt="The Help Icon"
            className={styles.hero__icon}
          />
        </button>
      </div>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles["hero__image-container"]}>
          <button className={styles.playAllButton} onClick={handlePlayAll}>
            <Image src={playIcon} alt="Play icon" className={styles.playIcon} />
            Play All
          </button>
        </div>
        <div className={styles.hero__info}>
          <span>
            <Image
              src={playIcon}
              alt="Play icon"
              className={styles.hero__icon}
            />
            {mergedData.length} videos
          </span>
          <span>
            <Image
              src={clockIcon}
              alt="Clock icon"
              className={styles.hero__icon}
            />
            {mergedData.reduce((acc, v) => acc + (v.duration || 0), 0)} mins
          </span>
        </div>
        <p className={styles.hero__description}>
          {continuousVideo?.description || "[No description provided]"}
        </p>
      </div>

      {/* VIDEO LIST */}
      <ul className={styles.list} role="list">
        {mergedData.map((video) => (
          <li key={video.id}>
            <Video
              chapterVideo={video}
              display="row"
              path={`/dashboard/player/${continuousVideo.continuous_video_id}?start_time=${video.start_time}&showcase_id=${video.continuous_vimeo_id}`}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
