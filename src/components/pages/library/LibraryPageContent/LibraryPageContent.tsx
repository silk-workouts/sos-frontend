"use client";
import Image from "next/image";
import kebabIcon from "/public/assets/icons/kebab.svg";
import rightArrow from "/public/assets/icons/arrow-right.svg";
import playIcon from "/public/assets/icons/play.svg";
import clockIcon from "/public/assets/icons/clock.svg";
import styles from "./LibraryPageContent.module.scss";
import { useRouter } from "next/navigation";

export default function LibraryPageContent({ playlists, type }) {
	return (
		<ul className={styles.list}>
			{playlists.map((playlist) => {
				return (
					<li key={playlist.id} className={styles.list__item}>
						<PlayListCard playlist={playlist} />
					</li>
				);
			})}
		</ul>
	);
}

function PlayListCard({ playlist }) {
	const router = useRouter();

	function handlePlaylistNavigation(id) {
		router.push(`/dashboard/library/${id}`);
	}
	return (
		<article className={styles.card}>
			<div className={styles.card__headerContainer}>
				<header>
					<h2 className={styles.card__title}>{playlist.title}</h2>
					<p className={styles.card__description}>{playlist.description}</p>
				</header>
				<button className={styles.button}>
					<Image src={kebabIcon} alt="A kebab menu icon" />
				</button>
			</div>
			<div className={styles.card__infoContainer}>
				<div className={styles.info}>
					<span>
						<Image src={playIcon} alt="" className={styles.icon} />
						<span>[num] Videos</span>
					</span>
					<span>
						<Image src={clockIcon} alt="" className={styles.icon} />
						<span>[num] mins</span>
					</span>
				</div>
				<button
					className={styles.button}
					onClick={() => handlePlaylistNavigation(playlist.id)}
				>
					<Image
						src={rightArrow}
						alt="A right arrow icon"
						className={styles.icon}
					/>
				</button>
			</div>
		</article>
	);
}
