import { createPortal } from "react-dom";
import axios, { isAxiosError } from "axios";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import loadingSpinner from "/public/assets/gifs/spinner.svg";
import closeIcon from "/public/assets/icons/close.svg";
import { Playlist } from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import Button from "@/components/ui/Button/Button";
import styles from "./EditPlaylistModal.module.scss";

interface EditPlaylistProps {
  handleClose: () => void;
  playlist: Playlist;
  userId: string;
  refreshPlaylists: () => Promise<void>;
}
export default function EditPlaylistModal({
  handleClose,
  playlist,
  userId,
  refreshPlaylists,
}: EditPlaylistProps) {
  const [data, setData] = useState({
    title: playlist.title,
    description: playlist.description || "",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleCloseModal(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target;

    if (target instanceof HTMLElement && target.id === "dialog-container") {
      handleClose();
    }
  }

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
      setError("Enter a valid title for your playlist");
      setIsSaving(false);
      return;
    }

    try {
      await axios.patch(`/api/playlists/${playlist.id}`, data, {
        headers: { "x-user-id": userId },
      });

      refreshPlaylists();
      setIsSaving(false);
      handleClose();
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

  const modalRoot = document.getElementById("modal-root") || document.body;

  return createPortal(
    <div
      className={styles["dialog-container"]}
      onClick={(event) => handleCloseModal(event)}
      id="dialog-container"
      role="dialog button"
    >
      <div className={styles.dialog}>
        <article className={styles.container}>
          <header className={styles.header}>
            <h2 className={styles.header__title}>Edit playlist</h2>
            <button
              className={`${styles.button} ${styles.header__button}`}
              onClick={handleClose}
              aria-label="Close edit playlist modal"
            >
              <Image
                src={closeIcon}
                alt=""
                className={styles.header__icon}
                aria-hidden="true"
              />
            </button>
          </header>
          <form
            className={styles.form}
            onSubmit={(event) => handleSubmit(event)}
          >
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
                onClick={handleClose}
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
    </div>,
    modalRoot
  );
}
