"use client";
import boxingGif from "/public/assets/gifs/boxing.gif";
import coreCrusherGif from "/public/assets/gifs/core-crushers.gif";
import isometricsGif from "/public/assets/gifs/isometrics.gif";
import jumpRopeGif from "/public/assets/gifs/jump-rope.gif";
import lowerBandsGif from "/public/assets/gifs/lowerbands.gif";
import upperBandsGif from "/public/assets/gifs/upperbands.gif";
import step1Gif from "/public/assets/gifs/the-workout-step-1.gif";
import step2Gif from "/public/assets/gifs/the-workout-step-2.gif";
import step3Gif from "/public/assets/gifs/the-workout-step-3.gif";
import step4Gif from "/public/assets/gifs/the-workout-step-4.gif";
import jumpRope from "/public/assets/images/jumpropes-for-sale.png";
import bands from "/public/assets/images/bands-for-sale.png";
import ElementCard from "@/components/pages/theWorkout/ElementCard/ElementCard";
import InstructionCard from "@/components/pages/theWorkout/InstructionCard/InstructionCard";
import EquipmentCard from "@/components/pages/theWorkout/EquipmentCard/EquipmentCard";
import Button from "@/components/ui/Button/Button";
import styles from "./page.module.scss";
import { BADHINTS } from "node:dns/promises";

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
          <div className={styles["element-wrapper"]}>
            <div>
              <h2 className={`h2-title-white ${styles.element__title}`}>
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
                content="Boxing redefined—build strength, endurance, and precision without impact. Train footwork, power, and coordination. Get fit without getting hit."
                imageSrc={boxingGif}
                imageAlt="A picture of Michael doing the boxing workout"
              />
              <ElementCard
                element="Jump Rope"
                content="High-intensity cardio that burns fat, boosts endurance, and sharpens coordination. Every jump builds speed, agility, and confidence—before you fly, you jump."
                imageSrc={jumpRopeGif}
                imageAlt="A picture of Michael doing the jump rope workout"
              />
              <ElementCard
                element="Core Crushers"
                content="Boxing-inspired core training that strengthens balance, power, and agility. Every movement builds rotational strength and stability for a rock-solid foundation."
                imageSrc={coreCrusherGif}
                imageAlt="A picture of Michael doing the core crushers workout"
              />
              <ElementCard
                element="Upper Body Bands"
                content="Resistance training for powerful, enduring arms, shoulders, and back. Build strength, control, and NGT: Never Get Tired. Train like a fighter."
                imageSrc={upperBandsGif}
                imageAlt="A picture of Michael doing the upper bands workout"
              />
              <ElementCard
                element="Lower Body Bands"
                content="Sculpt strong, lean legs with resistance drills that improve footwork, speed, and explosiveness. Strengthen glutes, quads, and hip flexors efficiently."
                imageSrc={lowerBandsGif}
                imageAlt="A picture of Michael doing the lower bands workout"
              />
              <ElementCard
                element="Isometric"
                content="Master control and endurance with deep, stabilizing holds. Strengthen joints, sharpen focus, and push past limits—true strength is in stillness."
                imageSrc={isometricsGif}
                imageAlt="A picture of Michael doing the isometric workout"
              />
            </div>
          </div>
        </section>
        <section className={styles.buildWorkout}>
          <div className={styles["buildWorkout-wrapper"]}>
            <div>
              <h2 className="h2-title">
                <span className="bold">Create</span> Your Workout
              </h2>
              <p className={styles.buildWorkout__tagline}>
                System of Silk is uniquely designed to fit your specific fitness
                goals.{" "}
              </p>
            </div>
            <div className={styles.instructions}>
              <InstructionCard
                number="1"
                title="browse"
                content="Explore each individual element or check out Michael&#39;s curated Prescription Programs."
                imageSrc={step1Gif}
                imageAlt="gif showing how to browse programs and videos"
              />
              <InstructionCard
                number="2"
                title="build"
                content="Add videos to your custom playlist, or play them instantly for a focused workout."
                imageSrc={step2Gif}
                imageAlt="gif showing how to add videos to custom playlist"
              />
              <InstructionCard
                number="3"
                title="watch"
                content="Select a custom playlist or pre-made program and seamlessly watch videos back to back."
                imageSrc={step3Gif}
                imageAlt="gif showing how to watch or select a custom playlist"
              />
              <InstructionCard
                number="4"
                title="repeat"
                content="Access your custom playlists and saved programs in the library to edit and master!"
                imageSrc={step4Gif}
                imageAlt="gif showing how access customs playlists and saved programs"
              />
            </div>
          </div>
        </section>
        <section className={styles.equipment}>
          <div className={styles["equipment-wrapper"]}>
            <div>
              <h2 className={`h2-title-white ${styles.equipment__title}`}>
                <span className="bold">Recommended</span> Equipment
              </h2>
              <p>
                All of the exercises within this System of Silk can be done
                without any equipment whatsoever. In fact, I highly recommend
                allowing your body to adapt to this new way of working out,
                without any of the tools: Rope, bands or weights.
              </p>
              <Button
                variant="tertiary"
                onClick={handleOpenShop}
                className={styles.equipment__button}
              >
                View shop
              </Button>
            </div>
            <div className={styles.equipments}>
              {/* <EquipmentCard
                link="https://shop.systemofsilk.com/"
                title="handweights"
                content="Can be used in various different exercises and easy to adapt."
                imageSrc={jumpRope}
                imageAlt="A picture with two jump ropes"
              /> */}
              <EquipmentCard
                link="https://shop.systemofsilk.com/"
                title="Jump Rope"
                content="Jump ropes created by a boxer, specifically for the boxer's workout. Sleekify by burning more calories jumping rope than any other exercise.  MOVE. BREATH. SWEAT"
                imageSrc={jumpRope}
                imageAlt="A picture with two jump ropes"
              />
              <EquipmentCard
                link="https://shop.systemofsilk.com/"
                title="bands"
                content="Ditch the machines. Strengthen your entire body with resistance bands—building sleek, powerful muscle through your natural range of motion. Stay energized. No bulk, all strength."
                imageSrc={bands}
                imageAlt="A picture with two jump ropes"
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
