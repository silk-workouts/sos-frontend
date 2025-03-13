"use client";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const PlaylistsContext = createContext(undefined);

export default function PlaylistsProvider({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const [playlists, setPlaylists] = useState([]);
	const [userId, setUserId] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		async function checkStatus() {
			try {
				const response = await axios.get("/api/auth/status", {
					withCredentials: true,
				});

				if (response.status === 200) {
					setUserId(response.data.userId);
				} else {
					setUserId(null);
				}
			} catch (error) {
				console.error(`Unable to fetch user authentication status: ${error}`);
				setUserId(null);
			}
		}

		checkStatus();
	}, []);

	async function getPlaylists() {
		if (!userId) return;

		setLoading(true);
		try {
			const response = await axios.get("/api/playlists", {
				headers: { "x-user-id": userId },
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

	useEffect(() => {
		if (userId) {
			getPlaylists();
		}
	}, [userId]);

	return (
		<PlaylistsContext.Provider
			value={{
				playlists,
				loading,
				error,
				refreshPlaylists: getPlaylists,
				userId,
			}}
		>
			{children}
		</PlaylistsContext.Provider>
	);
}

export function usePlaylists() {
	const context = useContext(PlaylistsContext);
	if (!context) {
		throw new Error("usePlaylists must be used within a PlaylistsProvider");
	}
	return context;
}
