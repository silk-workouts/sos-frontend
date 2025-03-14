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
import Video from "@/components/dashboard/Video/Video";
import AddToModal from "@/components/dashboard/AddToModal/AddToModal";
// import { Showcase } from '../../../page';
import { ShowcaseVideo } from "@/components/dashboard/VideoList/VideoList";

interface Chapter {
  id: number;
  title: string;
  start_time: number;
  duration: number | null;
  showcase_id: number;
  continuous_vimeo_id: string;
}

export default function SingleShowcasePage() {
  const router = useRouter();
  const { showcase_name, showcase_id } = useParams<{
    showcase_name: string;
    showcase_id: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [showcase, setShowCase] = useState<Showcase | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [continuousVideo, setContinuousVideo] = useState<{
    continuous_vimeo_id: string;
    continuous_vimeo_title: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showcaseName = showcase_name.replaceAll("-", " ");

  // Fetch showcase data
  useEffect(() => {
    async function getShowcase() {
      try {
        const response = await axios.get(`/api/showcases/${showcase_id}`);
        setShowCase(response.data.showcase);
        setLoading(false);
      } catch (error) {
        console.error(
          `Unable to retrieve showcase videos from Vimeo: ${error}`
        );
      }
    }

    getShowcase();
  }, [showcase_id]);

  // Fetch continuous video for showcase
  useEffect(() => {
    async function getContinuousVideo() {
      try {
        const response = await axios.get(
          `/api/showcases/${showcase_id}/continuous-video`
        );
        setContinuousVideo(response.data);
      } catch (error) {
        console.error(
          `Unable to retrieve continuous video for showcase: ${error}`
        );
      }
    }

    getContinuousVideo();
  }, [showcase_id]);

  // Fetch chapters for continuous video
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

  if (loading) {
    return <div>Loading videos for {showcaseName}...</div>;
  }
  z;

  return (
    <>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles["title-container"]}>
          <button
            className={styles.header__button}
            onClick={() => router.back()}
          >
            <Image
              src={chevronLeftIcon}
              alt="A left Chevron icon to navigate back"
              className={styles.hero__icon}
            />
          </button>
          <h1 className={styles.header__title}>{showcaseName}</h1>
        </div>
        <button className={styles.header__button}>
          <Image
            src={helpIcon}
            alt="The Help Icon"
            className={styles.hero__icon}
          />
        </button>
      </div>

      {/* HERO SECTION */}
      <div className={styles.hero}>
        <div className={styles["hero__image-container"]}>
          {/* Optional: showcase image */}
          {/* <Image
            src={showcase?.thumbnail_url || '/default-thumbnail.jpg'}
            alt={`Thumbnail image for ${showcaseName}`}
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
            {chapters.length} videos
          </span>
          <span>
            <Image
              src={clockIcon}
              alt="Clock icon"
              className={styles.hero__icon}
            />
            {/* Optional: calculated duration */}
          </span>
        </div>
        <p className={styles.hero__description}>
          {showcase?.description || "[No description provided]"}
        </p>
      </div>

      {/* THUMBNAILS BASED ON CHAPTERS */}
      <ul className={styles.list} role="list">
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <Video
              showcaseVideo={{
                id: chapter.id,
                title: chapter.title,
                thumbnail_url:
                  showcase?.thumbnail_url || "/default-thumbnail.jpg", // ✅ Use showcase thumbnail
                playbackUrl: "", // Not needed for now since it's continuous
                description: "",
                duration: chapter.duration || 0,
                vimeo_video_id: Number(continuousVideo?.continuous_vimeo_id), // ✅ Always use continuous video ID
                created_at: "",
                showcase_id: showcase_id,
              }}
              display="row"
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              path={`/dashboard/player/${continuousVideo?.continuous_vimeo_id}?start_time=${chapter.start_time}`} // ✅ Correct link!
            />
          </li>
        ))}
      </ul>

      {/* MODAL */}
      <AddToModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </>
  );
}
