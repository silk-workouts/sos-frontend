"use client";
import { useEffect, useState } from "react";
import LibraryPageContent from "@/components/pages/library/LibraryPageContent/LibraryPageContent";
import { usePlaylists } from "../context/PlaylistContext";
import { useSavedPrograms } from "src/hooks/useSavedPrograms";
import styles from "./page.module.scss";

export default function Library() {
	const { playlists, loading, error } = usePlaylists();
	const {
		savedPrograms,
		loading: savedLoading,
		refreshSavedPrograms,
	} = useSavedPrograms(); // ✅ Add refreshSavedPrograms
	const [isSelected, setIsSelected] = useState({
		myFormula: true,
		program: false,
	});

	function handleSelect(selected: boolean) {
		if (!selected) {
			const newSelection = {
				myFormula: !isSelected.myFormula,
				program: !isSelected.program,
			};

			setIsSelected(newSelection);
			sessionStorage.setItem("libraryTab", JSON.stringify(newSelection));
		}
	}

	useEffect(() => {
		//Get the last selected tab
		const selectedTab = sessionStorage.getItem("libraryTab");

		if (selectedTab) {
			setIsSelected(JSON.parse(selectedTab));
		}
	}, []);

	// Handle loading states for both playlists and saved programs
	if (loading || savedLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error loading playlists</div>;
	}

	return (
		<div className={styles.container}>
			<div className={styles["tab-container"]}>
				<ul className={styles.tabContent} role="tablist" tabIndex={0}>
					<li
						role="tab"
						tabIndex={isSelected.myFormula ? 0 : -1}
						id="myFormula-tab"
						aria-selected={isSelected.myFormula}
						aria-controls="myFormula-panel"
						className={`${styles.tab} ${
							isSelected.myFormula ? styles["tab--selected"] : ""
						}`}
						onClick={() => {
							handleSelect(isSelected.myFormula);
						}}
					>
						my formulas
					</li>
					<li
						role="tab"
						tabIndex={isSelected.program ? 0 : -1}
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
						saved programs
					</li>
				</ul>
			</div>

			{/* My Formulas Section */}
			<div
				id="myFormula-panel"
				role="tabpanel"
				aria-labelledby="myFormula-tab"
				hidden={!isSelected.myFormula}
				className={styles.content}
			>
				<LibraryPageContent playlists={playlists} type="myFormula" />
			</div>

			{/* Saved Programs Section */}
			<div
				id="program-panel"
				role="tabpanel"
				aria-labelledby="program-tab"
				hidden={!isSelected.program}
				className={styles.content}
			>
				<LibraryPageContent
					savedPrograms={savedPrograms}
					refreshSavedPrograms={refreshSavedPrograms}
					type="program"
				/>{" "}
				{/* ✅ Pass refresh function */}
			</div>
		</div>
	);
}
