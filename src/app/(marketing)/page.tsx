import { Metadata } from "next";
import HomeElements from "@/components/pages/homepage/HomeElements/HomeElements";
import HomeHero from "@/components/pages/homepage/HomeHero/HomeHero";
import Philosophy from "@/components/pages/homepage/Philosophy/Philosophy";
import About from "@/components/pages/homepage/About/About";
import GetStarted from "@/components/pages/homepage/GetStarted/GetStarted";
import WhatsSOS from "@/components/pages/homepage/WhatsSOS/WhatsSOS";
import Testimonials from "@/components/pages/homepage/Testimonials/Testimonials";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "System of Silk | The Original Boxing Fitness Experience",
  description:
    "Discover a new way to train. Led by Michael 'Silk' Olajide Jr., System of Silk combines boxing, core, isometrics, and more into sleek, high-performance workouts. No machines. All power.",
};

export default function Home() {
  return (
    <div className={styles.container}>
      <HomeHero />
      <Philosophy />
      <About />
      <WhatsSOS />
      <HomeElements />
      <Testimonials />
      <GetStarted />
    </div>
  );
}
