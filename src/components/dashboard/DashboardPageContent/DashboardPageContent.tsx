"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ElementFilter from "../ElementFilter/ElementFilter";
import VideoList from "../VideoList/VideoList";

//import styles from "./DashboardPageContent.module.scss";

export default function DashboardPageContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [elementFilter, setElementFilter] = useState([]);

	useEffect(() => {
		if (searchParams.get("refresh")) {
			router.replace("/dashboard"); // Remove refresh param and reload
		}
	}, [searchParams, router]);

	return (
		<>
			<ElementFilter />
			<VideoList />
			<VideoList />
			<VideoList />
			<VideoList />
		</>
	);
}
