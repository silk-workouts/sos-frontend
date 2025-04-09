"use client";

import React from "react";
import Button from "@/components/ui/Button/Button";
import { useRouter } from "next/navigation"; // For navigation
import Logo from "public/assets/images/logo.png";
import Image from "next/image";

import styles from "./HomeHero.module.scss";

export default function HomeHero() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push("/auth/signup");
  };

  return (
    <section className={styles.hero}>
      <video
        className={styles.hero__video}
        src="/assets/videos/homepage-hero.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className={styles.hero__overlay}>
        <div>
          <h1 className={`homehero_title ${styles.hero__title}`}>
            System of Silk
          </h1>
        </div>
        <Image src={Logo} alt="Logo" />
        <Button onClick={handleNavigate} className={styles.hero__button}>
          Start 30-day free trial
        </Button>
      </div>
    </section>
  );
}
