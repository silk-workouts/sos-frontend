"use client";
import styles from "./AddToModal.module.scss";
import AddPlaylistModal from "../AddPlaylistModal/AddPlaylistModal";

interface AddModalProps {
	isOpen: boolean;
	setIsOpen: (arg1: boolean) => void;
	video_id: string;
}

export default function AddToModal({
	isOpen,
	setIsOpen,
	video_id,
}: AddModalProps) {
	function handleCloseModal(event: React.MouseEvent<HTMLDivElement>) {
		const target = event.target;

		if (target instanceof HTMLElement && target.id === "dialog-container") {
			setIsOpen(false);
		}
	}

	return (
		<>
			{isOpen && (
				<div
					className={styles["dialog-container"]}
					onClick={(event) => handleCloseModal(event)}
					id="dialog-container"
					role="dialog button"
				>
					{/* <ul
						className={styles.dialog}
						role="menu"
						aria-label=""
					>
						<li className={styles.dialog__option} role="menuitem">
							<button
								onClick={handleAddQueue}
								className={styles.option__button}
							>
								Add to queue
							</button>
						</li>
						<li className={styles.dialog__option} role="menuitem">
							<button
								onClick={handleAddPlaylist}
								className={styles.option__button}
							>
								Add to playlist
							</button>
						</li>
					</ul> */}
					<AddPlaylistModal setIsOpen={setIsOpen} video_id={video_id} />
				</div>
			)}
		</>
	);
}
