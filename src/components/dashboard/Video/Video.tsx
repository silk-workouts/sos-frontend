import Image from "next/image";
import kebabIcon from "/public/assets/icons/kebab.svg";
import styles from "./Video.module.scss";

export default function Video({ showcaseVideo, display }) {
	return (
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
				<button className={styles.menuButton}>
					<Image src={kebabIcon} alt="A kebab menu icon" />
				</button>
			</div>
		</article>
	);
}
