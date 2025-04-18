import { useState, useEffect } from "react";
import axios, { isAxiosError } from "axios";
import Image from "next/image";
import loadingSpinner from "/public/assets/gifs/spinner.svg";
import closeIcon from "/public/assets/icons/close.svg";
import addIcon from "/public/assets/icons/plus.svg";
import { usePlaylists } from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import NewPlaylistModal from "../NewPlaylistModal/NewPlaylistModal";
import Button from "@/components/ui/Button/Button";
import styles from "./AddPlaylistModal.module.scss";

interface PlaylistModalProps {
  setIsOpen: (arg1: boolean) => void;
  video_id: string;
}

export default function AddPlaylistModal({
  setIsOpen,
  video_id,
}: PlaylistModalProps) {
  const {
    playlists,
    playlistVideoMap,
    loading,
    error,
    refreshPlaylists,
    userId,
  } = usePlaylists();
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>(
    playlistVideoMap[video_id] ? playlistVideoMap[video_id] : []
  );
  const [isOpenNewPlaylistModal, setIsOpenNewPlaylistModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleSelectCheckbox(playlistId: string) {
    setSelectedPlaylists((prev) =>
      prev.includes(playlistId)
        ? prev.filter((id) => id !== playlistId)
        : [...prev, playlistId]
    );
  }

  async function handleSavePlaylist() {
    setIsSaving(true);

    const prevSavedPlaylists = playlistVideoMap[video_id]
      ? playlistVideoMap[video_id]
      : [];

    try {
      if (prevSavedPlaylists.length > 0 || selectedPlaylists.length > 0) {
        //Save video to playlist(s) that it was not previously saved to
        const saveRequests = selectedPlaylists
          .filter((playlistId) => !prevSavedPlaylists.includes(playlistId))
          .map((playlistId) =>
            axios.post(
              `/api/playlists/${playlistId}/videos`,
              {
                vimeo_video_id: video_id,
              },
              { headers: { "x-user-id": userId } }
            )
          );

        //Delete video from playlists that were previously saved to but are now unchecked
        const deleteRequests = await Promise.all(
          prevSavedPlaylists
            .filter((playlistId) => !selectedPlaylists.includes(playlistId))
            .map(async (playlistId) => {
              try {
                // Fetch the playlist details to find the correct video id
                const response = await axios.get(
                  `/api/playlists/${playlistId}`,
                  {
                    headers: { "x-user-id": userId },
                  }
                );

                // Find the video with the matching vimeo_video_id
                const video = response.data.videos.find(
                  (v: { vimeo_video_id: number }) =>
                    v.vimeo_video_id === parseInt(video_id)
                );

                if (video) {
                  // Send the delete request with the correct video id
                  return axios.delete(
                    `/api/playlists/${playlistId}/videos/${video.id}`,
                    {
                      headers: { "x-user-id": userId },
                    }
                  );
                } else {
                  console.warn(
                    `Video with Vimeo ID ${video_id} not found in playlist ${playlistId}`
                  );
                  return null;
                }
              } catch (error) {
                if (error instanceof Error) {
                  console.error(
                    `Error fetching playlist ${playlistId}: ${error.message}`
                  );
                } else {
                  console.error(
                    `Unknown error fetching playlist ${playlistId}: ${String(
                      error
                    )}`
                  );
                }
              }
            })
        );

        // Filter out any null responses from failed delete requests
        const successfulDeletes = deleteRequests.filter((req) => req !== null);

        // Await all save and successful delete requests
        await Promise.all([...saveRequests, ...successfulDeletes]);

        refreshPlaylists();
      }

      setIsSaving(false);
      setIsOpen(false);
    } catch (error) {
      console.error(`Unable to save to playlists: ${error}`);
      setIsSaving(false);

      if (isAxiosError(error)) {
        alert(`Error: ${error.response?.statusText}`);
      } else {
        alert(error);
      }
    }
  }

  function handleCloseModal(event: React.MouseEvent<HTMLDivElement>) {
    if (
      event.target instanceof HTMLElement &&
      event.target.id === "dialog-container"
    ) {
      setIsOpen(false);
    }
  }

  return (
    <div
      className={styles["dialog-container"]}
      onClick={(event) => {
        event.stopPropagation();
        handleCloseModal(event);
      }}
      id="dialog-container"
      role="dialog button"
    >
      {!isOpenNewPlaylistModal && (
        <div className={styles.dialog}>
          <article className={styles.container}>
            <header className={styles.header}>
              <h3 className={styles.header__title}>Save video to...</h3>
              <button
                className={styles.button}
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
                aria-label="Close Add To Playlist Modal"
              >
                <Image
                  src={closeIcon}
                  alt=""
                  className={styles.icon}
                  aria-hidden="true"
                />
              </button>
            </header>
            {loading && (
              <div className={styles.loading}>
                <Image
                  src={loadingSpinner}
                  alt={`List of playlists is loading`}
                  width={36}
                  height={36}
                  className={styles.spinner}
                />
              </div>
            )}
            {error && <span className={styles.error}>{`Error: ${error}`}</span>}
            {!loading && !error && playlists.length > 0 && (
              <ul className={styles.list} role="list">
                {playlists.map((playlist) => {
                  return (
                    <li key={playlist.id}>
                      <label className={styles.label}>
                        <input
                          type="checkbox"
                          value={playlist.id}
                          checked={selectedPlaylists.includes(playlist.id)}
                          onChange={() => handleSelectCheckbox(playlist.id)}
                          className={styles.input}
                        />{" "}
                        <span>{playlist.title}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            <button
              className={`${styles.button} ${styles["button--add"]}`}
              onClick={() => setIsOpenNewPlaylistModal(true)}
            >
              <Image
                src={addIcon}
                alt=""
                className={styles.icon}
                aria-hidden="true"
              />
              <span>New playlist</span>
            </button>
            <Button
              variant="secondary"
              onClick={handleSavePlaylist}
              disabled={isSaving}
              className={styles["button--save"]}
            >
              {isSaving ? (
                <span>
                  <Image
                    src={loadingSpinner}
                    alt={`List of playlists is loading`}
                    width={20}
                    height={20}
                    className={styles.icon}
                  />{" "}
                  <span>saving...</span>
                </span>
              ) : (
                <span>save</span>
              )}
            </Button>
          </article>
        </div>
      )}
      {isOpenNewPlaylistModal && (
        <NewPlaylistModal
          setIsOpen={setIsOpen}
          video_id={video_id}
          userId={userId}
          refreshPlaylists={refreshPlaylists}
          setIsOpenNewPlaylistModal={setIsOpenNewPlaylistModal}
        />
      )}
    </div>
  );
}
