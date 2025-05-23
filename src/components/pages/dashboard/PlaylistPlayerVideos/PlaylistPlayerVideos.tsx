import axios from "axios";
import { useEffect, useRef, useState } from "react";
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
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Arguments } from "@dnd-kit/core/dist/components/Accessibility/types";
import { PlayerVideo } from "src/app/(dashboard)/dashboard/playlistplayer/[playlist_id]/page";
import SortablePlaylistPlayerVideo from "../SortablePlaylistPlayerVideo/SortablePlaylistPlayerVideo";
import styles from "./PlaylistPlayerVideos.module.scss";

interface PlaylistPlayerVideosProps {
	videos: PlayerVideo[];
	handleVideoClick: (arg1: PlayerVideo) => Promise<void>;
	activeVideo: PlayerVideo;
	activeVideoPosition: number;
	playlist_id: string;
	userId: string;
	setVideos: (arg1: PlayerVideo[]) => void;
	updateVideoOrder: (newOrder: PlayerVideo[]) => void;
}

export default function PlaylistPlayerVideos({
	videos,
	handleVideoClick,
	activeVideo,
	activeVideoPosition,
	playlist_id,
	userId,
	setVideos,
	updateVideoOrder,
}: PlaylistPlayerVideosProps) {
	const [activeId, setActiveId] = useState<UniqueIdentifier | undefined>(
		undefined
	);
	const scrollableContainerRef = useRef<HTMLUListElement | null>(null);
	const [isDesktop, setIsDesktop] = useState(false);

	//Check if the screen is a desktop
	useEffect(() => {
		const checkScreenSize = () => {
			setIsDesktop(window.innerWidth >= 1280);
		};

		checkScreenSize();

		window.addEventListener("resize", checkScreenSize);

		return () => window.removeEventListener("resize", checkScreenSize);
	}, []);

	//Enables auto scrolling for activeVideo to make sure it is always in view
	useEffect(() => {
		if (isDesktop && activeVideo && scrollableContainerRef.current) {
			const currVideo = Array.from(
				scrollableContainerRef.current.children
			).find((item) => item.className.includes("active"));

			currVideo?.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}, [activeVideo, isDesktop]);

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

			// Call the update order function from VideoPlayer
			updateVideoOrder(newVideos);

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
		<section className={styles.playlist}>
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
				<ul
					className={styles.videoList}
					role="list"
					ref={scrollableContainerRef}
				>
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
							/>
						))}
					</SortableContext>
				</ul>
			</DndContext>
		</section>
	);
}
