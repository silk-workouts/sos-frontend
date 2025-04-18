"use client";
import Image from "next/image";
import bookmarkIcon from "/public/assets/icons/bookmark.svg";
import { Playlist } from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import { SavedProgram } from "src/types";
import PlayListCard from "../PlayListCard/PlayListCard";
import styles from "./LibraryPageContent.module.scss";

interface LibraryContentProps {
  playlists?: Playlist[];
  savedPrograms?: SavedProgram[];
  refreshSavedPrograms?: () => void;
  type: "myWorkout" | "program";
}

export default function LibraryPageContent({
  playlists = [],
  savedPrograms = [],
  refreshSavedPrograms,
  type,
}: LibraryContentProps) {
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

  if (
    (type === "myWorkout" && playlists.length === 0) ||
    (type === "program" && savedPrograms.length === 0)
  ) {
    return (
      <div className={styles.empty}>
        <p className={styles.empty__title}>
          {type === "myWorkout" && playlists.length === 0
            ? "Build your Silk Workout"
            : "You haven't saved any 100% Prescription Programs yet"}
        </p>

        {type === "myWorkout" && playlists.length === 0 ? (
          <p className={styles.empty__message}>
            Save the videos that challenge you. That push you. That move you.
            This is where it begins.
          </p>
        ) : (
          <p className={styles.empty__message}>
            Start collecting programs you love by clicking on the{" "}
            <Image
              src={bookmarkIcon}
              alt="bookmark icon"
              aria-hidden="true"
              className={styles.empty__icon}
            />{" "}
            <span className={styles["sr-only"]}>bookmark icon</span>
            while you browse
          </p>
        )}
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {combinedPlaylists.map((playlist) => {
        return (
          <li
            key={`${playlist.title}-${playlist.id}`}
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
