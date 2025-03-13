import closeIcon from "/public/assets/icons/close.svg";
import addIcon from "/public/assets/icons/plus.svg";
import styles from "./AddPlaylistModal.module.scss";
import Image from "next/image";
import { usePlaylists } from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import { useState } from "react";
import axios from "axios";

interface PlaylistModalProps {
	setIsOpen: (arg1: boolean) => void;
	video_id: string;
}

export default function AddPlaylistModal({
	setIsOpen,
	video_id,
}: PlaylistModalProps) {
	const { playlists, loading, error, refreshPlaylists, userId } =
		usePlaylists();
	const [selectedPlaylists, setSelectedPlaylists] = useState([]);

	function handleSelectCheckbox(playlistId: string) {
		setSelectedPlaylists((prev) =>
			prev.includes(playlistId)
				? prev.filter((id) => id !== playlistId)
				: [...prev, playlistId]
		);
	}

	async function handleSavePlaylist() {
		try {
			if (selectedPlaylists.length > 0) {
				selectedPlaylists.map(async (playlist) => {
					await axios.post(
						`/api/playlists/${playlist}/videos`,
						{
							vimeo_video_id: video_id,
						},
						{ headers: { "x-user-id": userId } }
					);
				});
				await refreshPlaylists();
				setIsOpen(false);
			}
		} catch (error) {
			console.error(`Unable to save to playlists: ${error}`);
		}
	}

	return (
		<div className={styles.dialog}>
			<article className={styles.container}>
				<header className={styles.header}>
					<h3 className={styles.header__title}>Save to...</h3>
					<button className={styles.button}>
						<Image
							src={closeIcon}
							alt="An icon of an X for close"
							className={styles.icon}
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

				<button className={`${styles.button} ${styles["button--add"]}`}>
					<Image src={addIcon} alt="" className={styles.icon} />
					<span>New playlist</span>
				</button>
				<button className={styles.button} onClick={handleSavePlaylist}>
					Save
				</button>
			</article>
		</div>
	);
}
