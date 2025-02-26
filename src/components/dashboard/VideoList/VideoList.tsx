import Video from "../Video/Video";
import styles from "./VideoList.module.scss";

export default function VideoList({ video }) {
	return (
		<section className={styles.container}>
			<div className={styles.header}>
				<div>
					<h2 className={styles.title}>{video.name}</h2>
					<p className={styles.description}>{video.description}</p>
				</div>
				<button className={styles.button}>View all</button>
			</div>
			<ul className={styles.list}>
				<li>
					<Video poster={video.thumbnail_url} />
				</li>
				<li>
					<Video poster={video.thumbnail_url} />
				</li>
				<li>
					<Video poster={video.thumbnail_url} />
				</li>
			</ul>
		</section>
	);
}
