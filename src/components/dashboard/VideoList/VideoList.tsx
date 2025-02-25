import Video from "../Video/Video";
import styles from "./VideoList.module.scss";

export default function VideoList() {
	return (
		<section className={styles.container}>
			<div className={styles.header}>
				<div>
					<h2 className={styles.title}>element type</h2>
					<p className={styles.description}>Brief description</p>
				</div>
				<button className={styles.button}>View all</button>
			</div>
			<ul className={styles.list}>
				<li>
					<Video />
				</li>
				<li>
					<Video />
				</li>
				<li>
					<Video />
				</li>
			</ul>
		</section>
	);
}
