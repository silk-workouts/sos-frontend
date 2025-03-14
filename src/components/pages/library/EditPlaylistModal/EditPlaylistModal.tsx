import Image from "next/image";
import closeIcon from "/public/assets/icons/close.svg";
import styles from "./EditPlaylistModal.module.scss";
import { ChangeEvent, useState } from "react";
import axios from "axios";

// interface EditPlaylistProps {
// 	setIsOpen: (arg1: boolean) => void;
// 	playlist: string;
// 	userId: string;
// 	refreshPlaylists: () => Promise<void>;
// }
export default function EditPlaylistModal({
	handleClose,
	playlist,
	userId,
	refreshPlaylists,
}) {
	const [data, setData] = useState({
		title: playlist.title,
		description: playlist.description,
	});

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
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!data.title.trim()) {
			alert("Please input a title for your new playlist");
			return;
		}

		try {
			await axios.patch(`/api/playlists/${playlist.id}`, data, {
				headers: { "x-user-id": userId },
			});

			handleClose();
			refreshPlaylists();
		} catch (error) {
			console.error(`Unable to save new playlist: ${error}`);
		}
	}

	return (
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
							onClick={() => {
								handleClose();
							}}
							aria-label="Close edit playlist modal"
						>
							<Image src={closeIcon} alt="" className={styles.header__icon} />
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
		</div>
	);
}
