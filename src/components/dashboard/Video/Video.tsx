import Image from "next/image";
import kebabIcon from "/public/assets/icons/kebab.svg";
import styles from "./Video.module.scss";
import Link from "next/link";

export default function Video({
	showcaseVideo,
	display,
	isModalOpen,
	setIsModalOpen,
	path,
}) {
	return (
		<Link href={`${path}/${showcaseVideo.vimeo_video_id}`}>
			<article
				className={`${styles.card} ${
					display === "row" ? styles["card--row"] : ""
				}`}
			>
				<video
					src="null"
					className={styles.video}
					poster={showcaseVideo.thumbnail_url}
				></video>
				<div className={styles.header}>
					<h3 className={styles.title}>{showcaseVideo.title.toLowerCase()}</h3>
					<button
						className={styles.menuButton}
						onClick={() => setIsModalOpen(!isModalOpen)}
					>
						<Image src={kebabIcon} alt="A kebab menu icon" />
					</button>
				</div>
			</article>
		</Link>
	);
}
