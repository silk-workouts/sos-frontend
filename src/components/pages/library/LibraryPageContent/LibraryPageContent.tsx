"use client";
import { Playlist } from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import { SavedProgram } from "src/types";
import PlayListCard from "../PlayListCard/PlayListCard";
import styles from "./LibraryPageContent.module.scss";

interface LibraryContentProps {
  playlists?: Playlist[];
  savedPrograms?: SavedProgram[];
  refreshSavedPrograms?: () => void;
}

export default function LibraryPageContent({
  playlists = [],
  savedPrograms = [],
  refreshSavedPrograms,
}: LibraryContentProps) {
  console.log(savedPrograms);
  const combinedPlaylists: Playlist[] = [
    ...playlists.map((p) => ({
      ...p,
      type: "custom" as const,
    })),
    ...savedPrograms.map((program) => ({
      id: String(program.continuousVideoId), // Ensure ID is a string
      title: program.title,
      description: program.description || "",
      created_at: "", // No created_at field in savedPrograms
      user_id: "", // Not needed for saved programs
      type: "savedProgram" as const,
    })),
  ];

  return (
    <ul className={styles.list}>
      {combinedPlaylists.map((playlist) => {
        return (
          <li
            key={`${playlist.type}-${playlist.id}`}
            className={styles.list__item}
          >
            <PlayListCard
              playlist={playlist}
              refreshSavedPrograms={refreshSavedPrograms}
            />
          </li>
        );
      })}
    </ul>
  );
}
