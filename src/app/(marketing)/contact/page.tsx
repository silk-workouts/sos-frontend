"use client";
import PageTitleHeader from "@/components/ui/PageTitleHeader/PageTitleHeader";
import Button from "@/components/ui/Button/Button";
import Accordion from "@/components/pages/contact/Accordion/Accordion";
import styles from "./page.module.scss";

export default function Contact() {
  return (
    <>
      <PageTitleHeader title="support" subHeading="how can we help?" />
      <div className={`body2 ${styles.body}`}>
        <div className={styles.wrapper}>
          <h2 className="h2-title">
            <span className="bold">Frequently</span> Asked Questions
          </h2>
          <div id="accordionGroup" className={styles.accordionGroup}>
            <section>
              <h3 className={styles.accordionGroup__accordionHeader}>
                THE WORKOUT
              </h3>
              <Accordion
                title="I’VE NEVER DONE BOXING ORIENTED WORKOUTS BEFORE...WHAT’S THE BEST PLACE TO START?"
                content="Depends what you’re looking for, but boxing boxing will give you the highest returns on your effort, cuz no matter what, you’re boxing. But other than that, the Core Crushers are a nice introduction into my customized and original form of movement… Followed by upper and lower body band work. The isometric work develops still strength."
                position="1"
              />
              <Accordion
                title="CAN I CUSTOMIZE MY OWN WORKOUTS?"
                content="There is no other online workout that gives you the ability to create the type of workout you want to do, AND the length of time you want to workout for. That’s as ground breaking as this exercise. Yes. If you only have 2 minutes to workout, I’ve got something for you…. If you’re looking to do a marathon workout, (3/4/5 hours) I can accommodate for that as well. "
                position="2"
              />
              <Accordion
                title="CAN I START STYSTEM OF SILK IF I HAVEN'T WORKED OUT IN A WHILE?"
                content="Of course. System of Silk is geared toward ALL fitness and everyone is free and encouraged to go at their own pace. We recommend trying a free* introductory workout, then discussing any thoughts or questions you may have regarding our fitness goals, with your coach."
                position="3"
              />
              <Accordion
                title="WHEN WILL I SEE THE BENEFITS OF THIS WORKOUT?"
                content="Provided you do it every day, you will feel the benefits deep and immediately…Change starts at your core and radiates outward. With a balanced nutritional plan you will start to see change within 2 weeks."
                position="4"
              />
              <Accordion
                title="CAN THIS WORKOUT BE DONE INDOORS?"
                content="Yes… If you live in an apartment above someone you may not want to jump rope on a Sunday morning. But other than that, this methodology is one of, if not THE most effective cardiovascular based muscle endurance workouts you can get in the comfort of your home or apartment."
                position="5"
              />
              <Accordion
                title="WHAT SURFACE IS BEST TO JUMP ON?"
                content="You want a surface that has a little give. Natural wood, or sprung wood floor/court. Avoid cement, tile and marble surfaces. There are jump matts you can buy that will make the process less damaging to the feet"
                position="6"
              />
              <Accordion
                title="HOW MUCH SPACE DO I NEED? "
                content="For jump rope a 6’ circumference and 10’ height clearance."
                position="7"
              />

              <Accordion
                title="WHAT IS MUSCLE ENDURANCE?"
                content="Endurance is one of the major attributes, along with intensity and time, that will allow your body to adapt to the demands of the workouts and the more you can endure the closer you are to reaching your goal. The faster you will get there."
                position="8"
              />
              <Accordion
                title="IS JUMP ROPE GOOD FOR ME?"
                content="Yes, it’s a full body workout.You have to run for 30 minutes to equal the benefits of a 10 minute jump rope workout. It increases endurance,  and burns a lot of calories in a very short period of time. It also improves cardio health. It strengthens focus and coordination and is the perfect warm up for any sport; from tennis and running, to dancing and gymnastics. Mentally, it gives a strong sense of accomplishment when you master a move. physically, it strengthens bones throughout the lower body, and builds a leaner tone through the upper body."
                position="9"
              />
              <Accordion
                title="WHAT ARE THE BENEFITS OF SHADOW BOXING?"
                content="Shadow Boxing is the most convenient, efficient and effective exercise for muscle tone, cardio vascular benefits and strengthening your focus. Shadow boxing improves cardio using the upper body, unlike many any other exercises. It also strenghens your legs, abs and core, so Shadow Boxing tones muscle all over your body. It Enhances dexterity, improves coordination, and it sharpens your mind Gives you long lean arms."
                position="10"
              />
              <Accordion
                title="WHAT’S THE DEAL WITH CORE CRUSHERS"
                content="It all started with Michael’s “leave the machines behind” philosophy on fitness More effective than a crunch is a “standing ab work”. The more he thought about fitness and sports performance, the more he saw that movement, foundation, balance, explosiveness, agility, originates in the core. People generally believe the feet to be the foundation of your body when in reality, the core is the origin of your body’s movement. And, the best way to enhance the core muscles and build a sleek/strong midsection that will power you through life, is to move the core in ways it is meant to move naturally - along with the element of speed and weight/resistance."
                position="11"
              />
            </section>
            <section>
              <h3 className={styles.accordionGroup__accordionHeader}>
                THE GEAR
              </h3>
              <Accordion
                title="WHAT IS THE BEST JUMP ROPE FOR ME?"
                content="Either a leather rope with wooden handles or “The Blizzard” or “Rainmaker” jump ropes. This rope is specifically created by a boxer for the boxers workout. Substantial handles with a little weight in them are also great. It makes jumping rope easier to learn. It burns more calories and tones and strengthens muscles simultaneously."
                position="12"
              />
              <Accordion
                title="WHAT SIZE HAND WEIGHTS SHOULD I USE?"
                content="Lightweight: (147lbs and down) 1-3lb handweights Middleweight: (148lbs -175lbs) 3-5lb handweights Heavyweight (176-and up) 5-8lb handweights Even if you are heavyweight or middleweight, I strongly suggest you start with one pound or even no weights at all, in order for your body to adjust to the demands."
                position="13"
              />
              <Accordion
                title="WHY DO YOU USE BANDS?"
                content="The Bands effect change to your body so much faster than without. You will grow stronger because given there is resistance to all movement you burn more calories and develop stronger, leaner firmer muscles in the areas you want to see. "
                position="14"
              />
              <Accordion
                title="WHAT KIND OF FOOTWEAR IS BEST"
                content="I haven’t tried everything, but of what I have tried, the Asics shoe is the best for the type of jump rope I teach."
                position="15"
              />
              <Accordion
                title="WHAT TYPE OF CLOTHING IS BEST?"
                content="Focusing on boxing, a tank top or something tighter is best . For the lower body work, shorts or leggings.For jump rope, something form fitting… If you’re learning to jump rope a heavier top (and leggings) saves your back and legs from getting whipped by the rope."
                position="16"
              />
            </section>
          </div>
          <div className={styles.contact}>
            <h3 className={`${styles.contact__title}`}>
              Still looking for answers?
            </h3>
            <a href="mailto:michaelolajidejr@gmail.com">
              <Button>Contact Us</Button>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
