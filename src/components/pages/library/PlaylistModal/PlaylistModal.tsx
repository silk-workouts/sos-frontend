"use client";
import editIcon from "/public/assets/icons/edit.svg";
import deleteIcon from "/public/assets/icons/trash.svg";
import styles from "./PlaylistModal.module.scss";
import Image from "next/image";
import EditPlaylistModal from "../EditPlaylistModal/EditPlaylistModal";
import DeletePlaylistModal from "../DeletePlaylistModal/DeletePlaylistModal";
import { useState } from "react";
import { usePlaylists } from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import axios from "axios";

// interface PlaylistModalProps {
// 	setIsOpen: (arg1: boolean) => void;
// 	playlist: string;
// }

export default function PlaylistModal({ setIsOpen, playlist }) {
	const [isOpenEditModal, setIsOpenEditModal] = useState(false);
	const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

	const { refreshPlaylists, userId } = usePlaylists();

	function handleCloseModal(event: React.MouseEvent<HTMLDivElement>) {
		const target = event.target;

		if (target instanceof HTMLElement && target.id === "dialog-container") {
			setIsOpen(false);
		}
	}

	async function handleDeletePlaylist() {
		try {
			await axios.delete(`/api/playlists/${playlist.id}`, {
				headers: { "x-user-id": userId },
			});
			refreshPlaylists();
			setIsOpenDeleteModal(false);
			setIsOpen(false);
		} catch (error) {
			console.error(
				`Unable to delete playlist with id ${playlist.id}: ${error}`
			);
		}
	}

	function handleCloseEditModal() {
		setIsOpenEditModal(false);
		setIsOpen(false);
	}

	function handleCloseDeleteModal() {
		setIsOpenDeleteModal(false);
		setIsOpen(false);
	}

	return (
		<>
			{isOpenEditModal || isOpenDeleteModal || (
				<div
					className={styles["dialog-container"]}
					onClick={(event) => handleCloseModal(event)}
					id="dialog-container"
					role="dialog button"
				>
					<ul className={styles.dialog} role="menu" aria-label="">
						<li className={styles.dialog__option} role="menuitem">
							<button
								className={styles.option__button}
								onClick={() => {
									setIsOpenEditModal(true);
								}}
							>
								<Image src={editIcon} alt="" />
								<span>Edit</span>
							</button>
						</li>
						<li className={styles.dialog__option} role="menuitem">
							<button
								className={styles.option__button}
								onClick={() => setIsOpenDeleteModal(true)}
							>
								<Image src={deleteIcon} alt="" />
								<span>Delete</span>
							</button>
						</li>
					</ul>
				</div>
			)}
			{isOpenEditModal && (
				<EditPlaylistModal
					handleClose={handleCloseEditModal}
					playlist={playlist}
					userId={userId}
					refreshPlaylists={refreshPlaylists}
				/>
			)}
			{isOpenDeleteModal && (
				<DeletePlaylistModal
					handleClose={handleCloseDeleteModal}
					handleDelete={handleDeletePlaylist}
				/>
			)}
		</>
	);
}
