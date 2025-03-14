"use client";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

export interface Playlist {
	created_at: string;
	description: string;
	id: string;
	title: string;
	user_id: string;
}

export interface PlaylistsContextType {
	playlists: Playlist[];
	loading: boolean;
	error: string;
	refreshPlaylists: () => Promise<void>;
	userId: string;
}

const PlaylistsContext = createContext<PlaylistsContextType>({
	playlists: [],
	loading: true,
	error: "",
	refreshPlaylists: async () => {},
	userId: "",
});

export default function PlaylistsProvider({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [userId, setUserId] = useState("");
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
					setUserId("");
				}
			} catch (error) {
				console.error(`Unable to fetch user authentication status: ${error}`);
				setUserId("");
			}
		}

		checkStatus();
	}, []);

	async function getPlaylists() {
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
	return context;
}
