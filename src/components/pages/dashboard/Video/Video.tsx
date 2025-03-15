import Image from "next/image";
import Link from "next/link";
import kebabIcon from "/public/assets/icons/kebab.svg";
import { ShowcaseVideo } from "../VideoList/VideoList";
import AddToModal from "@/components/pages/dashboard/AddToModal/AddToModal";
import styles from "./Video.module.scss";
import { useState } from "react";

interface VideoProps {
	showcaseVideo: ShowcaseVideo;
	display: string;
	path: string;
}

export default function Video({ showcaseVideo, display, path }: VideoProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<article
			className={`${styles.card} ${
				display === "row" ? styles["card--row"] : ""
			}`}
		>
			<Link href={`${path}/${showcaseVideo.vimeo_video_id}`}>
				<Image
					src={showcaseVideo.thumbnail_url}
					className={styles.thumbnail}
					alt={`A thumbnail image for the ${showcaseVideo.title} workout`}
					width={132}
					height={74}
				/>
			</Link>
			<div
				className={`${styles.header} ${
					display === "row" ? styles["header--row"] : ""
				}`}
			>
				<h3 className={styles.title}>
					<Link href={`${path}/${showcaseVideo.vimeo_video_id}`}>
						{showcaseVideo.title.toLowerCase()}{" "}
					</Link>
				</h3>

				<button
					className={styles.menuButton}
					onClick={() => setIsModalOpen(!isModalOpen)}
					aria-label="Add Menu"
				>
					<Image src={kebabIcon} alt="" />
				</button>
			</div>
			<AddToModal
				isOpen={isModalOpen}
				setIsOpen={setIsModalOpen}
				video_id={showcaseVideo.vimeo_video_id}
			/>
		</article>
	);
}
