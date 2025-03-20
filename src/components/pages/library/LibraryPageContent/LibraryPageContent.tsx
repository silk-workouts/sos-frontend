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
import {
	Playlist,
	usePlaylists,
} from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import PlaylistModal from "../PlaylistModal/PlaylistModal";
import { PlaylistVideo } from "src/app/(dashboard)/dashboard/library/[playlist_id]/page";
import styles from "./LibraryPageContent.module.scss";

interface LibraryContentProps {
	playlists: Playlist[];
}

export default function LibraryPageContent({ playlists }: LibraryContentProps) {
	return (
		<ul className={styles.list}>
			{playlists.map((playlist) => {
				return (
					<li key={playlist.id} className={styles.list__item}>
						<PlayListCard playlist={playlist} />
					</li>
				);
			})}
		</ul>
	);
}

function PlayListCard({ playlist }: { playlist: Playlist }) {
	const router = useRouter();
	const { userId } = usePlaylists();

	const [isOpenModal, setIsOpenModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [playlistVideos, setPlaylistVideos] = useState<PlaylistVideo[]>([]);

	useEffect(() => {
		async function getPlaylistData() {
			setLoading(true);
			try {
				const response = await axios.get(`/api/playlists/${playlist.id}`, {
					headers: { "x-user-id": userId },
				});
				setPlaylistVideos(response.data.videos);
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

	function handlePlaylistNavigation(id: string) {
		router.push(`/dashboard/library/${id}`);
	}

	return (
		<article className={styles.card}>
			{!loading && (
				<div className={styles["card__image-container"]}>
					<Image
						src={
							playlistVideos.length > 0
								? playlistVideos[0].thumbnail_url
								: defaultThumbnail
						}
						alt={`Thumbnail for ${playlist.title} playlist`}
						fill
						style={{ objectFit: "cover" }}
						className={styles.card__image}
					/>
				</div>
			)}
			<div className={styles.card__headerContainer}>
				<header>
					<h2 className={styles.card__title}>{playlist.title}</h2>
					<p className={styles.card__description}>{playlist.description}</p>
				</header>
				<button
					className={styles.button}
					aria-label="Open to view playlist actions "
					onClick={() => setIsOpenModal(true)}
				>
					<Image
						src={kebabIcon}
						alt=""
						className={styles.card__icon}
						aria-hidden="true"
					/>
				</button>
			</div>
			<div className={styles.card__infoContainer}>
				{!loading && (
					<div className={styles.info}>
						<span className={styles.card__message}>
							<Image
								src={playIcon}
								alt=""
								className={styles.card__icon}
								aria-hidden="true"
							/>
							<span>{playlistVideos.length} videos</span>
						</span>
						<span className={styles.card__message}>
							<Image
								src={clockIcon}
								alt=""
								className={styles.card__icon}
								aria-hidden="true"
							/>
							<span>[X] mins</span>
						</span>
					</div>
				)}
				<button
					className={styles.button}
					onClick={() => handlePlaylistNavigation(playlist.id)}
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
			{isOpenModal && (
				<PlaylistModal setIsOpen={setIsOpenModal} playlist={playlist} />
			)}
		</article>
	);
}
