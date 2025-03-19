"use client";
import { useState, useEffect } from "react";
import { usePlaylists } from "../app/(dashboard)/dashboard/context/PlaylistContext";

/** ✅ Define an interface for a saved program (placed outside for reuse) */
export interface SavedProgram {
  userId: string;
  showcaseId: number;
  title: string;
  description: string;
  videoCount: number;
  duration: number;
}

export function useSavedPrograms() {
  const { userId } = usePlaylists();
  const [savedPrograms, setSavedPrograms] = useState<SavedProgram[]>([]);
  const [loading, setLoading] = useState(true);

  /** ✅ Fetch saved programs from API */
  async function fetchPrograms() {
    if (!userId) return;

    try {
      const res = await fetch("/api/saved-programs", {
        headers: { "x-user-id": userId },
      });

      // ✅ Handle empty response before parsing JSON
      if (!res.ok) {
        console.error(`Error fetching programs: ${res.statusText}`);
        return;
      }

      const text = await res.text(); // Get raw response text
      if (!text) {
        setSavedPrograms([]); // ✅ Set empty array if no data
        return;
      }

      const data: SavedProgram[] = JSON.parse(text); // ✅ Parse only if there's content
      setSavedPrograms(data);
    } catch (error) {
      console.error("Error fetching saved programs:", error);
    } finally {
      setLoading(false);
    }
  }

  /** ✅ Refresh function to manually trigger re-fetch */
  function refreshSavedPrograms() {
    fetchPrograms();
  }

  useEffect(() => {
    fetchPrograms();
  }, [userId]);

  /** ✅ Function to Save a Program */
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
        setSavedPrograms((prev) => [...prev, program]); // ✅ Update state with correct type
      } else {
        console.error("Failed to save program.");
      }
    } catch (error) {
      console.error("Error saving program:", error);
    }
  }

  /** ✅ Function to Delete a Program */
  /** ✅ Delete saved program & refresh list */
  async function deleteProgram(showcaseId: number) {
    if (!userId) {
      console.error("Missing userId.");
      return;
    }

    try {
      const response = await fetch(`/api/saved-programs/${showcaseId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      });

      if (response.ok) {
        await refreshSavedPrograms(); // ✅ Ensure fresh data
      } else {
        console.error("❌ Failed to delete program.");
      }
    } catch (error) {
      console.error("Error deleting program:", error);
    }
  }

  useEffect(() => {
    refreshSavedPrograms();
  }, [userId]);

  return {
    savedPrograms,
    loading,
    saveProgram,
    deleteProgram,
    refreshSavedPrograms,
  };
}
