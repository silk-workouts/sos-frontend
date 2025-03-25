"use client";
import Image from "next/image";
import rightArrow from "/public/assets/icons/arrow-right.svg";
import bookmark from "public/assets/icons/bookmark-fill.svg";
import bookmarkUnsaved from "public/assets/icons/bookmark-unsaved.svg";
import playIcon from "/public/assets/icons/play.svg";
import clockIcon from "/public/assets/icons/clock.svg";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Showcase } from "src/app/(dashboard)/dashboard/page";
import { usePlaylists } from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import { useSavedPrograms } from "src/hooks/useSavedPrograms";
import Video from "../Video/Video";
import styles from "./VideoList.module.scss";
import { playlistDuration } from "../../library/PlayListCard/PlayListCard";

export interface ShowcaseVideo {
	id: number;
	vimeo_video_id: string;
	title: string;
	description: string;
	duration: number;
	position: number;
	thumbnail_url: string;
	created_at: string;
	showcase_id: string;
	start_time: any;
	real_vimeo_video_id: string;
}

interface Chapter {
	id: number;
	title: string;
	start_time: number;
	duration: number | null;
	showcase_id: number;
	continuous_vimeo_id: string;
	real_vimeo_video_id: string;
}

interface VideoListProps {
	video: Showcase;
	type: string;
}

export default function VideoList({ video, type }: VideoListProps) {
	const router = useRouter();
	const [showcaseVideos, setShowCaseVideos] = useState<ShowcaseVideo[]>([]);
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [continuousVideo, setContinuousVideo] = useState<{
		continuous_vimeo_id: string;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const { userId } = usePlaylists();
	const { saveProgram, deleteProgram, savedPrograms } = useSavedPrograms();

	const routeName = video.name
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[%\.]/g, "");

	useEffect(() => {
		async function getShowcaseVideos() {
			try {
				const response = await axios.get(
					`/api/showcases/${video.vimeo_showcase_id}`
				);
				setShowCaseVideos(response.data.videos);
				setIsLoading(false);
			} catch (error) {
				console.error(
					`Unable to retrieve showcase videos from Vimeo: ${error}`
				);
			}
		}

		getShowcaseVideos();
	}, [video.vimeo_showcase_id]);

	useEffect(() => {
		async function fetchContinuousVideo() {
			try {
				const response = await axios.get(
					`/api/showcases/${video.vimeo_showcase_id}/continuous-video`
				);

				if (response.data.continuous_vimeo_id) {
					setContinuousVideo(response.data);
				} else {
					console.warn("No continuous video found for this showcase");
					return;
				}
			} catch (error) {
				if (axios.isAxiosError(error)) {
					if (error.response?.status === 404) {
						// Expected case — no video found
						setContinuousVideo(null); // or handle empty state
					} else {
						// Unexpected error (e.g., 500)
						console.error("Unexpected error fetching continuous video:", error);
					}
				} else {
					console.error("Unknown error:", error);
				}
			}
		}

		fetchContinuousVideo();
	}, [video.vimeo_showcase_id]);

	useEffect(() => {
		if (!continuousVideo?.continuous_vimeo_id) {
			console.log("Skipping chapter fetch due to missing continuous_vimeo_id");
			return;
		}

		async function fetchChapters() {
			try {
				if (!continuousVideo) return;
				const response = await axios.get("/api/chapters", {
					params: { continuous_vimeo_id: continuousVideo.continuous_vimeo_id },
				});
				setChapters(response.data);
			} catch (error) {
				console.error("Unable to fetch chapters:", error);
			}
		}

		fetchChapters();
	}, [continuousVideo]);

	if (isLoading || (!chapters.length && continuousVideo)) {
		return <div>List of videos is loading...</div>;
	}

	const mergedData = chapters.map((chapter, index) => {
		const adjustedIndex = index + 1;
		const matchingVideo = showcaseVideos[adjustedIndex];
		return {
			...matchingVideo,
			title: chapter.title,
			start_time: chapter.start_time,
			real_vimeo_video_id: chapter.real_vimeo_video_id,
		};
	});

	function handleShowVideoList() {
		router.push(`/dashboard/${routeName}/${video.vimeo_showcase_id}/videos`);
	}

	const isSaved = savedPrograms.some(
		(p) => p.showcaseId === Number(video.vimeo_showcase_id)
	);

	async function handleToggleSave() {
		const showcaseId = Number(video.vimeo_showcase_id); // 🔥 Ensure it's a number

		if (isNaN(showcaseId)) {
			console.error(`❌ Invalid showcaseId: ${video.vimeo_showcase_id}`);
			return;
		}

		if (isSaved) {
			await deleteProgram(showcaseId);
		} else {
			await saveProgram({
				userId, // UUID string
				showcaseId, // Ensure this is a number
				title: video.name,
				description: video.description || "",
				videoCount: showcaseVideos.length,
				duration: chapters.reduce(
					(sum, chapter) => sum + (chapter.duration || 0),
					0
				),
			});
		}
	}
	const duration = playlistDuration(
		mergedData.reduce((prev, curr) => prev + curr.duration, 0)
	);

	return (
		<section className={styles.container}>
			<div className={styles.infoContainer}>
				<div className={styles.headerContainer}>
					<div className={styles.header}>
						<div className={styles.titleContainer}>
							<h2 className={styles.title}>{video.name.toLowerCase()}</h2>{" "}
							<button
								className={`${styles.button} ${styles["button--tablet"]}`}
								onClick={handleShowVideoList}
								aria-label="View all videos"
							>
								<Image
									src={rightArrow}
									alt=""
									className={styles.icon}
									aria-hidden="true"
								/>
							</button>
						</div>
						<p className={styles.description}>
							{video.description ||
								"[Description goes here but it is currently empty]"}
						</p>
					</div>
					{type === "program" && (
						<button
							className={styles.bookmarkButton}
							onClick={handleToggleSave}
							aria-label="Save to playlist"
						>
							{isSaved ? (
								<>
									<Image
										src={bookmark}
										alt="Bookmark video saved"
										className={styles.bookmarkIcon}
									/>
									<span>Saved to library</span>
								</>
							) : (
								<>
									<Image
										src={bookmarkUnsaved}
										alt="Bookmark video saved not saved"
										className={styles.bookmarkIcon}
									/>
									<span>Save to library</span>
								</>
							)}
						</button>
					)}
				</div>
				<div className={styles.metadata}>
					<div className={styles.info}>
						<span className={styles.message}>
							<Image src={playIcon} alt="" className={styles.icon} />
							<span>{mergedData.length} videos</span>
						</span>
						<span className={styles.message}>
							<Image src={clockIcon} alt="" className={styles.icon} />
							<span>{duration}</span>
						</span>
					</div>

					<button
						className={styles.button}
						onClick={handleShowVideoList}
						aria-label="View all videos"
					>
						<Image
							src={rightArrow}
							alt=""
							className={styles.icon}
							aria-hidden="true"
						/>
					</button>
				</div>
			</div>

			<ul className={styles.list}>
				{mergedData.map((showcaseVideo) => {
					return (
						<li key={showcaseVideo.id} className={showcaseVideo.vimeo_video_id}>
							<Video
								showcaseVideo={showcaseVideo}
								display="column"
								path={`/dashboard/player/${continuousVideo?.continuous_vimeo_id}?start_time=${showcaseVideo.start_time}&showcase_id=${video.vimeo_showcase_id}`}
							/>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
