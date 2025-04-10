"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios, { isAxiosError } from "axios";
import Video from "@/components/pages/dashboard/Video/Video";
import Element from "@/components/Element/Element";
import { playlistDuration } from "@/components/pages/library/PlayListCard/PlayListCard";
import { parseDescription } from "src/utils/parseDescription";
import playIcon from "/public/assets/icons/play-red.svg";
import playFilledIcon from "/public/assets/icons/play-fill.svg";
import clockIcon from "/public/assets/icons/clock-red.svg";
import leftArrowIcon from "/public/assets/icons/chevron-left-white.svg";
import leftArrow from "/public/assets/icons/arrow-left.svg";
import bookmarkIcon from "/public/assets/icons/bookmark-white.svg";
import bookmarkFill from "/public/assets/icons/bookmark-white-fill.svg";
import { ChapterVideo } from "src/types/video";
import { useSavedPrograms } from "src/hooks/useSavedPrograms";
import styles from "./page.module.scss";
import { usePlaylists } from "../../../context/PlaylistContext";

export interface Chapter {
	id: number;
	title: string;
	start_time: number;
	duration: number | null;
	continuous_vimeo_id: string;
	real_vimeo_video_id: string;
}

interface MergedChapterVideo extends ChapterVideo {
	thumbnail_url: string;
	start_time: number;
	real_vimeo_video_id: string;
}

export default function SingleContinuousVideoPage() {
	const router = useRouter();

	const { continuous_video_name, continuous_video_id } = useParams<{
		continuous_video_name: string;
		continuous_video_id: string;
	}>()!;

	const [loading, setLoading] = useState(true);
	const [continuousVideo, setContinuousVideo] = useState<{
		continuous_video_id: string;
		name: string;
		description?: string;
		thumbnail_url?: string;
	} | null>(null);
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [chapterVideos, setChapterVideos] = useState<ChapterVideo[]>([]);

	const { userId } = usePlaylists();
	const { saveProgram, deleteProgram, savedPrograms } = useSavedPrograms();

	const continuousVideoName = continuous_video_name
		.replaceAll("-", " ")
		.replace("100", "100%");

	useEffect(() => {
		async function fetchData() {
			if (!continuous_video_id) return;

			try {
				const [metaRes, videoRes, chapterRes] = await Promise.all([
					axios.get(
						`/api/continuous-videos/${continuous_video_id}/continuous-video`
					),
					axios.get(`/api/continuous-videos/${continuous_video_id}`),
					axios.get(`/api/chapters`, {
						params: { continuous_vimeo_id: continuous_video_id },
					}),
				]);

				setContinuousVideo(metaRes.data.continuousVideo);
				setChapterVideos(videoRes.data.chapters || []);
				setChapters(chapterRes.data || []);
			} catch (error) {
				if (isAxiosError(error) && error.status === 404) {
					router.push("/dashboard");
				}
				console.error("❌ Error loading continuous video page:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, [continuous_video_id]);

	if (loading || !continuousVideo) {
		return <div>Loading videos for this {continuousVideoName}...</div>;
	}

	const chapterVideoMap = new Map<string, ChapterVideo>();
	for (const video of chapterVideos) {
		if (video.real_vimeo_video_id) {
			chapterVideoMap.set(video.real_vimeo_video_id, video);
		}
	}

	const mergedData: MergedChapterVideo[] = chapters
		.filter((ch) => {
			const title = ch.title.toLowerCase();
			return !title.includes("warmup") && !title.includes("cooldown");
		})
		.map((chapter, index) => {
			const videoMeta = chapterVideoMap.get(chapter.real_vimeo_video_id);
			return {
				id: chapter.id,
				title: chapter.title || videoMeta?.title || "Untitled",
				start_time: chapter.start_time ?? 0,
				duration: chapter.duration ?? videoMeta?.duration ?? 0,
				thumbnail_url: videoMeta?.thumbnail_url?.startsWith("http")
					? videoMeta.thumbnail_url
					: "/assets/images/default-thumbnail.jpg",
				real_vimeo_video_id:
					chapter.real_vimeo_video_id ?? videoMeta?.real_vimeo_video_id ?? "",
				continuous_vimeo_id:
					chapter.continuous_vimeo_id ?? continuous_video_id ?? "",
				vimeo_video_id: videoMeta?.vimeo_video_id || "",
				description: videoMeta?.description ?? "",
				position: videoMeta?.position ?? index,
				created_at: videoMeta?.created_at || "",
			};
		});

	const duration = playlistDuration(
		mergedData.reduce((sum, ch) => sum + (ch.duration || 0), 0)
	);

	function handlePlayAll() {
		if (continuousVideo?.continuous_video_id) {
			router.push(
				`/dashboard/player/${continuousVideo.continuous_video_id}?autoplay=1`
			);
		}
	}

	// Rx icon mapper
	const getRxIcon = (title: string) => {
		// Clean up any extra spaces and make the match case-insensitive
		const match = title.trim().match(/program\s?(\d+)/i);
		if (match) {
			const programNumber = match[1];
			return `/assets/icons/rx-icons/Rx${programNumber}.svg`;
		}
		// Return a default icon if no match is found
		return "/assets/icons/rx-icons/default.svg";
	};

	//Check if the prescription program is saved
	const isSaved = savedPrograms.some(
		(p) => p.continuousVideoId === continuous_video_id
	);

	async function handleToggleSave() {
		if (!userId || !continuousVideo) {
			console.error("Missing userId or continuous_video_id.");
			return;
		}

		if (isSaved) {
			await deleteProgram(continuous_video_id);
		} else {
			const capitalizedName = continuousVideoName
				.split(" ")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

			await saveProgram({
				userId, // ✅ fix this
				continuousVideoId: continuous_video_id, // ✅ already good
				title: capitalizedName,
				description: continuousVideo.description || "",
				videoCount: chapters.length,
				duration: chapters.reduce(
					(sum, chapter) => sum + (chapter.duration || 0),
					0
				),
			});
		}
	}

	return (
		<div className={styles.container}>
			{/* HERO */}
			<section className={styles.hero}>
				<button
					aria-label="Navigate back"
					className={`${styles.hero__button} ${styles["hero__button--desktop"]}`}
					onClick={() => router.back()}
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
					onClick={() => router.back()}
				>
					<Image
						src={leftArrowIcon}
						alt=""
						className={styles.hero__icon}
						aria-hidden="true"
					/>
				</button>

				{continuousVideoName.includes("prescription") && (
					<div className={styles["hero__image-container"]}>
						<Image
							src={
								continuousVideoName.includes("program")
									? getRxIcon(continuousVideoName)
									: Array.isArray(mergedData) &&
									  mergedData.length > 0 &&
									  mergedData[0].thumbnail_url
									? mergedData[0].thumbnail_url
									: "/assets/images/default-thumbnail.jpg"
							}
							alt={`${continuousVideoName} thumbnail`}
							fill
							sizes="(max-width: 1279px) 100%, 312px"
							style={{ objectFit: "contain" }}
							className={styles.hero__image}
						/>
					</div>
				)}

				<header className={styles.hero__header}>
					{continuousVideoName.includes("prescription") ? (
						<div className={styles["hero__title-container"]}>
							<h1 className={styles.hero__title}>
								{continuousVideoName.toLowerCase() || "Untitled"}
							</h1>
							<button
								aria-label={`Save ${
									mergedData[0]?.title?.toLowerCase() || "Untitled"
								} to your library`}
								className={styles.hero__button}
								onClick={handleToggleSave}
							>
								<Image
									src={isSaved ? bookmarkFill : bookmarkIcon}
									alt=""
									className={`${styles.hero__icon} ${styles["hero__icon--save"]}`}
									aria-hidden="true"
								/>
							</button>
						</div>
					) : (
						<h2 className={styles.hero__element}>
							<Element name={continuousVideoName} type="dashboard" />
						</h2>
					)}
					<div className={styles.hero__info}>
						<span className={styles.hero__message}>
							<Image
								src={playIcon}
								alt=""
								className={styles.hero__icon}
								aria-hidden="true"
							/>
							<span>{mergedData.length} videos</span>
						</span>
						<span className={styles.hero__message}>
							<Image
								src={clockIcon}
								alt=""
								className={styles.hero__icon}
								aria-hidden="true"
							/>
							<span>{duration}</span>
						</span>
					</div>

					{(() => {
						const { title, text } = parseDescription(
							continuousVideo?.description || ""
						);

						return (
							<>
								{title && <h2 className={styles.hero__title}>{title}</h2>}
								{text && <p className={styles.hero__description}>{text}</p>}
							</>
						);
					})()}
				</header>

				<button
					onClick={handlePlayAll}
					className={`${styles.hero__button} ${styles["hero__button--begin"]}`}
					aria-label={`Play all videos in the ${continuousVideoName} workout`}
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

			{/* VIDEO LIST */}
			<section className={styles.videos}>
				<ul className={styles.list} role="list">
					{mergedData.map((video) => (
						<li key={video.id} role="listitem">
							<Video
								chapterVideo={video}
								display="row"
								path={`/dashboard/player/${continuousVideo.continuous_video_id}?start_time=${video.start_time}&showcase_id=${video.continuous_vimeo_id}`}
							/>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}
