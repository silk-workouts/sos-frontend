"use client";
import boxingGif from "/public/assets/gifs/boxing.gif";
import coreCrusherGif from "/public/assets/gifs/core-crushers.gif";
import isometricsGif from "/public/assets/gifs/isometrics.gif";
import jumpRopeGif from "/public/assets/gifs/jump-rope.gif";
import lowerBandsGif from "/public/assets/gifs/lowerbands.gif";
import upperBandsGif from "/public/assets/gifs/upperbands.gif";
import jumpRope from "/public/assets/images/jumpRopeShop.png";
import ElementCard from "@/components/pages/theWorkout/ElementCard/ElementCard";
import InstructionCard from "@/components/pages/theWorkout/InstructionCard/InstructionCard";
import EquipmentCard from "@/components/pages/theWorkout/EquipmentCard/EquipmentCard";
import Button from "@/components/ui/Button/Button";
import styles from "./page.module.scss";

export default function TheWorkout() {
	const handleOpenShop = () => {
		window.open(`https://shop.systemofsilk.com/`, "_blank");
	};

	return (
		<>
			<div className={styles.hero}>
				<h1 className={styles.hero__title}>The Workout</h1>
			</div>
			<div className={`body2 ${styles.container}`}>
				<section className={styles.element}>
					<div>
						<h2 className={`h2-title ${styles.element__title}`}>
							The <span className="bold">Elements</span>
						</h2>
						<p className={styles.content}>
							Your workout is a formula, and each element is a key ingredient.
							With six elements—Boxing, Jump Rope, Core Crushers, Lower Body
							Bands, Upper Body Bands, and Isometrics—you have 15 videos per
							category to mix, match, or master.
						</p>

						<p className={styles.content}>
							Build your perfect workout by combining elements or honing in on
							one at a time.
						</p>
					</div>
					<div className={styles.elementCards}>
						<ElementCard
							element="Boxing"
							content="My brand of boxing is different. It&#39;s brainfood. It&#39;s convenient, efficient and effective. Its getting fit without getting hit. "
							imageSrc={boxingGif}
							imageAlt="A picture of Michael doing the boxing workout"
						/>
						<ElementCard
							element="Jump Rope"
							content="My brand of boxing is different. It&#39;s brainfood. It&#39;s convenient, efficient and effective. Its getting fit without getting hit."
							imageSrc={jumpRopeGif}
							imageAlt="A picture of Michael doing the jump rope workout"
							alternate={true}
						/>
						<ElementCard
							element="Core Crushers"
							content="My brand of boxing is different. It&#39;s brainfood. It&#39;s convenient, efficient and effective. Its getting fit without getting hit."
							imageSrc={coreCrusherGif}
							imageAlt="A picture of Michael doing the core crushers workout"
						/>
						<ElementCard
							element="Upper Body Bands"
							content="My brand of boxing is different. It&#39;s brainfood. It&#39;s convenient, efficient and effective. Its getting fit without getting hit."
							imageSrc={upperBandsGif}
							imageAlt="A picture of Michael doing the upper bands workout"
							alternate={true}
						/>
						<ElementCard
							element="Lower Body Bands"
							content="My brand of boxing is different. It&#39;s brainfood. It&#39;s convenient, efficient and effective. Its getting fit without getting hit."
							imageSrc={lowerBandsGif}
							imageAlt="A picture of Michael doing the lower bands workout"
						/>
						<ElementCard
							element="Isometric"
							content="My brand of boxing is different. It&#39;s brainfood. It&#39;s convenient, efficient and effective. Its getting fit without getting hit."
							imageSrc={isometricsGif}
							imageAlt="A picture of Michael doing the isometric workout"
							alternate={true}
						/>
					</div>
				</section>
				<section className={styles.buildWorkout}>
					<div>
						<h2 className="h2-title">
							<span className="bold">Create</span> Your Workout
						</h2>
						<p>
							System of Silk is uniquely designed to fit your specific fitness
							goals.{" "}
						</p>
					</div>
					<div className={styles.instructions}>
						<InstructionCard
							number="1"
							title="browse"
							content="Explore each individual element or check out Michael&#39;s curated Prescription Programs."
						/>
						<InstructionCard
							number="2"
							title="build"
							content="Add videos to your custom playlist, or play them instantly for a focused workout."
						/>
						<InstructionCard
							number="3"
							title="watch"
							content="Select a custom playlist or pre-made program and seamlessly watch videos back to back."
						/>
						<InstructionCard
							number="4"
							title="repeat"
							content="Access your custom playlists and saved programs in the library to edit and master!"
						/>
					</div>
				</section>
				<section className={styles.equipment}>
					<div>
						<h2 className={`h2-title ${styles.equipment__title}`}>
							<span className="bold">Recommended</span> Equipment
						</h2>
						<p>
							All of the exercises within this System of Silk can be done
							without any equipment whatsoever. In fact, I highly recommend
							allowing your body to adapt to this new way of working out,
							without any of the tools: Rope, bands or weights.
						</p>
						<Button
							onClick={handleOpenShop}
							className={styles.equipment__button}
						>
							view shop
						</Button>
					</div>
					<div className={styles.equipments}>
						<EquipmentCard
							link="https://shop.systemofsilk.com/"
							title="handweights"
							content="Can be used in various different exercises and easy to adapt."
							imageSrc={jumpRope}
							imageAlt="A picture with two jump ropes"
						/>
						<EquipmentCard
							link="https://shop.systemofsilk.com/"
							title="Jump Rope"
							content="Can be used in various different exercises and easy to adapt."
							imageSrc={jumpRope}
							imageAlt="A picture with two jump ropes"
						/>
						<EquipmentCard
							link="https://shop.systemofsilk.com/"
							title="bands"
							content="Can be used in various different exercises and easy to adapt."
							imageSrc={jumpRope}
							imageAlt="A picture with two jump ropes"
						/>
					</div>
				</section>
			</div>
		</>
	);
}
