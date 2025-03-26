"use client";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import kebabIcon from "/public/assets/icons/kebab.svg";
import rightArrow from "/public/assets/icons/arrow-right.svg";
import playIcon from "/public/assets/icons/play.svg";
import clockIcon from "/public/assets/icons/clock.svg";
import defaultThumbnail from "/public/assets/images/defaultPlaylistThumbnail.png";
import PlaylistModal from "../PlaylistModal/PlaylistModal";
import {
	Playlist,
	usePlaylists,
} from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import { PlaylistVideo } from "src/app/(dashboard)/dashboard/library/[playlist_id]/page";
import styles from "./PlayListCard.module.scss";

export default function PlayListCard({
	playlist,
	refreshSavedPrograms,
}: {
	playlist: Playlist;
	refreshSavedPrograms?: () => void;
}) {
	const router = useRouter();
	const { userId } = usePlaylists();

	const [isOpenModal, setIsOpenModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [playlistVideos, setPlaylistVideos] = useState<PlaylistVideo[]>([]);

	useEffect(() => {
		async function getPlaylistData() {
			setLoading(true);
			try {
				if (playlist.type === "savedProgram") {
					const response = await axios.get(`/api/showcases/${playlist.id}`);
					setPlaylistVideos(response.data.videos);
				} else {
					const response = await axios.get(`/api/playlists/${playlist.id}`, {
						headers: { "x-user-id": userId },
					});
					setPlaylistVideos(response.data.videos);
				}
			} catch (error) {
				console.error(`Unable to retrieve playlist:`, error);
			} finally {
				setLoading(false);
			}
		}

		if (userId) {
			getPlaylistData();
		}
	}, [userId]);

	function handleNavigate() {
		if (playlist.type === "savedProgram") {
			const routeName = playlist.title
				.toLowerCase()
				.replace(/\s+/g, "-")
				.replace(/[%\.]/g, ""); // Clean up title for the route

			router.push(`/dashboard/${routeName}/${playlist.id}/videos`);
		} else {
			router.push(`/dashboard/library/${playlist.id}`);
		}
	}

	const duration = playlistDuration(
		playlistVideos.reduce((prev, curr) => prev + curr.duration, 0)
	);

	return (
		<article className={styles.card}>
			<div className={styles["card__image-container"]}>
				{!loading && (
					<Image
						src={
							playlistVideos.length > 0
								? playlistVideos[0].thumbnail_url
								: defaultThumbnail
						}
						alt={`Thumbnail for ${playlist.title} playlist`}
						fill
						sizes="100%"
						style={{ objectFit: "cover" }}
						className={styles.card__image}
					/>
				)}
			</div>
			<div className={styles.card__headerContainer}>
				<header>
					<h2 className={styles.card__title}>{playlist.title}</h2>
					<p className={styles.card__description}>{playlist.description}</p>
				</header>
				<button
					className={styles.button}
					aria-label="Open to view playlist actions "
					onClick={() => setIsOpenModal(!isOpenModal)}
				>
					<Image
						src={kebabIcon}
						alt=""
						className={styles.card__icon}
						aria-hidden="true"
					/>
				</button>
				{isOpenModal && (
					<PlaylistModal
						setIsOpen={setIsOpenModal}
						playlist={playlist}
						refreshSavedPrograms={refreshSavedPrograms}
					/>
				)}
			</div>
			<div className={styles.card__infoContainer}>
				<div className={styles.info}>
					<span className={styles.card__message}>
						<Image
							src={playIcon}
							alt=""
							className={styles.card__icon}
							aria-hidden="true"
						/>
						<span>{!loading && playlistVideos.length} videos</span>
					</span>
					<span className={styles.card__message}>
						<Image
							src={clockIcon}
							alt=""
							className={styles.card__icon}
							aria-hidden="true"
						/>
						<span>{!loading && duration}</span>
					</span>
				</div>

				<button
					className={styles.button}
					onClick={handleNavigate}
					aria-label="Go to playlist"
				>
					<Image
						src={rightArrow}
						alt=""
						aria-hidden="true"
						className={`${styles.card__icon} ${styles["card__icon--go"]}`}
					/>
				</button>
			</div>
		</article>
	);
}

export function playlistDuration(videos_duration: number) {
	let dur = videos_duration;
	const hours = Math.floor(dur / 3600);
	dur %= 3600;
	const minutes = Math.floor(dur / 60);

	const parts = [];

	if (hours) parts.push(`${hours} ${hours === 1 ? "hr" : "hrs"}`);
	if (minutes) parts.push(`${minutes} ${minutes === 1 ? "min" : "mins"}`);

	return parts.length ? parts.join(" ") : "0 min";
}
