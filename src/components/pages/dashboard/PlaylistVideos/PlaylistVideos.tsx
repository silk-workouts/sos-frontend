import Image from "next/image";
import bookmarkIcon from "/public/assets/icons/bookmark.svg";
import grabIcon from "/public/assets/icons/grab.svg";
import { PlaylistVideo } from "src/app/(dashboard)/dashboard/library/[playlist_id]/page";
import styles from "./PlaylistVideos.module.scss";

interface PlaylistVideosProps {
  videos: PlaylistVideo[];
  handleDelete: (arg1: number) => void;
}

export default function PlaylistVideos({
  videos,
  handleDelete,
}: PlaylistVideosProps) {
  return (
    <section className={styles.videos}>
      <ul role="list" className={styles.videos__list}>
        {videos.map((video) => {
          return (
            <li key={video.id}>
              <VideoCard video={video} handleDelete={handleDelete} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

interface VideoCardProps {
  video: PlaylistVideo;
  handleDelete: (arg1: number) => void;
}

function VideoCard({ video, handleDelete }: VideoCardProps) {
  return (
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
  );
}
