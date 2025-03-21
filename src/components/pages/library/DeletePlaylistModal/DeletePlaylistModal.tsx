import Image from "next/image";
import closeIcon from "/public/assets/icons/close.svg";
import styles from "./DeletePlaylistModal.module.scss";

interface DeletePlaylistProps {
	handleClose: () => void;
	handleDelete: () => Promise<void>;
	title: string;
}

export default function DeletePlaylistModal({
	handleClose,
	handleDelete,
	title,
}: DeletePlaylistProps) {
	return (
		<div className={styles.modal} role="dialog" aria-labelledby="dialogTitle">
			<div className={styles["modal-container"]}>
				<div className={styles.modal__header}>
					<h1 id="dialogTitle" className={styles.modal__title}>
						delete playlist?
					</h1>

					<button
						className={styles.modal__button}
						aria-label="Cancel delete"
						onClick={handleClose}
					>
						<Image
							src={closeIcon}
							alt=""
							className={styles.modal__icon}
							aria-hidden="true"
						/>
					</button>
				</div>
				<p className={styles.modal__description}>
					{" "}
					Are you sure you want to delete{" "}
					<span className={styles.title}>{title} </span>from your library?
				</p>

				<button
					onClick={handleDelete}
					className={`${styles.modal__button} ${styles["modal__button--delete"]}`}
				>
					Delete
				</button>
			</div>
		</div>
	);
}
