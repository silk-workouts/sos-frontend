import Image from "next/image";
import kebabIcon from "/public/assets/icons/kebab.svg";
import styles from "./Video.module.scss";

export default function Video({ poster }) {
	return (
		<article className={styles.card}>
			<video src="null" className={styles.video} poster={poster}></video>
			<div className={styles.header}>
				<h3 className={styles.title}>Video title</h3>
				<button className={styles.menuButton}>
					<Image src={kebabIcon} alt="A kebab menu icon" />
				</button>
			</div>
		</article>
	);
}
