import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import bookmarkUnsaved from "public/assets/icons/bookmark-unsaved.svg";
import AddPlaylistModal from "../AddPlaylistModal/AddPlaylistModal";
import { ShowcaseVideo } from "../VideoList/VideoList";
import styles from "./Video.module.scss";

interface VideoProps {
	showcaseVideo: ShowcaseVideo;
	display: string;
	path: string;
}

export default function Video({ showcaseVideo, display, path }: VideoProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const fallbackThumbnail = "/default-thumbnail.jpg";
	const minute = `${Math.floor(showcaseVideo.duration / 60) || "00"}`;
	const seconds = `${Math.floor(showcaseVideo.duration % 60)}`.padStart(2, "0");
	const duration = `${minute}:${seconds}`;

	return (
		<article
			className={`${styles.card} ${
				display === "row" ? styles["card--row"] : ""
			}`}
		>
			<Link href={path} className={styles["card__thumbnail-container"]}>
				<Image
					src={
						showcaseVideo.thumbnail_url?.startsWith("http")
							? showcaseVideo.thumbnail_url
							: fallbackThumbnail
					}
					className={styles.thumbnail}
					alt={`A thumbnail image for ${showcaseVideo.title} workout`}
					fill
					style={{ objectFit: "cover" }}
				/>
				<div className={styles.duration}>{duration}</div>
			</Link>

			<div
				className={`${styles.header} ${
					display === "row" ? styles["header--row"] : ""
				}`}
			>
				<h3 className={styles.title}>
					<Link href={path}>{showcaseVideo.title.toLowerCase()}</Link>
				</h3>

				<button
					className={styles.menuButton}
					onClick={() => setIsModalOpen(!isModalOpen)}
					aria-label="Add Menu"
				>
					<Image src={bookmarkUnsaved} alt="Options" className={styles.icon} />
				</button>
			</div>

			{isModalOpen && (
				<AddPlaylistModal
					setIsOpen={setIsModalOpen}
					video_id={showcaseVideo.vimeo_video_id}
				/>
			)}
		</article>
	);
}
