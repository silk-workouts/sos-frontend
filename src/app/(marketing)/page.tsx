import HomeElements from "@/components/pages/homepage/HomeElements/HomeElements";
import HomeHero from "@/components/pages/homepage/HomeHero/HomeHero";
import Philosophy from "@/components/pages/homepage/Philosophy/Philosophy";
import About from "@/components/pages/homepage/About/About";
import GetStarted from "@/components/pages/homepage/GetStarted/GetStarted";
import WhatsSOS from "@/components/pages/homepage/WhatsSOS/WhatsSOS";
import Testimonials from "@/components/pages/homepage/Testimonials/Testimonials";

export default function Home() {
	return (
		<>
			<HomeHero />
			<Philosophy />

			<About />
			<WhatsSOS />
			<HomeElements />
			<Testimonials />
			<GetStarted />
		</>
	);
}
