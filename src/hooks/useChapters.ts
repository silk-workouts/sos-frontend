import { useEffect, useState } from "react";
import axios from "axios";

interface Chapter {
  id: number;
  title: string;
  start_time: number;
  duration: number | null;
  continuous_video_id: string;
  continuous_vimeo_id: string;
}

export const useChapters = (continuousVimeoId: string) => {
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const { data } = await axios.get(
          `/api/chapters?continuous_vimeo_id=${continuousVimeoId}`
        );
        setChapters(data);
      } catch (err: any) {
        console.error("Failed to fetch chapters:", err);
        setError("Failed to fetch chapters");
      } finally {
        setLoading(false);
      }
    };

    if (continuousVimeoId) {
      fetchChapters();
    }
  }, [continuousVimeoId]);

  return { chapters, loading, error };
};
