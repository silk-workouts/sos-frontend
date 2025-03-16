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
import Video from "@/components/pages/dashboard/Video/Video"; // ✅ Prefer A (assuming this is intentional)
import { Showcase } from "../../../page";
import { ShowcaseVideo } from "@/components/pages/dashboard/VideoList/VideoList";

interface Chapter {
  id: number;
  title: string;
  start_time: number;
  duration: number | null;
  showcase_id: number;
  continuous_vimeo_id: string;
  real_vimeo_video_id: string;
}

export default function SingleShowcasePage() {
  const router = useRouter();
  const { showcase_name, showcase_id } = useParams<{
    showcase_name: string;
    showcase_id: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [showcase, setShowcase] = useState<Showcase | null>(null); // ✅ Prefer A (correct casing)
  const [showcaseVideos, setShowcaseVideos] = useState<ShowcaseVideo[]>([]);
  const [continuousVideo, setContinuousVideo] = useState<{
    continuous_vimeo_id: string;
    continuous_vimeo_title: string;
  } | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showcaseName = showcase_name.replaceAll("-", " ");

  useEffect(() => {
    async function fetchShowcase() {
      try {
        const response = await axios.get(`/api/showcases/${showcase_id}`);
        setShowcase(response.data.showcase);
        setShowcaseVideos(response.data.videos);
        setLoading(false);
      } catch (error) {
        console.error("Unable to retrieve showcase videos:", error);
      }
    }
    fetchShowcase();
  }, [showcase_id]);

  useEffect(() => {
    async function fetchContinuousVideo() {
      try {
        const response = await axios.get(
          `/api/showcases/${showcase_id}/continuous-video`
        );
        setContinuousVideo(response.data);
      } catch (error) {
        console.error("Unable to retrieve continuous video:", error);
      }
    }
    fetchContinuousVideo();
  }, [showcase_id]);

  useEffect(() => {
    async function getChapters() {
      if (!continuousVideo?.continuous_vimeo_id) return;
      try {
        const response = await axios.get("/api/chapters", {
          params: { continuous_vimeo_id: continuousVideo.continuous_vimeo_id },
        });
        setChapters(response.data);
      } catch (error) {
        console.error("Unable to fetch chapters:", error);
      }
    }
    getChapters();
  }, [continuousVideo]);

  if (loading || !continuousVideo) {
    return <div>Loading videos for {showcaseName}...</div>;
  }

  const mergedData = chapters.map((chapter, index) => {
    // const matchingVideo = showcaseVideos[index]; // fallback by index
    const adjustedIndex = index + 1;
    const matchingVideo = showcaseVideos[adjustedIndex];
    return {
      ...matchingVideo,
      title: chapter.title, // Use chapter title
      start_time: chapter.start_time,
      real_vimeo_video_id: chapter.real_vimeo_video_id,
    };
  });

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
          <h1 className={styles.header__title}>{showcaseName}</h1>
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
          {/* <Image
            src={showcase.thumbnail_url}
            alt={`Thumbnail image for the ${showcaseName} workout`}
            width={0}
            height={0}
            className={styles.hero__image}
          /> */}
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
            {/* TODO: Add actual duration logic */}
            {`[duration]`} mins
          </span>
        </div>
        <p className={styles.hero__description}>
          {showcase?.description || "[No description provided]"}
        </p>
      </div>

      {/* THUMBNAILS */}
      <ul className={styles.list} role="list">
        {mergedData.map((video) => (
          <li key={video.id}>
            <Video
              showcaseVideo={video}
              display="row"
              path={`/dashboard/player/${continuousVideo.continuous_vimeo_id}?start_time=${video.start_time}&showcase_id=${showcase_id}`} // ✅ With chapter start time
            />
          </li>
        ))}
      </ul>
    </>
  );
}
