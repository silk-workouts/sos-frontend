import axios, { isAxiosError } from "axios";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import loadingSpinner from "/public/assets/gifs/spinner.svg";
import closeIcon from "/public/assets/icons/close.svg";
import Button from "@/components/ui/Button/Button";
import styles from "./NewPlaylistModal.module.scss";

interface NewPlaylistProps {
  setIsOpen: (arg1: boolean) => void;
  video_id: string;
  userId: string;
  refreshPlaylists: () => Promise<void>;
  setIsOpenNewPlaylistModal: (arg1: boolean) => void;
}
export default function NewPlaylistModal({
  setIsOpen,
  video_id,
  userId,
  refreshPlaylists,
  setIsOpenNewPlaylistModal,
}: NewPlaylistProps) {
  const [data, setData] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleOnChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    setData({ ...data, [name]: value });
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    if (!data.title.trim()) {
      setError("Enter a title for your new playlist");
      setIsSaving(false);
      return;
    }

    try {
      const response = await axios.post(
        "/api/playlists",
        { title: data.title.trim(), description: data.description },
        {
          headers: { "x-user-id": userId },
        }
      );

      const playlistId = response.data.playlistId;

      await axios.post(
        `/api/playlists/${playlistId}/videos`,
        {
          vimeo_video_id: video_id,
        },
        { headers: { "x-user-id": userId } }
      );
      refreshPlaylists();
      setIsSaving(false);
      setIsOpenNewPlaylistModal(false);
      setIsOpen(false);
    } catch (error) {
      console.error(`Unable to save new playlist: ${error}`);
      setIsSaving(false);

      if (isAxiosError(error)) {
        alert(`Error: ${error.response?.statusText}`);
      } else {
        alert(error);
      }
    }
  }

  return (
    <div className={styles.dialog}>
      <article className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.header__title}>New playlist</h2>
          <button
            className={`${styles.button} ${styles.header__button}`}
            onClick={() => {
              setIsOpen(false);
              setIsOpenNewPlaylistModal(false);
            }}
            aria-label="Close add to new playlist modal"
          >
            <Image src={closeIcon} alt="" className={styles.header__icon} />
          </button>
        </header>
        <form className={styles.form} onSubmit={(event) => handleSubmit(event)}>
          <div className={styles["form__input-container"]}>
            <label htmlFor="title" className={styles.form__label}>
              title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={data.title}
              onChange={handleOnChange}
              className={`${styles.form__input} ${error ? styles.error : ""}`}
            />
            {error && <p className={styles.form__error}>{error}</p>}
          </div>
          <div className={styles["form__input-container"]}>
            <label htmlFor="description" className={styles.form__label}>
              description
              <span className={styles.optional}> *optional</span>
            </label>
            <textarea
              name="description"
              id="description"
              value={data.description}
              onChange={handleOnChange}
              className={`${styles.form__input} ${styles["form__input--text"]}`}
            ></textarea>
          </div>
          <div className={styles["form__button-container"]}>
            <Button
              variant="text"
              onClick={() => {
                setIsOpen(false);
                setIsOpenNewPlaylistModal(false);
              }}
              className={styles["button--cancel"]}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
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
                  />
                  <span>saving...</span>
                </span>
              ) : (
                <span>save</span>
              )}
            </Button>
          </div>
        </form>
      </article>
    </div>
  );
}
