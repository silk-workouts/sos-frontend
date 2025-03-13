'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Player from '@vimeo/player';

interface Chapter {
  id: number;
  title: string;
  start_time: number;
  duration: number | null;
  showcase_id: number;
  continuous_vimeo_id: string;
}

export default function PlayerPage() {
  const { continuous_vimeo_id } = useParams<{ continuous_vimeo_id: string }>();
  const searchParams = useSearchParams();
  const initialStartTime = searchParams.get('start_time')
    ? parseInt(searchParams.get('start_time') as string, 10)
    : null;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);

  // Fetch chapters first
  useEffect(() => {
    async function fetchChapters() {
      try {
        const res = await fetch(
          `/api/chapters?continuous_vimeo_id=${continuous_vimeo_id}`
        );
        const data: Chapter[] = await res.json();
        setChapters(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading chapters:', error);
        setLoading(false);
      }
    }
    fetchChapters();
  }, [continuous_vimeo_id]);

  // Setup Vimeo player AFTER chapters and data are loaded
  useEffect(() => {
    if (loading || !playerContainerRef.current) return;

    let player: Player;

    const setupPlayer = async () => {
      // Clear previous player if any (important when clicking from multiple showcases)
      if (vimeoPlayerRef.current) {
        vimeoPlayerRef.current.unload().catch(() => {});
        vimeoPlayerRef.current.destroy().catch(() => {});
        vimeoPlayerRef.current = null;
      }

      // ✅ Now create fresh player
      player = new Player(playerContainerRef.current!, {
        id: parseInt(continuous_vimeo_id, 10),
        responsive: true,
        autoplay: false, // We control when to play
      });

      vimeoPlayerRef.current = player;

      player.ready().then(async () => {
        let startAt = 0;
        if (initialStartTime !== null) {
          startAt = initialStartTime;
        }

        // Set start time
        await player.setCurrentTime(startAt);
        await player.play(); // Auto play AFTER setting time

        setPlayerReady(true); // Show player now

        // Handle active chapter detection
        player.on('timeupdate', (data) => {
          const currentTime = data.seconds;
          const index =
            chapters
              .map((ch) => ch.start_time)
              .filter((time) => time <= currentTime).length - 1;

          if (index !== activeChapterIndex) {
            setActiveChapterIndex(index);
          }
        });
      });
    };

    setupPlayer();

    // Cleanup when component unmounts or when switching videos
    return () => {
      if (player) player.destroy().catch(() => {});
    };
  }, [loading, continuous_vimeo_id, chapters, initialStartTime]);

  // Set active chapter index on load based on start time
  useEffect(() => {
    if (chapters.length > 0 && initialStartTime !== null) {
      const index = chapters.findIndex(
        (chapter) => initialStartTime >= chapter.start_time
      );
      setActiveChapterIndex(index !== -1 ? index : null);
    }
  }, [chapters, initialStartTime]);

  // Handle chapter click to jump within video
  const handleChapterClick = (chapter: Chapter, index: number) => {
    if (vimeoPlayerRef.current) {
      vimeoPlayerRef.current.setCurrentTime(chapter.start_time).then(() => {
        vimeoPlayerRef.current?.play();
        setActiveChapterIndex(index);
      });
    }
  };

  if (loading) return <div>Loading workout...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Video Player Page</h1>
      <div style={{ marginBottom: '20px' }}>
        <strong>Continuous Video ID:</strong> {continuous_vimeo_id}
        {initialStartTime !== null && (
          <p>
            <strong>Start Time:</strong> {initialStartTime} seconds
          </p>
        )}
      </div>

      {/* Player container (HIDDEN until fully ready) */}
      <div
        ref={playerContainerRef}
        style={{
          width: '100%',
          height: '500px',
          visibility: playerReady ? 'visible' : 'hidden',
          transition: 'visibility 0.3s ease-in-out',
        }}
      ></div>

      <h2>Chapters</h2>
      <ul style={{ marginTop: '20px', padding: 0 }}>
        {chapters.map((chapter, index) => (
          <li
            key={chapter.id}
            onClick={() => handleChapterClick(chapter, index)}
            style={{
              listStyle: 'none',
              cursor: 'pointer',
              padding: '12px 16px',
              marginBottom: '8px',
              borderRadius: '6px',
              border:
                activeChapterIndex === index
                  ? '3px solid #0070f3'
                  : '1px solid #ddd',
              background:
                activeChapterIndex === index
                  ? 'rgba(0, 112, 243, 0.1)'
                  : '#f9f9f9',
              transition: 'all 0.2s ease-in-out',
              fontWeight: activeChapterIndex === index ? 'bold' : 'normal',
            }}
          >
            {chapter.title} — {chapter.start_time}s
          </li>
        ))}
      </ul>
    </div>
  );
}
