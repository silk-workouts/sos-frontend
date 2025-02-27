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
      <div className={styles.hero__overlay}>
        <div>
          <h1 className={`homehero_title ${styles.hero__title}`}>
            System of Silk
          </h1>
          <h2 className={`homehero_subtitle ${styles.hero__subheader}`}>
            Fitness
          </h2>
        </div>
        <Image src={Logo} alt="Logo" />
        <Button variant="primary" onClick={handleNavigate}>
          Start 7-day free trial
        </Button>
      </div>
    </section>
  );
}
