"use client";
import axios from "axios";
import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import editIcon from "/public/assets/icons/edit.svg";
import deleteIcon from "/public/assets/icons/trash.svg";
import EditPlaylistModal from "../EditPlaylistModal/EditPlaylistModal";
import DeletePlaylistModal from "../DeletePlaylistModal/DeletePlaylistModal";
import {
	Playlist,
	usePlaylists,
} from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import styles from "./PlaylistModal.module.scss";

interface PlaylistModalProps {
	setIsOpen: (arg1: boolean) => void;
	playlist: Playlist;
}

export default function PlaylistModal({
	setIsOpen,
	playlist,
}: PlaylistModalProps) {
	const router = useRouter();
	const pathname = usePathname();
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

			if (pathname !== "/dashboard/library") router.push("/dashboard/library");

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
			{isOpenEditModal || isOpenDeleteModal || (
				<ul
					className={`${styles.dialog} ${styles["dialog--tablet"]}`}
					role="menu"
					aria-label=""
				>
					<li
						className={`${styles.dialog__option} ${styles["dialog__option--tablet"]}`}
						role="menuitem"
					>
						<button
							className={`${styles.option__button} ${styles["option__button--tablet"]}`}
							onClick={() => {
								setIsOpenEditModal(true);
							}}
						>
							<Image src={editIcon} alt="" />
							<span>Edit</span>
						</button>
					</li>
					<li
						className={`${styles.dialog__option} ${styles["dialog__option--tablet"]}`}
						role="menuitem"
					>
						<button
							className={`${styles.option__button} ${styles["option__button--tablet"]}`}
							onClick={() => setIsOpenDeleteModal(true)}
						>
							<Image src={deleteIcon} alt="" />
							<span>Delete</span>
						</button>
					</li>
				</ul>
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
