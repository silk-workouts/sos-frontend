"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button/Button";
import { useRouter } from "next/navigation"; // For navigation
import Logo from "public/assets/images/logo.png";
import playIcon from "public/assets/images/play-white-50px.png";
import pauseIcon from "public/assets/images/pause-white-50px.png";
import styles from "./HomeHero.module.scss";

export default function HomeHero() {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleNavigate = () => {
    router.push("/auth/signup");
  };

  return (
    <section className={styles.hero}>
      <button
        className={styles.hero__videoToggleButton}
        onClick={toggleVideoPlayback}
        aria-pressed={!isPlaying}
        aria-label={
          isPlaying ? "Pause background video" : "Play background video"
        }
      >
        {isPlaying ? (
          <Image src={pauseIcon} alt="Pause" />
        ) : (
          <Image src={playIcon} alt="Play" />
        )}
      </button>
      <video
        ref={videoRef}
        className={styles.hero__video}
        src="/assets/videos/homepage-hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-label="Background video of the System of Silk experience"
      />
      <div className={styles.hero__overlay}>
        <div>
          <h1 className={`homehero_title ${styles.hero__title}`}>
            System of Silk
          </h1>
        </div>
        <Image src={Logo} alt="Logo" />
        <Button variant="homeHero" onClick={handleNavigate}>
          Start 30-day free trial
        </Button>
      </div>
    </section>
  );
}
