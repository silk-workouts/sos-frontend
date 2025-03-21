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
import { useSavedPrograms } from "src/hooks/useSavedPrograms"; // ✅ Import useSavedPrograms
import styles from "./PlaylistModal.module.scss";

interface PlaylistModalProps {
	setIsOpen: (arg1: boolean) => void;
	playlist: Playlist;
	refreshSavedPrograms?: () => void; // ✅ Passed from parent component
}

export default function PlaylistModal({
	setIsOpen,
	playlist,
	refreshSavedPrograms,
}: PlaylistModalProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [isOpenEditModal, setIsOpenEditModal] = useState(false);
	const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

	const { refreshPlaylists, userId } = usePlaylists();
	const { deleteProgram, refreshSavedPrograms: refreshSavedProgramsFromHook } =
		useSavedPrograms();

	function handleCloseModal(event: React.MouseEvent<HTMLDivElement>) {
		if (
			event.target instanceof HTMLElement &&
			event.target.id === "dialog-container"
		) {
			setIsOpen(false);
		}
	}

	async function handleDelete() {
		try {
			if (playlist.type === "savedProgram") {
				// ✅ Call delete for saved programs
				await deleteProgram(Number(playlist.id));
				refreshSavedPrograms?.(); // ✅ Use the prop if available
				refreshSavedProgramsFromHook(); // ✅ Ensure state is refreshed
			} else {
				await axios.delete(`/api/playlists/${playlist.id}`, {
					headers: { "x-user-id": userId },
				});

				if (pathname !== "/dashboard/library")
					router.push("/dashboard/library");

				refreshPlaylists();
			}
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
			{!isOpenEditModal && !isOpenDeleteModal && (
				<div
					className={styles["dialog-container"]}
					onClick={handleCloseModal}
					id="dialog-container"
					role="dialog button"
				>
					<ul className={styles.dialog} role="menu" aria-label="">
						{playlist.type !== "savedProgram" && ( // ✅ Hide "Edit" for saved programs
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
						)}
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
			{!isOpenEditModal && !isOpenDeleteModal && (
				<ul
					className={`${styles.dialog} ${styles["dialog--tablet"]}`}
					role="menu"
					aria-label=""
				>
					{playlist.type !== "savedProgram" && (
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
					)}
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
					handleDelete={handleDelete}
				/>
			)}
		</>
	);
}
