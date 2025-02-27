"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ElementFilter from "../ElementFilter/ElementFilter";
import VideoList from "../VideoList/VideoList";
import styles from "./DashboardPageContent.module.scss";

export default function DashboardPageContent({ showcases, type }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	//const [elementFilter, setElementFilter] = useState([]);

	useEffect(() => {
		if (searchParams.get("refresh")) {
			router.replace("/dashboard"); // Remove refresh param and reload
		}
	}, [searchParams, router]);

	return (
		<>
			<h1>{showcases.length}</h1>
			{/* <ElementFilter />
			<ul>
				{showcases.map((video) => {
					return (
						<li key={video.id}>
							{" "}
							<VideoList video={video} />
						</li>
					);
				})}
			</ul> */}
		</>
	);
}
