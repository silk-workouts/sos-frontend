"use client";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

export interface Playlist {
  created_at: string;
  description: string;
  id: string;
  title: string;
  user_id: string;
  type?: "custom" | "savedProgram";
}

interface PlaylistVideoMap {
  [videoVimeoId: string]: string[];
}

export interface PlaylistsContextType {
  playlists: Playlist[];
  playlistVideoMap: PlaylistVideoMap;
  loading: boolean;
  error: string;
  refreshPlaylists: () => Promise<void>;
  userId: string;
}

const PlaylistsContext = createContext<PlaylistsContextType>({
  playlists: [],
  playlistVideoMap: {},
  loading: true,
  error: "",
  refreshPlaylists: async () => {},
  userId: "",
});

export default function PlaylistsProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistVideoMap, setPlaylistVideoMap] = useState<PlaylistVideoMap>(
    {}
  ); //Allows us to know what playlist(s) a video is saved to
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await axios.get("/api/auth/status", {
          withCredentials: true,
        });

        if (response.status === 200) {
          setUserId(response.data.userId);
        } else {
          setUserId("");
        }
      } catch (error) {
        console.error(`Unable to fetch user authentication status: ${error}`);
        setUserId("");
      }
    }

    checkStatus();
  }, []);

  async function getPlaylists() {
    setLoading(true);

    try {
      const response = await axios.get("/api/playlists", {
        headers: { "x-user-id": userId },
      });

      const fetchedPlaylists = response.data.playlists;

      //Creates a mapping of video vimeo ids to playlist ids
      const videoRequests = fetchedPlaylists.map((playlist: Playlist) =>
        axios.get(`/api/playlists/${playlist.id}`, {
          headers: { "x-user-id": userId },
        })
      );

      const videoResponses = await Promise.all(videoRequests);
      const playlistVideos = videoResponses
        .map((res) => res.data.videos)
        .flat();

      const VideoMap: PlaylistVideoMap = {};
      playlistVideos.forEach((video) => {
        const id = `${video.vimeo_video_id}`;

        if (VideoMap[id]) {
          VideoMap[id].push(video.playlist_id);
        } else {
          VideoMap[id] = [video.playlist_id];
        }
      });

      setPlaylists(fetchedPlaylists);
      setPlaylistVideoMap(VideoMap);
      setError("");
    } catch (error) {
      console.error(`Unable to retrieve playlists: ${error}`);
      setError("Failed to load playlists");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userId) {
      getPlaylists();
    }
  }, [userId]);

  useEffect(() => {}, [playlists]);

  return (
    <PlaylistsContext.Provider
      value={{
        playlists,
        playlistVideoMap,
        loading,
        error,
        refreshPlaylists: getPlaylists,
        userId,
      }}
    >
      {children}
    </PlaylistsContext.Provider>
  );
}

export function usePlaylists() {
  const context = useContext(PlaylistsContext);
  return context;
}
