'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.scss';
import axios from 'axios';

const url = process.env.NEXT_PUBLIC_APP_URL;

interface Video {
  created_at: string;
  description: string;
  duration: number;
  id: number;
  playbackUrl: string;
  showcase_id: string;
  thumbnail_url: string;
  title: string;
  vimeo_video_id: number;
}

export default function SingleVideoPage() {
  const { video_id } = useParams<{ video_id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getVideo() {
      try {
        const response = await axios.get(`/api/videos/${video_id}`);
        setVideo(response.data);
        setLoading(false);
      } catch (error) {
        console.error(`Unable to retrieve video details from vimeo: ${error}`);
      }
    }

    getVideo();
  }, [video_id]);

  if (loading) {
    return <div>Loading video...</div>;
  }

  return (
    <div className={styles['video-container']}>
      <video controls poster={video?.thumbnail_url} className={styles.video}>
        <source src={`${url}${video?.playbackUrl}`} />
        Watch the
        <a
          href={`${url}${video?.playbackUrl}`}
        >{`${video?.title} workout video`}</a>
      </video>
    </div>
  );
}
