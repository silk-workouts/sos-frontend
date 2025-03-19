import Image from "next/image";
import bookmarkIcon from "/public/assets/icons/bookmark.svg";
import grabIcon from "/public/assets/icons/grab.svg";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from "@dnd-kit/core";
import { PlaylistVideo } from "src/app/(dashboard)/dashboard/library/[playlist_id]/page";
import styles from "./SortableVideoCard.module.scss";

interface VideoCardProps {
	video: PlaylistVideo;
	activeId: UniqueIdentifier | undefined;
	handleDelete: (arg1: number) => void;
}

export default function SortableVideoCard({
	video,
	activeId,
	handleDelete,
}: VideoCardProps) {
	const { listeners, setNodeRef, setActivatorNodeRef, transform, transition } =
		useSortable({ id: video.id, data: { video } });

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	};

	return (
		<li ref={setNodeRef} style={style} role="listitem">
			<article
				className={`${styles.card} ${
					activeId === video.id ? styles["card--active"] : ""
				}`}
			>
				<button
					aria-label="Grab to reorder video in playlist"
					className={`${styles.card__button} ${styles["card__button--grab"]}`}
					ref={setActivatorNodeRef}
					{...listeners}
				>
					<Image src={grabIcon} alt="" aria-hidden="true" />
				</button>

				<div className={styles.card__header}>
					<h3 className={styles.card__title}>{video.title}</h3>
					<Image
						src={video.thumbnail_url}
						className={styles.card__thumbnail}
						alt={`A thumbnail image for the ${video.title} workout`}
						width={135}
						height={117}
					/>
				</div>

				<button
					aria-label="Remove video from playlist"
					className={styles.card__button}
					onClick={() => {
						handleDelete(video.id);
					}}
				>
					<Image src={bookmarkIcon} alt="" aria-hidden="true" />
				</button>
			</article>
		</li>
	);
}
