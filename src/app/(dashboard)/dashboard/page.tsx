"use client";

import { Suspense, useEffect, useState } from "react";
import axios from "axios";
import DashboardPageContent from "@/components/dashboard/DashboardPageContent/DashboardPageContent";
import styles from "./page.module.scss";

const url = process.env.NEXT_PUBLIC_APP_URL;

export interface Showcase {
	id: number;
	vimeo_showcase_id: string;
	name: "string";
	description: string;
	thumbnail_url: string;
	vimeo_link: string;
	created_at: string;
}

export default function DashboardPage() {
	const [showcases, setShowcases] = useState([]);
	const [isSelected, setIsSelected] = useState({
		element: true,
		program: false,
	});

	function handleSelect(selected: boolean) {
		if (!selected) {
			setIsSelected({
				element: !isSelected.element,
				program: !isSelected.program,
			});
		}
	}

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

	//filter showcase videos by element or prescription programs
	const filteredShowcases = showcases.filter((video: Showcase) =>
		isSelected.program
			? video.name.toLowerCase().includes("prescription")
			: !video.name.toLowerCase().includes("prescription")
	);

	filteredShowcases.sort((a, b) => (a.name > b.name ? 1 : -1));

	return (
		<Suspense fallback={<div>Loading dashboard...</div>}>
			<div className={styles["tab-container"]}>
				<ul className={styles.tabContent} role="tablist" tabIndex={0}>
					<li
						role="tab"
						tabIndex={0}
						id="element-tab"
						aria-selected={isSelected.element}
						aria-controls="element-panel"
						className={`${styles.tab} ${
							isSelected.element ? styles["tab--selected"] : ""
						}`}
						onClick={() => {
							handleSelect(isSelected.element);
						}}
					>
						elements
					</li>
					<li
						role="tab"
						tabIndex={0}
						id="program-tab"
						aria-selected={isSelected.program}
						aria-controls="program-panel"
						className={`${styles.tab} ${
							isSelected.program ? styles["tab--selected"] : ""
						}`}
						onClick={() => {
							handleSelect(isSelected.program);
						}}
					>
						prescription programs
					</li>
				</ul>
			</div>
			<div
				id="element-panel"
				role="tabpanel"
				aria-labelledby="element-tab"
				hidden={!isSelected.element}
			>
				<DashboardPageContent showcases={filteredShowcases} type="element" />
			</div>
			<div
				id="program-panel"
				role="tabpanel"
				aria-labelledby="program-tab"
				hidden={!isSelected.program}
			>
				<DashboardPageContent showcases={filteredShowcases} type="program" />
			</div>
		</Suspense>
	);
}
