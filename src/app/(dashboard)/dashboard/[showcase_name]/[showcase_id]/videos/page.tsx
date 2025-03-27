"use client";
import axios from "axios";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import defaultThumbnail from "/public/assets/images/defaultPlaylistThumbnail.png";
import leftArrowIcon from "/public/assets/icons/chevron-left-white.svg";
import leftArrow from "/public/assets/icons/arrow-left.svg";
import playIcon from "/public/assets/icons/play-red.svg";
import playFilledIcon from "/public/assets/icons/play-fill.svg";
import clockIcon from "/public/assets/icons/clock-red.svg";
import bookmarkIcon from "/public/assets/icons/bookmark-white.svg";
import Video from "@/components/pages/dashboard/Video/Video"; // ✅ Prefer A (assuming this is intentional)
import { Showcase } from "../../../page";
import { ShowcaseVideo } from "@/components/pages/dashboard/VideoList/VideoList";
import styles from "./page.module.scss";
import { playlistDuration } from "@/components/pages/library/PlayListCard/PlayListCard";
import Element from "@/components/Element/Element";

interface Chapter {
	id: number;
	title: string;
	start_time: number;
	duration: number | null;
	showcase_id: number;
	continuous_vimeo_id: string;
	real_vimeo_video_id: string;
}

export default function SingleShowcasePage() {
	const router = useRouter();
	const { showcase_name, showcase_id } = useParams<{
		showcase_name: string;
		showcase_id: string;
	}>()!;

	const [loading, setLoading] = useState(true);
	const [showcase, setShowcase] = useState<Showcase | null>(null); // ✅ Prefer A (correct casing)
	const [showcaseVideos, setShowcaseVideos] = useState<ShowcaseVideo[]>([]);
	const [continuousVideo, setContinuousVideo] = useState<{
		continuous_vimeo_id: string;
		continuous_vimeo_title: string;
	} | null>(null);
	const [chapters, setChapters] = useState<Chapter[]>([]);

	const showcaseName = showcase_name.replaceAll("-", " ");

	useEffect(() => {
		async function fetchShowcase() {
			try {
				const response = await axios.get(`/api/showcases/${showcase_id}`);
				setShowcase(response.data.showcase);
				setShowcaseVideos(response.data.videos);
				setLoading(false);
			} catch (error) {
				console.error("Unable to retrieve showcase videos:", error);
			}
		}
		fetchShowcase();
	}, [showcase_id]);

	useEffect(() => {
		async function fetchContinuousVideo() {
			try {
				const response = await axios.get(
					`/api/showcases/${showcase_id}/continuous-video`
				);
				setContinuousVideo(response.data);
			} catch (error) {
				console.error("Unable to retrieve continuous video:", error);
			}
		}
		fetchContinuousVideo();
	}, [showcase_id]);

	useEffect(() => {
		async function getChapters() {
			if (!continuousVideo?.continuous_vimeo_id) return;
			try {
				const response = await axios.get("/api/chapters", {
					params: { continuous_vimeo_id: continuousVideo.continuous_vimeo_id },
				});
				setChapters(response.data);
				console.log("🔄 Chapters re-fetched on showcase change");
			} catch (error) {
				console.error("Unable to fetch chapters:", error);
			}
		}
		getChapters();
	}, [showcase_id, continuousVideo]);

	if (loading || !continuousVideo) {
		return <div>Loading videos for {showcaseName}...</div>;
	}

	const mergedData = chapters.map((chapter, index) => {
		// const matchingVideo = showcaseVideos[index]; // fallback by index
		const adjustedIndex = index + 1;
		const matchingVideo = showcaseVideos[adjustedIndex];
		return {
			...matchingVideo,
			title: chapter.title, // Use chapter title
			start_time: chapter.start_time,
			real_vimeo_video_id: chapter.real_vimeo_video_id,
		};
	});

	/**  Play All Button Click Handler */
	function handlePlayAll() {
		if (continuousVideo?.continuous_vimeo_id) {
			router.push(
				`/dashboard/player/${continuousVideo.continuous_vimeo_id}?showcase_id=${showcase_id}&autoplay=1`
			);
		}
	}

	const duration = playlistDuration(
		mergedData.reduce((prev, curr) => prev + curr.duration, 0)
	);

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

				{showcaseName.includes("prescription") && (
					<div className={styles["hero__image-container"]}>
						<Image
							src={showcase?.thumbnail_url || defaultThumbnail}
							alt=""
							fill
							sizes="(max-width: 1279px) 100%, 312px"
							style={{ objectFit: "cover" }}
							className={styles.hero__image}
						/>
					</div>
				)}

				<header className={styles.hero__header}>
					{showcaseName.includes("prescription") ? (
						<div className={styles["hero__title-container"]}>
							<h1 className={styles.hero__title}>
								{showcase?.name.toLowerCase()}
							</h1>
							<button
								aria-label={`Save ${showcase?.name} to your library`}
								className={styles.hero__button}
								onClick={() => ""}
							>
								<Image
									src={bookmarkIcon}
									alt=""
									className={`${styles.hero__icon} ${styles["hero__icon--save"]}`}
									aria-hidden="true"
								/>
							</button>
						</div>
					) : (
						<h2 className={styles.hero__element}>
							<Element name={showcaseName} />
						</h2>
					)}
					<div className={styles.hero__info}>
						<span className={styles.hero__message}>
							<Image
								src={playIcon}
								alt=""
								aria-hidden="true"
								className={styles.hero__icon}
							/>
							<span>{mergedData.length} videos</span>
						</span>
						<span className={styles.hero__message}>
							<Image
								src={clockIcon}
								alt=""
								aria-hidden="true"
								className={styles.hero__icon}
							/>
							<span>{duration}</span>
						</span>
					</div>
					<p className={styles.hero__description}>
						{showcase?.description || "[No description provided]"}
					</p>
				</header>

				<button
					onClick={handlePlayAll}
					className={`${styles.hero__button} ${styles["hero__button--begin"]}`}
					aria-label={`Play all videos in the ${showcase?.name} workout`}
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

			{/* THUMBNAILS */}
			<section className={styles.videos}>
				<ul className={styles.list} role="list">
					{mergedData.map((video) => (
						<li key={video.id} role="listitem">
							<Video
								showcaseVideo={video}
								display="row"
								path={`/dashboard/player/${continuousVideo.continuous_vimeo_id}?start_time=${video.start_time}&showcase_id=${showcase_id}`} // With chapter start time
							/>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}
