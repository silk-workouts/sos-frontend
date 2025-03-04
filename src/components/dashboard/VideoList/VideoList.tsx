"use client";

import { useEffect, useState } from "react";
import Video from "../Video/Video";
import styles from "./VideoList.module.scss";
import axios from "axios";
import { useRouter } from "next/navigation";

const url = process.env.NEXT_PUBLIC_APP_URL;

export default function VideoList({ video, isModalOpen, setIsModalOpen }) {
	const router = useRouter();
	const [showcaseVideos, setShowCaseVideos] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const routeName = video.name
		.toLowerCase()
		.replace(/\s+/g, "-") //replace spaces with hyphens for better readability
		.replace(/[%\.]/g, ""); //replace %  as it causes a Bad Request Error

	useEffect(() => {
		async function getShowcaseVideos() {
			try {
				const response = await axios.get(
					`${url}/api/showcases/${video.vimeo_showcase_id}`
				);
				setShowCaseVideos(response.data.videos);
				setIsLoading(false);
			} catch (error) {
				console.error(
					`Unable to retrieve showcase videos from Vimeo: ${error}`
				);
			}
		}

		getShowcaseVideos();
	}, []);

	if (isLoading) {
		return <div>List of videos is loading...</div>;
	}

	function handleShowVideoList() {
		router.push(`/dashboard/${routeName}/${video.vimeo_showcase_id}/videos`);
	}

	return (
		<section className={styles.container}>
			<div className={styles.header}>
				<div>
					<h2 className={styles.title}>{video.name.toLowerCase()}</h2>
					<p className={styles.description}>
						{video.description ||
							"[Description goes here but it is currently empty]"}
					</p>
				</div>
				<button className={styles.button} onClick={handleShowVideoList}>
					View all
				</button>
			</div>
			<ul className={styles.list}>
				{showcaseVideos.map((showcaseVideo) => {
					return (
						<li key={showcaseVideo.id}>
							<Video
								showcaseVideo={showcaseVideo}
								display="column"
								isModalOpen={isModalOpen}
								setIsModalOpen={setIsModalOpen}
								path={`/dashboard/${routeName}/${video.vimeo_showcase_id}/videos`}
							/>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
