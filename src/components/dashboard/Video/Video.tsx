import Image from 'next/image';
import kebabIcon from '/public/assets/icons/kebab.svg';
import Link from 'next/link';
import { ShowcaseVideo } from '../VideoList/VideoList';
import styles from './Video.module.scss';

interface VideoProps {
  showcaseVideo: ShowcaseVideo;
  display: string;
  isModalOpen: boolean;
  setIsModalOpen: (arg1: boolean) => void;
  path: string;
}

export default function Video({
  showcaseVideo,
  display,
  isModalOpen,
  setIsModalOpen,
  path,
}: VideoProps) {
  return (
    <article
      className={`${styles.card} ${
        display === 'row' ? styles['card--row'] : ''
      }`}
    >
      <Link href={`${path}`}>
        <Image
          src={showcaseVideo.thumbnail_url}
          className={styles.thumbnail}
          alt={`A thumbnail image for the ${showcaseVideo.title} workout`}
          width={132}
          height={74}
        />
      </Link>
      <div
        className={`${styles.header} ${
          display === 'row' ? styles['header--row'] : ''
        }`}
      >
        <h3 className={styles.title}>
          <Link href={`${path}/${showcaseVideo.vimeo_video_id}`}>
            {showcaseVideo.title.toLowerCase()}{' '}
          </Link>
        </h3>

        <button
          className={styles.menuButton}
          onClick={() => setIsModalOpen(!isModalOpen)}
        >
          <Image src={kebabIcon} alt="A kebab menu icon" />
        </button>
      </div>
    </article>
  );
}
