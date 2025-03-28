"use client";
import { useState, useEffect } from "react";
import { usePlaylists } from "../app/(dashboard)/dashboard/context/PlaylistContext";
import { SavedProgram } from "src/types";

export function useSavedPrograms() {
  const { userId } = usePlaylists();
  const [savedPrograms, setSavedPrograms] = useState<SavedProgram[]>([]);
  const [loading, setLoading] = useState(true);

  /** ✅ Fetch saved programs from the API */
  async function fetchPrograms() {
    if (!userId) return;

    try {
      const res = await fetch("/api/saved-programs", {
        headers: { "x-user-id": userId },
      });

      if (!res.ok) {
        console.error(`Error fetching programs: ${res.statusText}`);
        return;
      }

      const rawData = await res.json();
      const transformed: SavedProgram[] = rawData.map((program: any) => ({
        userId: program.userId,
        continuousVideoId: program.continuousVideoId,
        title: program.title,
        description: program.description || "",
        videoCount: program.videoCount ?? 0,
        duration: program.duration ?? 0,
        createdAt: program.createdAt,
      }));
      setSavedPrograms(transformed);
    } catch (error) {
      console.error("Error fetching saved programs:", error);
    } finally {
      setLoading(false);
    }
  }

  /** ✅ Manual refresh function */
  function refreshSavedPrograms() {
    fetchPrograms();
  }

  useEffect(() => {
    fetchPrograms();
  }, [userId]);

  /** ✅ Save a continuous video program */
  async function saveProgram(program: SavedProgram) {
    if (!userId) {
      console.error("Missing userId.");
      return;
    }

    try {
      const response = await fetch("/api/saved-programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(program),
      });

      if (response.ok) {
        await fetchPrograms(); // Ensure sync with DB
      } else {
        console.error("Failed to save program.");
      }
    } catch (error) {
      console.error("Error saving program:", error);
    }
  }

  /** ✅ Delete a saved continuous video program */
  async function deleteProgram(continuousVideoId: string) {
    if (!userId) {
      console.error("Missing userId.");
      return;
    }

    try {
      const response = await fetch(`/api/saved-programs/${continuousVideoId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      });

      if (response.ok) {
        await fetchPrograms();
      } else {
        console.error("❌ Failed to delete program.");
      }
    } catch (error) {
      console.error("Error deleting program:", error);
    }
  }

  return {
    savedPrograms,
    loading,
    saveProgram,
    deleteProgram,
    refreshSavedPrograms,
  };
}
