"use client";
import { useParams } from "next/navigation";
import styles from "./page.module.scss";

export default function Playlist() {
	const { playlist_id } = useParams();

	return <div>Playlist with id {playlist_id}</div>;
}
