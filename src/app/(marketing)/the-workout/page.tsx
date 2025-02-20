"use client";
import Image, { StaticImageData } from "next/image";
import upperBandsImage from "/public/assets/images/upperBands.jpg";
import ElementCard from "@/components/pages/theWorkout/ElementCard/ElementCard";
import Button from "@/components/ui/Button/Button";
import styles from "./page.module.scss";

export default function TheWorkout() {
	return (
		<>
			<div className={styles.hero}>
				<h1 className={styles.hero__title}>The Workout</h1>
			</div>
			<div className={`body2 ${styles.container}`}>
				<section className={styles.element}>
					<div>
						<h2 className="h2-title">
							<span className="bold">The</span> Elements
						</h2>
						<p className={styles.content}>
							If your workout playlist is a formula, the elements are the videos
							that make up that formula. There are currently six different types
							of elements - Boxing, Jump Rope, Core Crushers, Lower Body bands,
							Upper Body bands, and Isometrics. Each element type has 15
							variations, or 15 videos.
						</p>
						<p className={styles.content}>
							Formulate your workouts by combining various elements, or focus on
							one at a time!
						</p>
					</div>
					<div className={styles.elementCards}>
						<ElementCard
							element={{ number: "1", letter: "B", name: "Boxing" }}
							content="My brand of boxing is different. It&#39;s brainfood. It&#39;s convenient, efficient and effective. Its getting fit without getting hit."
							imageSrc={upperBandsImage}
							imageAlt="A picture of Michael doing the boxing workout"
						/>
						<ElementCard
							element={{ number: "2", letter: "Jr", name: "Jump Rope" }}
							content="My brand of boxing is different. It&#39;s brainfood. It&#39;s convenient, efficient and effective. Its getting fit without getting hit."
							imageSrc={upperBandsImage}
							imageAlt="A picture of Michael doing the jump rope workout"
							alternate={true}
						/>
						<ElementCard
							element={{ number: "3", letter: "Cc", name: "Core Crushers" }}
							content="My brand of boxing is different. It&#39;s brainfood. It&#39;s convenient, efficient and effective. Its getting fit without getting hit."
							imageSrc={upperBandsImage}
							imageAlt="A picture of Michael doing the core crushers workout"
						/>
						<ElementCard
							element={{ number: "4", letter: "Ubb", name: "Upper Body Bands" }}
							content="My brand of boxing is different. It&#39;s brainfood. It&#39;s convenient, efficient and effective. Its getting fit without getting hit."
							imageSrc={upperBandsImage}
							imageAlt="A picture of Michael doing the upper bands workout"
							alternate={true}
						/>
						<ElementCard
							element={{ number: "5", letter: "Lbb", name: "Lower Body Bands" }}
							content="My brand of boxing is different. It&#39;s brainfood. It&#39;s convenient, efficient and effective. Its getting fit without getting hit."
							imageSrc={upperBandsImage}
							imageAlt="A picture of Michael doing the lower bands workout"
						/>
						<ElementCard
							element={{ number: "6", letter: "I", name: "Isometric" }}
							content="My brand of boxing is different. It&#39;s brainfood. It&#39;s convenient, efficient and effective. Its getting fit without getting hit."
							imageSrc={upperBandsImage}
							imageAlt="A picture of Michael doing the isometric workout"
							alternate={true}
						/>
					</div>
				</section>
				<section className={styles.buildWorkout}>
					<div>
						<h2 className="h2-title">
							<span className="bold">Building</span> Your Formula
						</h2>
						<p>
							System of Silk is uniquely designed to fit your specific fitness
							goals.{" "}
						</p>
					</div>
					<div>
						<InstructionCard
							number="1"
							title="browse"
							content="Explore each individual element or check out Michael&#39;s curated Prescription Programs."
						/>
					</div>
				</section>
				<section>
					<h2>recommended equipment</h2>
					<p>
						All of the exercises within this System of Sleek can be done without
						any equipment whatsoever. In fact, I highly recommend allowing your
						body to adapt to this new way of working out, without any of the
						tools: Rope, bands or weights.
					</p>
					<div>
						<EquipmentCard
							link=""
							title=""
							content=""
							imageSrc={upperBandsImage}
							imageAlt=""
						/>
					</div>
				</section>
			</div>
		</>
	);
}

interface InstructionInfo {
	number: string;
	title: string;
	content: string;
	// imageSrc: StaticImageData;
	// imageAlt: string;
}

function InstructionCard({
	number,
	title,
	content,
}: // imageSrc,
// imageAlt,
InstructionInfo) {
	return (
		<article>
			<h3>step {number}</h3>
			<h4>{title}</h4>
			<p>{content}</p>
			{/* <Image src={imageSrc} alt={imageAlt} /> */}
			<div></div>
		</article>
	);
}

interface EquipmentInfo {
	imageSrc: StaticImageData;
	imageAlt: string;
	title: string;
	content: string;
	link: string;
}

function EquipmentCard({
	link,
	title,
	content,
	imageSrc,
	imageAlt,
}: EquipmentInfo) {
	const handleOpenShop = () => {
		window.open(`${link}`, "_blank");
	};
	return (
		<article>
			<Image src={imageSrc} alt={imageAlt} />
			<h3>{title}</h3>
			<p>{content}</p>
			<Button onClick={handleOpenShop}>shop</Button>
		</article>
	);
}
