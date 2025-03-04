"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.scss";
import axios from "axios";

const url = process.env.NEXT_PUBLIC_APP_URL;

export default function SingleVideoPage() {
	const { video_id } = useParams<{ video_id: string }>();
	const [video, setVideo] = useState({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function getVideo() {
			try {
				const response = await axios.get(`${url}/api/videos/${video_id}`);
				setVideo(response.data);
				setLoading(false);
			} catch (error) {
				console.error(`Unable to retrieve video details from vimeo: ${error}`);
			}
		}

		getVideo();
	}, [video_id]);

	if (loading) {
		return <div>Loading video...</div>;
	}

	return (
		<div className={styles["video-container"]}>
			<video controls poster={video.thumbnail_url} className={styles.video}>
				<source src={`${url}${video.playbackUrl}`} />
				Watch the
				<a href={`${url}${video.playbackUrl}`}>video</a>
			</video>
		</div>
	);
}
