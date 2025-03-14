import Image from "next/image";
import closeIcon from "/public/assets/icons/close.svg";
import styles from "./NewPlaylistModal.module.scss";
import { ChangeEvent, useState } from "react";
import axios from "axios";

interface NewPlaylistProps {
	setIsOpen: (arg1: boolean) => void;
	video_id: string;
	userId: string;
	refreshPlaylists: () => Promise<void>;
	setIsOpenNewPlaylistModal: (arg1: boolean) => void;
	setIsOpenAddPlaylistModal: (arg1: boolean) => void;
}
export default function NewPlaylistModal({
	setIsOpen,
	video_id,
	userId,
	refreshPlaylists,
	setIsOpenNewPlaylistModal,
	setIsOpenAddPlaylistModal,
}: NewPlaylistProps) {
	const [data, setData] = useState({ title: "", description: "" });

	function handleOnChange(
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) {
		const { name, value } = event.target;
		setData({ ...data, [name]: value });
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!data.title.trim()) {
			alert("Please input a title for your new playlist");
			return;
		}

		try {
			const response = await axios.post("/api/playlists", data, {
				headers: { "x-user-id": userId },
			});

			const playlistId = response.data.playlistId;

			await axios.post(
				`/api/playlists/${playlistId}/videos`,
				{
					vimeo_video_id: video_id,
				},
				{ headers: { "x-user-id": userId } }
			);
			setIsOpen(false);
			refreshPlaylists();
		} catch (error) {
			console.error(`Unable to save new playlist: ${error}`);
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
							setIsOpenAddPlaylistModal(false);
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
							className={styles.form__input}
						/>
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
					<button type="submit" className={styles.button}>
						{" "}
						Save
					</button>
				</form>
			</article>
		</div>
	);
}
