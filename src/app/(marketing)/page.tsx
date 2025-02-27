import styles from "./page.module.scss";
import HomeElements from "@/components/pages/homepage/HomeElements/HomeElements";
import HomeHero from "@/components/pages/homepage/HomeHero/HomeHero";
import Philosophy from "@/components/pages/homepage/Philosophy/Philosophy";
import About from "@/components/pages/homepage/About/About";
import GetStarted from "@/components/pages/homepage/GetStarted/GetStarted";

export default function Home() {
	return (
		<>
			<HomeHero />
			<Philosophy />
			<HomeElements />
			{/* {/* <div className={styles.slogan}> */}
			<span className={styles.slogan__message}>
				100% Silk fitness is key. 100% Silk fitness is key. 100% Silk fitness is
				key. 100% Silk fitness is key. 100% Silk fitness is key.
			</span>
			<span
				className={`${styles.slogan__message} ${styles["slogan__message--bottom"]}`}
			>
				100% Silk fitness is key. 100% Silk fitness is key. 100% Silk fitness is
				key. 100% Silk fitness is key. 100% Silk fitness is key.
			</span>

			<About />
			<GetStarted />
		</>
	);
}
