"use client";

import axios from "axios";
import Image from "next/image";
import Player from "@vimeo/player";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import backArrowIcon from "/public/assets/icons/arrow-left.svg";
import bookmarkIcon from "/public/assets/icons/bookmark.svg";
import bookmarkUnsavedIcon from "/public/assets/icons/bookmark-unsaved.svg";
import playIcon from "/public/assets/icons/play-red.svg";
import grabIcon from "/public/assets/icons/grab.svg";
import { Playlist, usePlaylists } from "../../context/PlaylistContext";
import { PlaylistVideo } from "../../library/[playlist_id]/page";
import styles from "./page.module.scss";

interface PlayerVideo extends PlaylistVideo {
	playlist_id: string;
	progress_seconds: number;
}

export default function PlaylistPlayerPage() {
	const router = useRouter();
	const { playlist_id } = useParams<{ playlist_id: string }>()!;
	const searchParams = useSearchParams()!;
	const { userId } = usePlaylists();

	const searchParamsVideoId = useSearchParams()!;
	const video_id =
		searchParamsVideoId.get("video_id") ??
		(() => {
			throw new Error("Missing video_id param");
		})();
	const progress_seconds = Number(searchParams.get("progress") ?? "0");

	const [playlist, setPlaylist] = useState<Playlist | null>(null);
	const [videos, setVideos] = useState<PlayerVideo[]>([]);
	const [activeVideo, setActiveVideo] = useState<PlayerVideo | null>(null);
	const [savedVideos, setSavedVideos] = useState<{ [key: string]: boolean }>(
		{}
	);
	const playerContainerRef = useRef<HTMLDivElement | null>(null);
	const vimeoPlayerRef = useRef<Player | null>(null);
	const lastUpdateTimeRef = useRef<number>(0);

	//  Fetch playlist and set initial video
	useEffect(() => {
		async function fetchPlaylist() {
			try {
				const res = await axios.get(`/api/playlists/${playlist_id}`, {
					headers: { "x-user-id": userId },
				});

				setPlaylist(res.data.playlist);
				setVideos(res.data.videos);

				const startingVideo =
					res.data.videos.find((v: PlayerVideo) => String(v.id) === video_id) ||
					res.data.videos[0];

				setActiveVideo({ ...startingVideo, progress_seconds });
			} catch (err) {
				console.error("❌ Failed to fetch playlist:", err);
			}
		}

		if (userId) fetchPlaylist();
	}, [playlist_id, userId]);

	// Setup / Update player
	useEffect(() => {
		if (!playerContainerRef.current || !activeVideo) return;

		if (vimeoPlayerRef.current) {
			vimeoPlayerRef.current.destroy().catch(console.error);
			vimeoPlayerRef.current = null;
		}

		const player = new Player(playerContainerRef.current, {
			id: activeVideo.vimeo_video_id,
			responsive: true,
			autoplay: true,
		});

		vimeoPlayerRef.current = player;

		player
			.ready()
			.then(() => {
				if (activeVideo.progress_seconds > 0) {
					player
						.setCurrentTime(activeVideo.progress_seconds)
						.catch(console.error);
				}
				lastUpdateTimeRef.current = 0;
				attachPlayerListeners(player);
			})
			.catch((err) => console.error("❌ Player.ready() failed:", err));
	}, [activeVideo]);

	function attachPlayerListeners(player: Player) {
		player.on("timeupdate", async (data) => {
			const currentTime = Math.floor(data.seconds);

			if (currentTime - lastUpdateTimeRef.current >= 5) {
				lastUpdateTimeRef.current = currentTime;

				try {
					await axios.put(
						"/api/playlists/progress",
						{
							playlist_id,
							video_id: activeVideo?.id,
							progress_seconds: currentTime,
						},
						{ headers: { "x-user-id": userId } }
					);
				} catch (err) {
					console.error("❌ Failed to update progress:", err);
				}
			}
		});

		player.on("ended", async () => {
			if (activeVideo) {
				await saveProgress(activeVideo.id, lastUpdateTimeRef.current);
				const nextIndex = videos.findIndex((v) => v.id === activeVideo.id) + 1;
				if (nextIndex < videos.length) {
					const nextVideo = videos[nextIndex];
					setActiveVideo({ ...nextVideo, progress_seconds: 0 });
					lastUpdateTimeRef.current = 0;
				}
			}
		});
	}

	async function handleVideoClick(video: PlayerVideo) {
		if (activeVideo) {
			await saveProgress(activeVideo.id, lastUpdateTimeRef.current);
		}
		setActiveVideo({ ...video, progress_seconds: 0 });
		lastUpdateTimeRef.current = 0;
	}

	async function saveProgress(videoId: number, progress: number) {
		if (!videoId || progress <= 0) return;
		try {
			await axios.put(
				"/api/playlists/progress",
				{
					playlist_id,
					video_id: videoId,
					progress_seconds: progress,
				},
				{ headers: { "x-user-id": userId } }
			);
		} catch (err) {
			console.error("❌ Failed to save progress:", err);
		}
	}

	function handleBookmark(videoId: number) {
		setSavedVideos((prev) => {
			const isSaved = !prev[videoId];
			return { ...prev, [videoId]: isSaved };
		});
	}

	if (!playlist || !activeVideo) return <div>Loading...</div>;

	const activeVideoPosition =
		videos.findIndex((video) => video.id === activeVideo.id) + 1;

	return (
		<div className={styles.pageContainer}>
			<div className={styles.contentArea}>
				<button
					onClick={() => router.back()}
					className={styles.backButton}
					aria-label="Exit workout"
				>
					<Image src={backArrowIcon} alt="" aria-hidden="true" />{" "}
					<span>Exit workout</span>
				</button>

				<div ref={playerContainerRef} className={styles.playerContainer} />

				<div className={styles.videoDetails}>
					<h1 className={styles.playlistTitle}>{playlist.title}</h1>

					<h2 className={styles.activeVideoTitle}>
						{activeVideo.title.toLowerCase()}
					</h2>

					<p className={styles.videoDescription}>{activeVideo.description}</p>
				</div>
			</div>

			<div className={styles.playlist}>
				<h2 className={styles.videoListTitle}>
					Playing{" "}
					<span>
						{activeVideoPosition} of {videos.length}
					</span>
				</h2>
				<ul className={styles.videoList} role="list">
					{videos.map((video) => (
						<li
							key={video.id}
							onClick={() => handleVideoClick(video)}
							className={`${styles.thumbnailCard} ${
								activeVideo.id === video.id ? styles.active : ""
							}`}
						>
							<button
								aria-label="Grab to reorder video in playlist"
								className={styles.grabButton}
								// ref={setActivatorNodeRef}
								// {...listeners}
							>
								<Image
									src={grabIcon}
									alt=""
									aria-hidden="true"
									className={styles.icon}
								/>
							</button>

							<span
								aria-label={`Currently playing ${activeVideo.title} video`}
								className={styles.playContainer}
							>
								<Image
									src={playIcon}
									alt=""
									aria-hidden="true"
									className={styles.icon}
								/>
							</span>

							<span className={styles.positionContainer}>
								{videos.findIndex(
									(playlistVideo) => video.id === playlistVideo.id
								) + 1}
							</span>
							<div className={styles.header}>
								<div className={styles.thumbnailContainer}>
									<Image
										src={video.thumbnail_url || "/default-thumbnail.jpg"}
										alt={`A thumbnail image for the ${video.title} workout`}
										className={styles.thumbnailImage}
										fill
										style={{ objectFit: "cover" }}
									/>
								</div>
								<p className={styles.videoTitle}>{video.title.toLowerCase()}</p>
							</div>

							<button
								onClick={(e) => {
									e.stopPropagation();
									handleBookmark(video.id);
								}}
								className={styles.bookmarkButton}
								aria-label="Save video"
							>
								<Image
									src={
										savedVideos[video.id] ? bookmarkIcon : bookmarkUnsavedIcon
									}
									alt="Bookmark"
									className={styles.icon}
								/>
							</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
