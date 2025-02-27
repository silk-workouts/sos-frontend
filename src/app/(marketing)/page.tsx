import styles from "./page.module.scss";
import HomeElements from "@/components/pages/homepage/HomeElements/HomeElements";
import HomeHero from "@/components/pages/homepage/HomeHero/HomeHero";
import Philosophy from "@/components/pages/homepage/Philosophy/Philosophy";
import About from "@/components/pages/homepage/About/About";
import GetStarted from "@/components/pages/homepage/GetStarted/GetStarted";
import WhatsSOS from "@/components/pages/homepage/WhatsSOS/WhatsSOS";

export default function Home() {
  return (
    <>
      <HomeHero />
      <Philosophy />

      <About />
      <WhatsSOS />
      <HomeElements />
      <GetStarted />
    </>
  );
}
