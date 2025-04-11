"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import rightArrow from "/public/assets/icons/arrow-right.svg";
import bookmark from "public/assets/icons/bookmark-fill.svg";
import bookmarkUnsaved from "public/assets/icons/bookmark-unsaved.svg";
import playIcon from "/public/assets/icons/play.svg";
import clockIcon from "/public/assets/icons/clock.svg";
import chevronIcon from "/public/assets/icons/chevron-left.svg";
import Video from "../Video/Video";
import { playlistDuration } from "../../library/PlayListCard/PlayListCard";
import { ChapterVideo } from "src/types/video";
import { ContinuousVideo } from "src/app/(dashboard)/dashboard/page";
import { usePlaylists } from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import { useSavedPrograms } from "src/hooks/useSavedPrograms";
import { parseDescription } from "src/utils/parseDescription";
import styles from "./VideoList.module.scss";

interface Chapter {
	id: number;
	title: string;
	start_time: number;
	duration: number | null;
	continuous_vimeo_id: string;
	real_vimeo_video_id: string;
	video_description: string;
}

interface MergedChapterVideo extends ChapterVideo {
	title: string;
	start_time: number;
	duration: number;
	thumbnail_url: string;
	real_vimeo_video_id: string;
	continuous_vimeo_id: string;
	vimeo_video_id: string; // ✅ must be string (not optional)
	video_description: string;
}

interface VideoListProps {
	video: ContinuousVideo;
	type: string;
}

export default function VideoList({ video, type }: VideoListProps) {
	const router = useRouter();
	const scrollableContainerRef = useRef<HTMLUListElement>(null);

	const [scrollAmount, setScrollAmount] = useState(100);
	const [scrollIsAtStart, setScrollIsAtStart] = useState(true);
	const [scrollIsAtEnd, setScrollIsAtEnd] = useState(false);
	const [chapterVideos, setChapterVideos] = useState<ChapterVideo[]>([]);
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [continuousVideo, setContinuousVideo] = useState<{
		continuous_video_id: string;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const { userId } = usePlaylists();
	const { saveProgram, deleteProgram, savedPrograms } = useSavedPrograms();

	const routeName = video.name
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[%\.]/g, "");

	function scroll(direction: "left" | "right") {
		scrollableContainerRef.current?.scrollBy({
			left: direction === "left" ? -scrollAmount : scrollAmount,
			behavior: "smooth",
		});
	}

	function checkScrollPosition() {
		if (!scrollableContainerRef.current) return;

		const { scrollLeft, scrollWidth, clientWidth } =
			scrollableContainerRef.current;

		//Update whether state is at start or end to disable scrollbar buttons accordingly
		setScrollIsAtStart(scrollLeft === 0);
		setScrollIsAtEnd(scrollLeft + clientWidth >= scrollWidth);

		//set scroll amount relative to the width of the videos
		setScrollAmount(
			(scrollableContainerRef.current.children[0] as HTMLElement)?.offsetWidth *
				3 || clientWidth
		);
	}

	useEffect(() => {
		const container = scrollableContainerRef.current;

		if (!container) return;

		checkScrollPosition();

		container.addEventListener("scroll", checkScrollPosition);
		return () => container.removeEventListener("scroll", checkScrollPosition);
	}, [scrollableContainerRef.current]);

	useEffect(() => {
		axios
			.get("/api/chapters", {
				params: { continuous_vimeo_id: video.continuous_video_id },
			})
			.then((res) => setChapters(res.data))
			.catch((err) => console.error("Error fetching chapters:", err));
	}, [video.continuous_video_id]);

	useEffect(() => {
		axios
			.get(
				`/api/continuous-videos/${video.continuous_video_id}/continuous-video`
			)
			.then((res) => setContinuousVideo(res.data.continuousVideo))
			.catch((err) =>
				console.error("Error fetching continuous video metadata:", err)
			)
			.finally(() => setIsLoading(false));
	}, [video.continuous_video_id]);

	useEffect(() => {
		axios
			.get(`/api/continuous-videos/${video.continuous_video_id}`)
			.then((res) => setChapterVideos(res.data.chapters))
			.catch((err) => console.error("Error fetching video metadata:", err));
	}, [video.continuous_video_id]);

	if (isLoading || (!chapters.length && continuousVideo)) {
		return <div>List of videos is loading...</div>;
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
		.map((chapter) => {
			const videoMeta = chapterVideoMap.get(chapter.real_vimeo_video_id);

			return {
				id: chapter.id,
				title: chapter.title || videoMeta?.title || "Untitled",
				start_time: chapter.start_time ?? 0,
				duration: chapter.duration ?? videoMeta?.duration ?? 0,
				thumbnail_url: videoMeta?.thumbnail_url?.startsWith("http")
					? videoMeta.thumbnail_url
					: "/assets/images/defaultPlaylistThumbnail.png",
				real_vimeo_video_id:
					chapter.real_vimeo_video_id ?? videoMeta?.real_vimeo_video_id ?? "",
				continuous_vimeo_id:
					chapter.continuous_vimeo_id ??
					continuousVideo?.continuous_video_id ??
					"",
				video_description: chapter.video_description || "",
				vimeo_video_id: videoMeta?.vimeo_video_id || "", // ✅ must be string
				description: videoMeta?.description || "",
				position: videoMeta?.position || 0,
				created_at: videoMeta?.created_at || "",
			};
		});

	function handleShowVideoList() {
		router.push(`/dashboard/${routeName}/${video.continuous_video_id}/videos`);
	}

	const isSaved = savedPrograms.some(
		(p) => p.continuousVideoId === video.continuous_video_id
	);

	async function handleToggleSave() {
		if (!userId || !video.continuous_video_id) {
			console.error("Missing userId or continuous_video_id.");
			return;
		}

		// const payload = {
		// 	user_id: userId,
		// 	continuous_vimeo_id: video.continuous_video_id,
		// 	title: video.name,
		// 	description: video.description || "",
		// 	videoCount: chapters.length,
		// 	duration: chapters.reduce((sum, ch) => sum + (ch.duration || 0), 0),
		// };

		if (isSaved) {
			await deleteProgram(video.continuous_video_id);
		} else {
			await saveProgram({
				userId, // ✅ fix this
				continuousVideoId: video.continuous_video_id, // ✅ already good
				title: video.name,
				description: video.description || "",
				videoCount: chapters.length,
				duration: chapters.reduce(
					(sum, chapter) => sum + (chapter.duration || 0),
					0
				),
			});
		}
	}

	const duration = playlistDuration(
		mergedData.reduce((sum, ch) => sum + (ch.duration || 0), 0)
	);

	return (
		<section className={styles.container}>
			<div className={styles.infoContainer}>
				<div className={styles.headerContainer}>
					<div className={styles.header}>
						<div className={styles.titleContainer}>
							<h2 className={styles.title}>{video.name.toLowerCase()}</h2>
							<button
								className={`${styles.button} ${styles["button--tablet"]}`}
								onClick={handleShowVideoList}
								aria-label="View all videos"
							>
								<Image
									src={rightArrow}
									alt=""
									className={styles.icon}
									aria-hidden
								/>
							</button>
						</div>
						{video.description ? (
							(() => {
								const { title } = parseDescription(video.description);
								return (
									<>
										{title && (
											<blockquote
												className={styles.subTitle}
											>{`"${title}"`}</blockquote>
										)}
									</>
								);
							})()
						) : (
							<p className={`${styles.description}`}>{video.description}</p>
						)}
					</div>
					{type === "program" && (
						<button
							className={styles.bookmarkButton}
							onClick={handleToggleSave}
						>
							<Image
								src={isSaved ? bookmark : bookmarkUnsaved}
								alt=""
								className={styles.bookmarkIcon}
							/>
							<span>{isSaved ? "Saved to library" : "Save to library"}</span>
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
					<button className={styles.button} onClick={handleShowVideoList}>
						<Image
							src={rightArrow}
							alt=""
							className={styles.icon}
							aria-hidden
						/>
					</button>
					<div className={styles.scrollbar}>
						<button
							className={`${styles.scrollbar__button} ${
								scrollIsAtStart ? styles["scrollbar__button--disabled"] : ""
							}`}
							aria-controls="scroll-area"
							onClick={() => scroll("left")}
							disabled={scrollIsAtStart}
							aria-label="Click to view previous videos"
						>
							<Image
								src={chevronIcon}
								aria-hidden="true"
								alt=""
								className={styles.scrollbar__icon}
							/>
						</button>
						<button
							className={`${styles.scrollbar__button} ${
								scrollIsAtEnd ? styles["scrollbar__button--disabled"] : ""
							}`}
							aria-controls="scroll-area"
							onClick={() => scroll("right")}
							disabled={scrollIsAtEnd}
							aria-label="Click to view next videos"
						>
							<Image
								src={chevronIcon}
								aria-hidden="true"
								alt=""
								className={`${styles.scrollbar__icon} ${styles["scrollbar__icon--right"]}`}
							/>
						</button>
					</div>
				</div>
			</div>

			<ul className={styles.list} id="scroll-area" ref={scrollableContainerRef}>
				{mergedData.map((chapterVideo) => (
					<li
						key={chapterVideo.id}
						className={chapterVideo.real_vimeo_video_id}
					>
						<Video
							chapterVideo={chapterVideo}
							display="column"
							path={`/dashboard/player/${chapterVideo.continuous_vimeo_id}?start_time=${chapterVideo.start_time}&continuous_video_id=${chapterVideo.continuous_vimeo_id}`}
						/>
					</li>
				))}
			</ul>
		</section>
	);
}
