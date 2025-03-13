"use client";
import { useParams } from "next/navigation";
import styles from "./page.module.scss";
import { useEffect, useState } from "react";
import axios from "axios";
import { usePlaylists } from "../../context/PlaylistContext";

export default function Playlist() {
	const { playlist_id } = useParams();
	const { userId } = usePlaylists();

	const [loading, setLoading] = useState(true);
	const [playlist, setPlaylist] = useState(null);
	const [playlistVideos, setPlaylistVideos] = useState([]);

	useEffect(() => {
		async function getPlaylistVideos() {
			setLoading(true);

			try {
				const response = await axios.get(`/api/playlists/${playlist_id}`, {
					headers: { "x-user-id": userId },
				});
				setPlaylist(response.data.playlist);
				setPlaylistVideos(response.data.videos);
			} catch (error) {
				console.error(`Unable to retrieve videos for playlist: ${error}`);
			} finally {
				setLoading(false);
			}
		}
		if (userId) {
			getPlaylistVideos();
		}
	}, [userId]);

	if (loading) {
		return <div>Loading playlists</div>;
	}

	return (
		<div>
			<ul>
				{playlistVideos.map((video) => {
					return <li key={video.id}>{video.title}</li>;
				})}
			</ul>
		</div>
	);
}
