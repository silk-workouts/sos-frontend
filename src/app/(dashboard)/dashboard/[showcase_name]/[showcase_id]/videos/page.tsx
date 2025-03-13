'use client';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import chevronLeftIcon from '/public/assets/icons/chevron-left.svg';
import helpIcon from '/public/assets/icons/help.svg';
import playIcon from '/public/assets/icons/play.svg';
import clockIcon from '/public/assets/icons/clock.svg';
import styles from './page.module.scss';

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
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [continuousVideoId, setContinuousVideoId] = useState<string | null>(
    null
  );
  const showcaseName = showcase_name.replaceAll('-', ' ');

  // Fetch continuous video ID for this showcase
  useEffect(() => {
    async function fetchContinuousVideoAndChapters() {
      try {
        // Step 1: Get the continuous video ID for this showcase
        const videoRes = await axios.get(
          `/api/showcases/${showcase_id}/continuous-video`
        );

        const vimeoId = videoRes.data.continuous_vimeo_id;
        setContinuousVideoId(vimeoId);

        // Step 2: Fetch chapters based on continuous video ID
        const chaptersRes = await axios.get(
          `/api/chapters?continuous_vimeo_id=${vimeoId}`
        );
        setChapters(chaptersRes.data);
      } catch (err) {
        console.error('Error loading video or chapters:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchContinuousVideoAndChapters();
  }, [showcase_id]);

  if (loading) return <div>Loading workout...</div>;
  if (!continuousVideoId)
    return <div>No continuous video found for this workout.</div>;

  return (
    <>
      <div className={styles.header}>
        <div className={styles['title-container']}>
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

      <div className={styles.hero}>
        <div className={styles['hero__image-container']}>
          {/* Placeholder for showcase thumbnail */}
        </div>
        <div className={styles.hero__info}>
          <span>
            <Image
              src={playIcon}
              alt="Play icon"
              className={styles.hero__icon}
            />
            {chapters.length} chapters
          </span>
          <span>
            <Image
              src={clockIcon}
              alt="Clock icon"
              className={styles.hero__icon}
            />
            {/* Optional: Total duration */}
          </span>
        </div>
        <p className={styles.hero__description}>Continuous Workout</p>
      </div>

      <ul className={styles.list} role="list">
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <button
              className={styles.chapterButton}
              onClick={() =>
                router.push(
                  `/dashboard/player/${continuousVideoId}?start_time=${chapter.start_time}`
                )
              }
            >
              {chapter.title}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
