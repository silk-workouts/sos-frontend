"use client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import chevronLeftIcon from "/public/assets/icons/chevron-left.svg";
import helpIcon from "/public/assets/icons/help.svg";
import playIcon from "/public/assets/icons/play.svg";
import clockIcon from "/public/assets/icons/clock.svg";
import styles from "./page.module.scss";
import Video from "@/components/pages/dashboard/Video/Video";
import { Showcase } from "../../../page";
import { ShowcaseVideo } from "@/components/pages/dashboard/VideoList/VideoList";

export default function SingleShowcasePage() {
	const router = useRouter();
	const { showcase_name, showcase_id } = useParams<{
		showcase_name: string;
		showcase_id: string;
	}>();
	const [loading, setLoading] = useState(true);
	const [showcase, setShowCase] = useState<Showcase | null>(null);
	const [showcaseVideos, setShowCaseVideos] = useState<ShowcaseVideo[]>([]);
	const showcaseName = showcase_name.replaceAll("-", " ");

	useEffect(() => {
		async function getShowcaseVideos() {
			try {
				const response = await axios.get(`/api/showcases/${showcase_id}`);
				setShowCase(response.data.showcase);
				setShowCaseVideos(response.data.videos);
				setLoading(false);
			} catch (error) {
				console.error(
					`Unable to retrieve showcase videos from Vimeo: ${error}`
				);
			}
		}

		getShowcaseVideos();
	}, [showcase_id]);

	if (loading) {
		return <div>Loading videos for {showcaseName}...</div>;
	}

	return (
		<>
			<div className={styles.header}>
				<div className={styles["title-container"]}>
					<button
						className={styles.header__button}
						onClick={() => router.back()}
						aria-label="Navigate back"
					>
						<Image src={chevronLeftIcon} alt="" className={styles.hero__icon} />
					</button>
					<h1 className={styles.header__title}>{showcaseName}</h1>
				</div>
				<button className={styles.header__button} aria-label="Get help">
					<Image src={helpIcon} alt="" className={styles.hero__icon} />
				</button>
			</div>
			<div className={styles.hero}>
				<div className={styles["hero__image-container"]}>
					{/* <Image
						src={showcase.thumbnail_url}
						alt={`Thumbnail image for the ${showcaseName} workout`}
						width={0}
						height={0}
						className={styles.hero__image}
					/> */}
				</div>
				<div className={styles.hero__info}>
					<span>
						<Image src={playIcon} alt="" className={styles.hero__icon} />
						{showcaseVideos.length} videos
					</span>
					<span>
						<Image src={clockIcon} alt="" className={styles.hero__icon} />
						{`[duration]`} mins
					</span>
				</div>
				<p className={styles.hero__description}>
					{showcase?.description ||
						"[Description goes here but it is currently empty]"}
				</p>
			</div>
			<ul className={styles.list} role="list">
				{showcaseVideos.map((video) => {
					return (
						<li key={video.id}>
							<Video
								showcaseVideo={video}
								display="row"
								path={`/dashboard/${showcase_name}/${showcase_id}/videos`}
							/>
						</li>
					);
				})}
			</ul>
		</>
	);
}
