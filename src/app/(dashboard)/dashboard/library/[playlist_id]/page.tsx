"use client";
import axios from "axios";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import leftArrowIcon from "/public/assets/icons/chevron-left.svg";
import editIcon from "/public/assets/icons/edit.svg";
import deleteIcon from "/public/assets/icons/trash.svg";
import playIcon from "/public/assets/icons/play.svg";
import playFilledIcon from "/public/assets/icons/play-fill.svg";
import clockIcon from "/public/assets/icons/clock.svg";
import bookmarkIcon from "/public/assets/icons/bookmark.svg";
import grabIcon from "/public/assets/icons/grab.svg";
import { usePlaylists } from "../../context/PlaylistContext";
import styles from "./page.module.scss";
import EditPlaylistModal from "@/components/pages/dashboard/EditPlaylistModal/EditPlaylistModal";

export default function Playlist() {
	const { playlist_id } = useParams();
	const { userId, refreshPlaylists } = usePlaylists();
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [playlist, setPlaylist] = useState(null);
	const [playlistVideos, setPlaylistVideos] = useState([]);
	const [isOpenEditModal, setIsOpenEditModal] = useState(false);

	async function getPlaylistVideos() {
		setLoading(true);

		try {
			const response = await axios.get(`/api/playlists/${playlist_id}`, {
				headers: { "x-user-id": userId },
			});
			setPlaylist(response.data.playlist);
			setPlaylistVideos(response.data.videos);
		} catch (error) {
			console.error(`Unable to retrieve videos for playlist: ${error}`);
		} finally {
			setLoading(false);
		}
	}
	useEffect(() => {
		if (userId) {
			getPlaylistVideos();
		}
	}, [userId, playlist_id]);

	if (loading) {
		return <div>Loading playlists</div>;
	}
	console.log(playlist);
	console.log(playlistVideos);

	return (
		<div>
			<section className={styles.titleCard}>
				<div className={styles["titleCard__controls-container"]}>
					<button
						aria-label="Navigate back"
						className={styles.titleCard__button}
						onClick={() => router.back()}
					>
						<Image
							src={leftArrowIcon}
							alt=""
							className={`${styles.titleCard__icon} ${styles["titleCard__icon--back"]}`}
						/>
					</button>
					<div className={styles.titleCard__controls}>
						<button
							aria-label="Edit playlist"
							className={styles.titleCard__button}
							onClick={() => setIsOpenEditModal(true)}
						>
							<Image src={editIcon} alt="" className={styles.titleCard__icon} />
						</button>
						<button
							aria-label="Delete playlist"
							className={styles.titleCard__button}
						>
							<Image
								src={deleteIcon}
								alt=""
								className={styles.titleCard__icon}
							/>
						</button>
					</div>
				</div>
				<div className={styles["titleCard-content"]}>
					<div className={styles["titleCard__image-container"]}></div>
					<header>
						<h1 className={styles.titleCard__title}>{playlist.title}</h1>
						<div className={styles.titleCard__info}>
							<span className={styles.titleCard__message}>
								<Image
									src={playIcon}
									alt=""
									className={styles.titleCard__icon}
								/>
								<span>{playlistVideos.length} Videos</span>
							</span>
							<span className={styles.titleCard__message}>
								<Image
									src={clockIcon}
									alt=""
									className={styles.titleCard__icon}
								/>
								<span>[num] mins</span>
							</span>
						</div>
					</header>
					<p className={styles.titleCard__description}>
						{playlist.description}
					</p>
				</div>
				<button
					className={`${styles.titleCard__button} ${styles["titleCard__button--begin"]}`}
				>
					<span>begin workout</span>{" "}
					<Image
						src={playFilledIcon}
						alt=""
						className={styles.titleCard__icon}
					/>
				</button>
			</section>
			<section className={styles.videos}>
				<ul role="list" className={styles.videos__list}>
					{playlistVideos.map((video) => {
						return (
							<li key={video.id}>
								<VideoCard video={video} />
							</li>
						);
					})}
				</ul>
			</section>
			{isOpenEditModal && (
				<EditPlaylistModal
					setIsOpen={setIsOpenEditModal}
					playlist={playlist}
					userId={userId}
					refreshPlaylists={refreshPlaylists}
					getPlaylistVideos={getPlaylistVideos}
				/>
			)}
		</div>
	);
}

function VideoCard({ video }) {
	return (
		<article className={styles.card}>
			<header className={styles.card__header}>
				<h3 className={styles.card__title}>{video.title}</h3>
				<button
					aria-label="Remove video from playlist"
					className={styles.card__button}
				>
					<Image src={bookmarkIcon} alt="" />
				</button>
			</header>
			<Image
				src={video.thumbnail_url}
				className={styles.card__thumbnail}
				alt={`A thumbnail image for the ${video.title} workout`}
				width={135}
				height={117}
			/>
			<button
				aria-label="Grab to rearrange video order"
				className={styles.card__button}
			>
				<Image src={grabIcon} alt="" />
			</button>
		</article>
	);
}
