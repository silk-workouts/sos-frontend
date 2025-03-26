import {
	closestCorners,
	DndContext,
	DragEndEvent,
	DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	UniqueIdentifier,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { PlayerVideo } from "src/app/(dashboard)/dashboard/playlistplayer/[playlist_id]/page";
import styles from "./PlaylistPlayerVideos.module.scss";
import { useState } from "react";
import axios from "axios";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Arguments } from "@dnd-kit/core/dist/components/Accessibility/types";
import SortablePlaylistPlayerVideo from "../SortablePlaylistPlayerVideo/SortablePlaylistPlayerVideo";

interface PlaylistPlayerVideosProps {
	videos: PlayerVideo[];
	handleVideoClick: (arg1: PlayerVideo) => Promise<void>;
	handleBookmark: (arg1: number) => void;
	activeVideo: PlayerVideo;
	activeVideoPosition: number;
	savedVideos: { [key: string]: boolean };
	playlist_id: string;
	userId: string;
	setVideos: (arg1: PlayerVideo[]) => void;
}

export default function PlaylistPlayerVideos({
	videos,
	handleVideoClick,
	handleBookmark,
	activeVideo,
	activeVideoPosition,
	savedVideos,
	playlist_id,
	userId,
	setVideos,
}: PlaylistPlayerVideosProps) {
	const [activeId, setActiveId] = useState<UniqueIdentifier | undefined>(
		undefined
	);

	async function updateVideoPosition(position: number, video_id: number) {
		try {
			await axios.patch(
				`/api/playlists/${playlist_id}/videos/${video_id}`,
				{ position: position },
				{ headers: { "x-user-id": userId } }
			);
		} catch (error) {
			console.error(
				`Unable to update the position of video with id ${video_id}: ${error}`
			);
		}
	}

	function handleDragStart(event: DragStartEvent) {
		const { active } = event;
		setActiveId(active.id);
	}

	function getVideoPosition(videoId: UniqueIdentifier) {
		return videos.findIndex((video) => video.id === videoId);
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const originalPos = getVideoPosition(active.id);
			const newPos = getVideoPosition(over.id);
			const newVideos = arrayMove(videos, originalPos, newPos);
			setVideos(newVideos);

			const currVideo = videos[originalPos];
			updateVideoPosition(newPos + 1, currVideo.id);
		}

		setActiveId(undefined);
	}

	function handleDragCancel() {
		setActiveId(undefined);
	}

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const announcements = {
		onDragStart({ active }: Arguments) {
			return `Picked up the ${
				active.data.current?.video.title
			} video. The Video is in position ${getVideoPosition(active.id) + 1} of ${
				videos.length
			}`;
		},
		onDragOver({ active, over }: Arguments) {
			if (over && over.id !== active.id) {
				return `The ${
					active.data.current?.video.title
				} video was moved into position ${getVideoPosition(over.id) + 1} of ${
					videos.length
				}`;
			}
		},
		onDragEnd({ active, over }: Arguments) {
			if (over && active.id !== over.id) {
				return `The ${
					active.data.current?.video.title
				} video was dropped at position ${getVideoPosition(over.id) + 1} of ${
					videos.length
				}`;
			}
		},
		onDragCancel({ active }: Arguments) {
			return `Dragging was cancelled. The ${active.data.current?.video.title} video was dropped.`;
		},
	};

	const screenReaderInstructions = `To pick up a video item, press space or enter.
    Use the up and down arrow keys to update the position of the video in the playlist.
    Press space or enter again to drop the item in its new position, or press escape to cancel.`;

	return (
		<div className={styles.playlist}>
			<h2 className={styles.videoListTitle}>
				Playing {activeVideoPosition} of {videos.length}
			</h2>
			<DndContext
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				onDragCancel={handleDragCancel}
				collisionDetection={closestCorners}
				accessibility={{
					announcements,
					screenReaderInstructions: { draggable: screenReaderInstructions },
				}}
				sensors={sensors}
			>
				<ul className={styles.videoList} role="list">
					<SortableContext
						items={videos}
						strategy={verticalListSortingStrategy}
					>
						{videos.map((video) => (
							<SortablePlaylistPlayerVideo
								key={video.id}
								video={video}
								activeId={activeId}
								activeVideo={activeVideo}
								handleVideoClick={handleVideoClick}
								videos={videos}
								handleBookmark={handleBookmark}
								savedVideos={savedVideos}
							/>
						))}
					</SortableContext>
				</ul>
			</DndContext>
		</div>
	);
}
