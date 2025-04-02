import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import closeIcon from "/public/assets/icons/close.svg";
import addIcon from "/public/assets/icons/plus.svg";
import { usePlaylists } from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import NewPlaylistModal from "../NewPlaylistModal/NewPlaylistModal";
import styles from "./AddPlaylistModal.module.scss";

interface PlaylistModalProps {
	setIsOpen: (arg1: boolean) => void;
	video_id: string;
}

export default function AddPlaylistModal({
	setIsOpen,
	video_id,
}: PlaylistModalProps) {
	const {
		playlists,
		playlistVideoMap,
		loading,
		error,
		refreshPlaylists,
		userId,
	} = usePlaylists();
	const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>(
		playlistVideoMap[video_id] ? playlistVideoMap[video_id] : []
	);
	const [isOpenNewPlaylistModal, setIsOpenNewPlaylistModal] = useState(false);

	function handleSelectCheckbox(playlistId: string) {
		setSelectedPlaylists((prev) =>
			prev.includes(playlistId)
				? prev.filter((id) => id !== playlistId)
				: [...prev, playlistId]
		);
	}

	async function handleSavePlaylist() {
		const prevSavedPlaylists = playlistVideoMap[video_id]
			? playlistVideoMap[video_id]
			: [];

		try {
			if (prevSavedPlaylists.length > 0 || selectedPlaylists.length > 0) {
				//Save video to playlists that were not previously saved to
				const saveRequests = selectedPlaylists
					.filter((playlistId) => !prevSavedPlaylists.includes(playlistId))
					.map((playlistId) =>
						axios.post(
							`/api/playlists/${playlistId}/videos`,
							{
								vimeo_video_id: video_id,
							},
							{ headers: { "x-user-id": userId } }
						)
					);

				//Delete video from playlists that were previously saved to but are now unchecked
				// const deleteRequests = prevSavedPlaylists
				// 	.filter((playlistId) => !selectedPlaylists.includes(playlistId))
				// 	.map((playlistId) =>
				// 		axios.delete(`/api/playlists/${playlistId}/videos/${video_id}`, {
				// 			headers: { "x-user-id": userId },
				// 		})
				// 	);

				await Promise.all([...saveRequests /**...deleteRequests */]);

				refreshPlaylists();
			}
			setIsOpen(false);
		} catch (error) {
			console.error(`Unable to save to playlists: ${error}`);
		}
	}

	function handleCloseModal(event: React.MouseEvent<HTMLDivElement>) {
		if (
			event.target instanceof HTMLElement &&
			event.target.id === "dialog-container"
		) {
			setIsOpen(false);
		}
	}

	return (
		<div
			className={styles["dialog-container"]}
			onClick={(event) => {
				event.stopPropagation();
				handleCloseModal(event);
			}}
			id="dialog-container"
			role="dialog button"
		>
			{!isOpenNewPlaylistModal && (
				<div className={styles.dialog}>
					<article className={styles.container}>
						<header className={styles.header}>
							<h3 className={styles.header__title}>Save to...</h3>
							<button
								className={styles.button}
								onClick={() => setIsOpen(false)}
								aria-label="Close Add To Playlist Modal"
							>
								<Image
									src={closeIcon}
									alt=""
									className={styles.icon}
									aria-hidden="true"
								/>
							</button>
						</header>
						{loading && <span>Loading playlists</span>}
						{error && <span>{error}</span>}
						{playlists.length > 0 && (
							<ul className={styles.list} role="list">
								{playlists.map((playlist) => {
									return (
										<li key={playlist.id}>
											<label className={styles.label}>
												<input
													type="checkbox"
													value={playlist.id}
													checked={selectedPlaylists.includes(playlist.id)}
													onChange={() => handleSelectCheckbox(playlist.id)}
												/>{" "}
												<span>{playlist.title}</span>
											</label>
										</li>
									);
								})}
							</ul>
						)}

						<button
							className={`${styles.button} ${styles["button--add"]}`}
							onClick={() => setIsOpenNewPlaylistModal(true)}
						>
							<Image
								src={addIcon}
								alt=""
								className={styles.icon}
								aria-hidden="true"
							/>
							<span>New playlist</span>
						</button>
						<button className={styles.button} onClick={handleSavePlaylist}>
							Save
						</button>
					</article>
				</div>
			)}
			{isOpenNewPlaylistModal && (
				<NewPlaylistModal
					setIsOpen={setIsOpen}
					video_id={video_id}
					userId={userId}
					refreshPlaylists={refreshPlaylists}
					setIsOpenNewPlaylistModal={setIsOpenNewPlaylistModal}
				/>
			)}
		</div>
	);
}
