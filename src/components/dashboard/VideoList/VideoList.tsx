"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Showcase } from "src/app/(dashboard)/dashboard/page";
import Video from "../Video/Video";
import styles from "./VideoList.module.scss";

interface VideoListProps {
  video: Showcase;
  isModalOpen: boolean;
  setIsModalOpen: (arg1: boolean) => void;
}

export interface ShowcaseVideo {
  id: number;
  vimeo_video_id: string;
  title: string;
  description: string;
  duration: number;
  position: number;
  thumbnail_url: string;
  created_at: string;
}

interface Chapter {
  id: number;
  title: string;
  start_time: number;
  duration: number | null;
  showcase_id: number;
  continuous_vimeo_id: string;
}

export default function VideoList({
  video,
  isModalOpen,
  setIsModalOpen,
}: VideoListProps) {
  const router = useRouter();
  const [showcaseVideos, setShowCaseVideos] = useState<ShowcaseVideo[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [continuousVideo, setContinuousVideo] = useState<{
    continuous_vimeo_id: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const routeName = video.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[%\.]/g, "");

  // Fetch videos for the showcase
  useEffect(() => {
    async function getShowcaseVideos() {
      try {
        const response = await axios.get(
          `/api/showcases/${video.vimeo_showcase_id}`
        );
        setShowCaseVideos(response.data.videos);
        setIsLoading(false);
      } catch (error) {
        console.error(
          `Unable to retrieve showcase videos from Vimeo: ${error}`
        );
      }
    }

    getShowcaseVideos();
  }, [video.vimeo_showcase_id]);

  // Fetch continuous video to get the continuous_vimeo_id
  useEffect(() => {
    async function fetchContinuousVideo() {
      try {
        const response = await axios.get(
          `/api/showcases/${video.vimeo_showcase_id}/continuous-video`
        );

        if (response.data.continuous_vimeo_id) {
          setContinuousVideo(response.data);
        } else {
          console.warn("No continuous video found for this showcase");
          return;
        }
      } catch (error) {
        console.error("Unable to retrieve continuous video:", error);
      }
    }

    fetchContinuousVideo();
  }, [video.vimeo_showcase_id]);

  // Fetch chapters once continuous_vimeo_id is available
  useEffect(() => {
    if (!continuousVideo?.continuous_vimeo_id) {
      console.log("Skipping chapter fetch due to missing continuous_vimeo_id");
      return;
    }

    async function fetchChapters() {
      try {
        const response = await axios.get("/api/chapters", {
          params: { continuous_vimeo_id: continuousVideo.continuous_vimeo_id },
        });
        setChapters(response.data); // Store the fetched chapters
      } catch (error) {
        console.error("Unable to fetch chapters:", error);
      }
    }

    fetchChapters();
  }, [continuousVideo]);

  // If still loading or chapters aren't loaded, show loading state
  if (isLoading || (!chapters.length && continuousVideo)) {
    return <div>List of videos is loading...</div>;
  }

  console.log("SHOW", showcaseVideos);

  // // Merge videos and chapters by matching video id
  // const mergedData = showcaseVideos.map((video) => {
  //   const matchingChapter = chapters.find(
  //     (chapter) => chapter.id === video.id // Match by video id, not index
  //   );
  //   return matchingChapter
  //     ? {
  //         ...video,
  //         title: matchingChapter.title,
  //         start_time: matchingChapter.start_time,
  //       }
  //     : video;
  // });

  // Merge videos and chapters by their index (position)
  const mergedData = chapters.map((chapter, index) => {
    // Adjust the index if necessary (e.g., index + 1 or index - 1)
    const adjustedIndex = index + 1;

    // Try to find the matching video by index
    const matchingVideo = showcaseVideos[adjustedIndex]; // Default fallback by index

    return {
      ...matchingVideo,
      title: chapter.title, // Use chapter title (round name)
      start_time: chapter.start_time, // Use chapter start_time
    };
  });

  console.log("MERGED: ", mergedData);

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <header>
          <h2 className={styles.title}>{video.name.toLowerCase()}</h2>
          <p className={styles.description}>
            {video.description ||
              "[Description goes here but it is currently empty]"}
          </p>
        </header>
        <button
          className={styles.button}
          onClick={() =>
            router.push(
              `/dashboard/${routeName}/${video.vimeo_showcase_id}/videos`
            )
          }
        >
          View all
        </button>
      </div>
      <ul className={styles.list}>
        {mergedData.map((showcaseVideo) => {
          return (
            <li key={showcaseVideo.id}>
              <Video
                showcaseVideo={showcaseVideo}
                display="column"
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                path={`/dashboard/player/${continuousVideo.continuous_vimeo_id}?start_time=${showcaseVideo.start_time}&showcase_id=${video.vimeo_showcase_id}`}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
