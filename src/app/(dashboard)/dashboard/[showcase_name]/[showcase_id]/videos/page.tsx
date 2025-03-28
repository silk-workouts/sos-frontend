"use client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import chevronLeftIcon from "/public/assets/icons/chevron-left.svg";
import helpIcon from "/public/assets/icons/help.svg";
import playIcon from "/public/assets/icons/play.svg";
import clockIcon from "/public/assets/icons/clock.svg";
import styles from "./page.module.scss";
import Video from "@/components/pages/dashboard/Video/Video";
import { ChapterVideo } from "src/types/video";

interface Chapter {
  id: number;
  title: string;
  start_time: number;
  duration: number | null;
  continuous_video_id: number;
  continuous_vimeo_id: string;
  real_vimeo_video_id: string;
}

export default function SingleContinuousVideoPage() {
  const router = useRouter();
  const { continuous_video_name, continuous_video_id } = useParams<{
    continuous_video_name: string;
    continuous_video_id: string;
  }>()!;

  const [loading, setLoading] = useState(true);
  const [continuousVideo, setContinuousVideo] = useState<{
    continuous_vimeo_id: string;
    continuous_vimeo_title: string;
    name: string;
    description?: string;
  } | null>(null);
  const [chapterVideos, setChapterVideos] = useState<ChapterVideo[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const routeName = continuous_video_name.replaceAll("-", " ");

  useEffect(() => {
    async function fetchMetaAndVideos() {
      try {
        const [metaRes, videoRes, chapterRes] = await Promise.all([
          axios.get(
            `/api/continuous-videos/${continuous_video_id}/continuous-video`
          ),
          axios.get(`/api/continuous-videos/${continuous_video_id}`),
          axios.get("/api/chapters", {
            params: { continuous_vimeo_id: continuous_video_id },
          }),
        ]);

        setContinuousVideo(metaRes.data.continuousVideo);
        setChapterVideos(videoRes.data.chapters); // 🧠 this should align with how chapterVideo is shaped
        setChapters(chapterRes.data);
      } catch (error) {
        console.error("Error loading continuous video data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetaAndVideos();
  }, [continuous_video_id]);

  if (loading || !continuousVideo) {
    return <div>Loading videos for {routeName}...</div>;
  }

  const mergedData = chapters.map((chapter, index) => {
    const video = chapterVideos[index] || {};
    return {
      ...video,
      ...chapter,
      title: chapter.title,
      start_time: chapter.start_time ?? 0,
      duration: chapter.duration ?? 0,
      thumbnail_url: video.thumbnail_url ?? "/default-thumbnail.jpg",
    };
  });

  function handlePlayAll() {
    if (continuousVideo?.continuous_vimeo_id) {
      router.push(
        `/dashboard/player/${continuousVideo.continuous_vimeo_id}?autoplay=1`
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
              path={`/dashboard/player/${continuousVideo.continuous_vimeo_id}?start_time=${video.start_time}&showcase_id=${video.continuous_video_id}`}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
