"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ElementFilter from "../ElementFilter/ElementFilter";
import VideoList from "../VideoList/VideoList";
import axios from "axios";
import styles from "./DashboardPageContent.module.scss";

const url = process.env.NEXT_PUBLIC_APP_URL;

export default function DashboardPageContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	//const [elementFilter, setElementFilter] = useState([]);
	const [showcases, setShowcases] = useState([]);

	useEffect(() => {
		if (searchParams.get("refresh")) {
			router.replace("/dashboard"); // Remove refresh param and reload
		}
	}, [searchParams, router]);

	useEffect(() => {
		async function getShowcases() {
			try {
				const response = await axios.get(`${url}/api/showcases`);
				setShowcases(response.data.showcases);
			} catch (error) {
				console.error(
					`Unable to retrieve showcase videos from Vimeo: ${error}`
				);
			}
		}

		getShowcases();
	}, []);

	if (showcases.length === 0) {
		return <div>Loading...</div>;
	}
	console.log(showcases);

	// let newArr =  showcases.filter((video) => video.name.toLowerCase.includes("prescription"))
	// console.log(newArr	);
	return (
		<>
			<ElementFilter />
			<ul>
				{showcases.map((video) => {
					return (
						<li key={video.id}>
							{" "}
							<VideoList video={video} />
						</li>
					);
				})}
			</ul>
		</>
	);
}
