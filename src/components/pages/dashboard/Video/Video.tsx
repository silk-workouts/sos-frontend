import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import bookmarkIcon from "public/assets/icons/bookmark-fill.svg";
import bookmarkUnsaved from "public/assets/icons/bookmark-unsaved.svg";
import AddPlaylistModalPortal from "../AddPlaylistModal/AddPlaylistModalPortal";
import { ChapterVideo } from "src/types/video";
import { usePlaylists } from "src/app/(dashboard)/dashboard/context/PlaylistContext";
import styles from "./Video.module.scss";

interface VideoProps {
	chapterVideo: ChapterVideo;
	display: string;
	path: string;
	type?: "player";
}

export default function Video({
	chapterVideo,
	display,
	path,
	type,
}: VideoProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { playlistVideoMap } = usePlaylists();

	const formatDuration = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;

		// Pad with leading zeros if necessary
		const formattedSeconds = String(remainingSeconds).padStart(2, "0");

		return `${minutes}:${formattedSeconds}`;
	};

	return (
		<article
			className={`${styles.card} ${display === "row" ? styles.row : ""}  ${
				type === "player" ? styles.player : ""
			}`}
		>
			<Link
				href={path}
				className={`${styles["card__thumbnail-container"]} ${
					display === "row" ? styles.row : ""
				}  ${type === "player" ? styles.player : ""}`}
			>
				<Image
					src={
						chapterVideo.thumbnail_url || "/assets/images/default-thumbnail.jpg"
					}
					className={styles.thumbnail}
					alt={`A thumbnail image for ${chapterVideo.title} workout`}
					fill
					sizes="(max-width: 767px) 160px, (max-width: 1279px) 216px, 300px"
					style={{ objectFit: "cover" }}
				/>
				<div className={styles.duration}>
					{formatDuration(chapterVideo.duration)}
				</div>
			</Link>

			<div
				className={`${styles.header} ${display === "row" ? styles.row : ""}`}
			>
				<h3
					className={`${styles.title}  ${
						type === "player" ? styles.player : ""
					}`}
				>
					<Link href={path}>{chapterVideo.title.toLowerCase()}</Link>
				</h3>

				<button
					className={styles.menuButton}
					onClick={() => setIsModalOpen(!isModalOpen)}
					aria-label="Add Menu"
				>
					<Image
						src={
							playlistVideoMap[chapterVideo.real_vimeo_video_id]
								? bookmarkIcon
								: bookmarkUnsaved
						}
						alt="Options"
						className={`${styles.icon}  ${
							type === "player" ? styles.player : ""
						}`}
					/>
				</button>
			</div>

			{isModalOpen && (
				<AddPlaylistModalPortal
					setIsOpen={setIsModalOpen}
					video_id={chapterVideo.real_vimeo_video_id}
				/>
			)}
		</article>
	);
}
