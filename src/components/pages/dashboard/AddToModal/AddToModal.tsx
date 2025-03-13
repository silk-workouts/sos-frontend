"use client";
import styles from "./AddToModal.module.scss";
import AddPlaylistModal from "../AddPlaylistModal/AddPlaylistModal";
import { useState } from "react";

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
	const [isOpenAddPlaylistModal, setIsOpenAddPlaylistModal] = useState(false);

	function handleCloseModal(event: React.MouseEvent<HTMLDivElement>) {
		const target = event.target;

		if (target instanceof HTMLElement && target.id === "dialog-container") {
			setIsOpen(false);
			setIsOpenAddPlaylistModal(false);
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
					{isOpenAddPlaylistModal || (
						<ul className={styles.dialog} role="menu" aria-label="">
							<li className={styles.dialog__option} role="menuitem">
								<button className={styles.option__button}>Add to queue</button>
							</li>
							<li className={styles.dialog__option} role="menuitem">
								<button
									onClick={() => setIsOpenAddPlaylistModal(true)}
									className={styles.option__button}
								>
									Add to playlist
								</button>
							</li>
						</ul>
					)}
					{isOpenAddPlaylistModal && (
						<AddPlaylistModal
							setIsOpen={setIsOpen}
							video_id={video_id}
							setIsOpenAddPlaylistModal={setIsOpenAddPlaylistModal}
						/>
					)}
				</div>
			)}
		</>
	);
}
