"use client";
import axios from "axios";
import styles from "./page.module.scss";
import { useEffect, useState } from "react";
import LibraryPageContent from "@/components/dashboard/LibraryPageContent/LibraryPageContent";

export default function Library() {
	const [playlists, setPlaylists] = useState([]);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isSelected, setIsSelected] = useState({
		myFormula: true,
		program: false,
	});

	function handleSelect(selected: boolean) {
		if (!selected) {
			setIsSelected({
				myFormula: !isSelected.myFormula,
				program: !isSelected.program,
			});
		}
	}

	useEffect(() => {
		async function checkStatus() {
			try {
				const response = await axios.get("/api/auth/status", {
					withCredentials: true,
				});

				if (response.status === 200) {
					setUser(response.data);
				} else {
					setUser(null);
				}
			} catch (error) {
				console.error(`Unable to fetch user authentication status: ${error}`);
				setUser(null);
			}
		}

		checkStatus();
	}, []);

	useEffect(() => {
		if (!user) {
			return;
		}

		async function getPlaylists() {
			try {
				const response = await axios.get("/api/playlists", {
					headers: { "x-user-id": user.userId },
				});
				setPlaylists(response.data.playlists);
				setError("");
			} catch (error) {
				console.error(`Unable to retrieve playlists: ${error}`);
				setError("Failed to load playlists");
			} finally {
				setLoading(false);
			}
		}

		getPlaylists();
	}, [user]);

	if (loading) {
		return <div>loading...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div>
			<div className={styles["tab-container"]}>
				<ul className={styles.tabContent} role="tablist" tabIndex={0}>
					<li
						role="tab"
						tabIndex={0}
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
						saved programs
					</li>
				</ul>
			</div>
			<div
				id="myFormula-panel"
				role="tabpanel"
				aria-labelledby="myFormula-tab"
				hidden={!isSelected.myFormula}
				className={styles.content}
			>
				<LibraryPageContent playlists={playlists} type="myFormula" />
			</div>
			<div
				id="program-panel"
				role="tabpanel"
				aria-labelledby="program-tab"
				hidden={!isSelected.program}
				className={styles.content}
			>
				<LibraryPageContent playlists={playlists} type="myFormula" />
			</div>
		</div>
	);
}
