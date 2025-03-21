"use client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
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

	const modalRef = useRef<HTMLUListElement | null>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

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
					id="dialog-container"
					role="dialog button"
				>
					<ul
						className={styles.dialog}
						role="menu"
						aria-label=""
						ref={modalRef}
					>
						{playlist.type !== "savedProgram" && ( // ✅ Hide "Edit" for saved programs
							<li className={styles.dialog__option} role="menuitem">
								<button
									className={styles.option__button}
									onClick={() => {
										setIsOpenEditModal(true);
									}}
								>
									<Image src={editIcon} alt="" />
									<span>
										Edit <span className={styles.tablet}>Playlist</span>
									</span>
								</button>
							</li>
						)}
						<li className={styles.dialog__option} role="menuitem">
							<button
								className={styles.option__button}
								onClick={() => setIsOpenDeleteModal(true)}
							>
								<Image src={deleteIcon} alt="" />
								<span>
									Delete <span className={styles.tablet}>Playlist</span>
								</span>
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
					handleDelete={handleDelete}
					title={playlist.title}
				/>
			)}
		</>
	);
}
