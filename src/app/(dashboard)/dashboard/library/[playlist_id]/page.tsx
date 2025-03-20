"use client";
import axios from "axios";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import defaultThumbnail from "/public/assets/images/defaultPlaylistThumbnail.png";
import leftArrowIcon from "/public/assets/icons/chevron-left-white.svg";
import leftArrow from "/public/assets/icons/arrow-left.svg";
import kebabIcon from "/public/assets/icons/kebab-white.svg";
import playIcon from "/public/assets/icons/play-red.svg";
import playFilledIcon from "/public/assets/icons/play-fill.svg";
import clockIcon from "/public/assets/icons/clock-red.svg";
import { Playlist, usePlaylists } from "../../context/PlaylistContext";
import PlaylistVideos from "@/components/pages/library/PlaylistVideos/PlaylistVideos";
import PlaylistModal from "@/components/pages/library/PlaylistModal/PlaylistModal";
import styles from "./page.module.scss";

export interface PlaylistVideo {
	description: string | null;
	duration: number;
	id: number;
	position: number;
	thumbnail_url: string;
	title: string;
	vimeo_video_id: number;
}

export default function PlaylistPage() {
	const { playlist_id } = useParams<{ playlist_id: string }>();
	const { playlists, userId, refreshPlaylists } = usePlaylists();
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [playlist, setPlaylist] = useState<Playlist>({
		created_at: "",
		description: "",
		id: "",
		title: "",
		user_id: "",
	});
	const [playlistVideos, setPlaylistVideos] = useState<PlaylistVideo[]>([]);
	const [progress, setProgress] = useState<{
		video_id: string | null;
		progress_seconds: number;
	}>({
		video_id: null,
		progress_seconds: 0,
	});

	const [isOpenModal, setIsOpenModal] = useState(false);

	// ✅ Fetch playlist videos & progress
	useEffect(() => {
		async function getPlaylistData() {
			setLoading(true);
			try {
				console.log(`📥 Fetching playlist & videos for ${playlist_id}...`);
				const response = await axios.get(`/api/playlists/${playlist_id}`, {
					headers: { "x-user-id": userId },
				});

				setPlaylist(response.data.playlist);
				setPlaylistVideos(response.data.videos);

				// ✅ Fetch last progress
				fetchLastProgress();
			} catch (error) {
				console.error(`❌ Unable to retrieve playlist:`, error);
			} finally {
				setLoading(false);
			}
		}

		async function fetchLastProgress() {
			try {
				console.log(`📥 Fetching last progress for playlist ${playlist_id}...`);
				const res = await axios.get(
					`/api/playlists/progress?playlist_id=${playlist_id}`,
					{
						headers: { "x-user-id": userId },
					}
				);

				console.log("✅ Received progress:", res.data);
				setProgress(res.data);
			} catch (error) {
				console.error("❌ Failed to fetch last progress:", error);
			}
		}

		if (userId) {
			getPlaylistData();
		}
	}, [playlists, playlist_id, userId]);

	if (loading) {
		return <div>Loading playlist...</div>;
	}

	async function handleDeleteVideo(video_id: number) {
		try {
			await axios.delete(`/api/playlists/${playlist_id}/videos/${video_id}`, {
				headers: { "x-user-id": userId },
			});
			refreshPlaylists();
		} catch (error) {
			console.error(`❌ Unable to delete video:`, error);
		}
	}

	function handleStartWorkout() {
		router.push(
			`/dashboard/playlistplayer/${playlist.id}?video_id=${progress.video_id}&progress=${progress.progress_seconds}`
		);
	}

	return (
		<div className={styles.container}>
			<section className={styles.hero}>
				<button
					aria-label="Navigate back"
					className={`${styles.hero__button} ${styles["hero__button--desktop"]}`}
					onClick={() => router.push("/dashboard/library")}
				>
					<Image
						src={leftArrow}
						alt=""
						className={styles.hero__icon}
						aria-hidden="true"
					/>
					<span>Back</span>
				</button>
				<button
					aria-label="Navigate back"
					className={`${styles.hero__button} ${styles["hero__button--back"]}`}
					onClick={() => router.push("/dashboard/library")}
				>
					<Image
						src={leftArrowIcon}
						alt=""
						className={styles.hero__icon}
						aria-hidden="true"
					/>
				</button>

				<div className={styles["hero__image-container"]}>
					<Image
						src={
							playlistVideos.length > 0
								? playlistVideos[0].thumbnail_url
								: defaultThumbnail
						}
						alt={`Thumbnail for ${playlist.title} playlist`}
						fill
						style={{ objectFit: "cover" }}
						className={styles.hero__image}
					/>
				</div>

				<header>
					<div className={styles["hero__title-container"]}>
						<h1 className={styles.hero__title}>{playlist.title}</h1>{" "}
						<button
							aria-label={`Options for ${playlist.title} playlist`}
							className={styles.hero__button}
							onClick={() => setIsOpenModal(true)}
						>
							<Image
								src={kebabIcon}
								alt=""
								aria-hidden="true"
								className={`${styles.hero__icon} ${styles["hero__icon--options"]}`}
							/>
						</button>
					</div>
					<div className={styles.hero__info}>
						<span className={styles.hero__message} aria-live="polite">
							<Image
								src={playIcon}
								alt=""
								className={styles.hero__icon}
								aria-hidden="true"
							/>
							<span>{playlistVideos.length} Videos</span>
						</span>
						<span className={styles.hero__message} aria-live="polite">
							<Image
								src={clockIcon}
								alt=""
								className={styles.hero__icon}
								aria-hidden="true"
							/>
							<span>[num] mins</span>
						</span>
					</div>
					{playlist.description && (
						<p className={styles.hero__description}>{playlist.description}</p>
					)}
				</header>

				<button
					onClick={handleStartWorkout}
					className={`${styles.hero__button} ${styles["hero__button--begin"]}`}
					aria-label={`Play all videos in the ${playlist.title} playlist`}
				>
					<span>Play all</span>
					<Image
						src={playFilledIcon}
						alt=""
						className={styles.hero__icon}
						aria-hidden="true"
					/>
				</button>
			</section>
			<PlaylistVideos
				videos={playlistVideos}
				setVideos={setPlaylistVideos} // ✅ Added from B
				handleDelete={handleDeleteVideo}
				playlist_id={playlist_id} // ✅ Added from B
				userId={userId} // ✅ Added from B
			/>
			{isOpenModal && (
				<PlaylistModal setIsOpen={setIsOpenModal} playlist={playlist} />
			)}
		</div>
	);
}
