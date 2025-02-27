"use client";

import { useEffect, useState } from "react";
import Video from "../Video/Video";
import styles from "./VideoList.module.scss";
import axios from "axios";
import { useRouter } from "next/navigation";

const url = process.env.NEXT_PUBLIC_APP_URL;

export default function VideoList({ video }) {
	const router = useRouter();
	const [showcaseVideos, setShowCaseVideos] = useState([]);
	//console.log(video);

	useEffect(() => {
		async function getShowcaseVideos() {
			try {
				const response = await axios.get(
					`${url}/api/showcases/${video.vimeo_showcase_id}`
				);
				setShowCaseVideos(response.data.videos);
			} catch (error) {
				console.error(
					`Unable to retrieve showcase videos from Vimeo: ${error}`
				);
			}
		}

		getShowcaseVideos();
	}, []);

	return (
		<section className={styles.container}>
			<div className={styles.header}>
				<div>
					<h2 className={styles.title}>{video.name.toLowerCase()}</h2>
					<p className={styles.description}>{video.description}</p>
				</div>
				<button
					className={styles.button}
					onClick={() => {
						router.push(
							`/dashboard/${video.name.toLowerCase()}/${
								video.vimeo_showcase_id
							}`
						);
					}}
				>
					View all
				</button>
			</div>
			<ul className={styles.list}>
				{showcaseVideos.map((showcaseVideo) => {
					return (
						<li key={showcaseVideo.id}>
							<Video showcaseVideo={showcaseVideo} />
						</li>
					);
				})}
			</ul>
		</section>
	);
}
