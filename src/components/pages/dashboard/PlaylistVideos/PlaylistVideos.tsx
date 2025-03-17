import Image from "next/image";
import bookmarkIcon from "/public/assets/icons/bookmark.svg";
import grabIcon from "/public/assets/icons/grab.svg";
import {
	closestCorners,
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
	arrayMove,
	sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PlaylistVideo } from "src/app/(dashboard)/dashboard/library/[playlist_id]/page";
import styles from "./PlaylistVideos.module.scss";
import axios from "axios";

interface PlaylistVideosProps {
	videos: PlaylistVideo[];
	setVideos: (arg1: PlaylistVideo[]) => void;
	handleDelete: (arg1: number) => void;
	playlist_id: string;
	userId: string;
}

export default function PlaylistVideos({
	videos,
	setVideos,
	handleDelete,
	playlist_id,
	userId,
}: PlaylistVideosProps) {
	async function updateVideoPosition(position, video_id) {
		try {
			const response = await axios.patch(
				`/api/playlists/${playlist_id}/videos/${video_id}`,
				{ position: position },
				{ headers: { "x-user-id": userId } }
			);

			console.log(response);
		} catch (error) {
			console.error(
				`Unable to update the position of video with id ${video_id}: ${error}`
			);
		}
	}
	function getVideoPosition(videoId) {
		return videos.findIndex((video) => video.id === videoId);
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (active.id === over.id) {
			return;
		}

		const originalPos = getVideoPosition(active.id);
		const newPos = getVideoPosition(over?.id);
		setVideos((videos) => arrayMove(videos, originalPos, newPos));

		const activeVideo = videos[originalPos];
		updateVideoPosition(newPos + 1, activeVideo.id);
	}

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	return (
		<section className={styles.videos}>
			<DndContext
				onDragEnd={handleDragEnd}
				collisionDetection={closestCorners}
				sensors={sensors}
			>
				{/*try closest center*/}
				<ul role="list" className={styles.videos__list}>
					<SortableContext
						items={videos}
						strategy={verticalListSortingStrategy}
					>
						{videos.map((video) => {
							return (
								<VideoCard
									key={video.id}
									video={video}
									handleDelete={handleDelete}
								/>
							);
						})}
					</SortableContext>
				</ul>
			</DndContext>
		</section>
	);
}

interface VideoCardProps {
	video: PlaylistVideo;
	handleDelete: (arg1: number) => void;
}

function VideoCard({ video, handleDelete }: VideoCardProps) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({
			id: video.id,
			data: { title: video.title, position: video.position, id: video.id },
		});

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	};

	return (
		<li
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			style={style}
			className={styles.list__item}
		>
			<article className={styles.card}>
				<header className={styles.card__header}>
					<h3 className={styles.card__title}>{video.title}</h3>
					<button
						aria-label="Remove video from playlist"
						className={styles.card__button}
						onClick={() => {
							handleDelete(video.id);
						}}
					>
						<Image src={bookmarkIcon} alt="" />
					</button>
				</header>
				<Image
					src={video.thumbnail_url}
					className={styles.card__thumbnail}
					alt={`A thumbnail image for the ${video.title} workout`}
					width={135}
					height={117}
				/>
				<button
					aria-label="Grab to rearrange video order"
					className={`${styles.card__button} ${styles["card__button--grab"]}`}
				>
					<Image src={grabIcon} alt="" />
				</button>
			</article>
		</li>
	);
}
