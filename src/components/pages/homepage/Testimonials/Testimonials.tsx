"use client";
import Image from "next/image";
import chevronIcon from "/public/assets/icons/chevron-left.svg";
import smallS from "/public/assets/images/small-S.png";
import { useEffect, useRef, useState } from "react";
import styles from "./Testimonials.module.scss";

const testimonials = [
  {
    id: 1,
    text: "System of Silk clears my head and tests my limits. It’s been a life-changer.",
    name: "Jeff P",
  },
  {
    id: 2,
    text: "The real magic is Michael himself. He pushes people to reach further and deeper, and does so in a way that you really feel he wants the best for you.",
    name: "Em",
  },
  {
    id: 3,
    text: "I’ve been training with Mike/the Silk methodology for 10 years, and From the first workout, I could tell this program was different. The workouts challenge me physically, mentally, and emotionally, and I’ve noticed the benefits in other areas of my life—more energy, better focus, and greater endurance overall. There is a learning curve, but it’s been well worth the effort.",
    name: "Danny",
  },
  {
    id: 4,
    text: "There’s nothing like Michael’s workouts in New York - or anywhere really. His constantly creative, highly effective programming pushes both body and mind in a way that no other HIIT, boot camp, or spin class ever will.",
    name: "Emily",
  },
  {
    id: 5,
    text: "In my 20+ years working with Michael, his spirit, his generosity, and his inspirational teaching has affected me profoundly. Not just in the athletic sense, but to spend time with his incredible, inspirational energy which is contagious to anyone working with him.",
    name: "Karen",
  },
  {
    id: 6,
    text: "The synergy between movement and mindfulness in this program is truly transformative. I feel stronger, more energized, and more in tune with myself than ever before. If you're looking for a fitness system that goes beyond traditional workouts—one that strengthens not just your body, but your mind and spirit—System of Silk is the perfect choice. This is more than exercise; it’s a lifestyle of empowerment, endurance, and self-mastery",
    name: "Leila Fazel",
  },
  {
    id: 7,
    text: "What I love about Michael’s workouts is that you accomplish so much from the intensity  of the movements during one hour resulting in benefits, it would normally take three or four hours of exercise to accomplish the same result. ",
    name: "Sam",
  },
  {
    id: 8,
    text: "The workouts require a high-level of skill, which you literally learn as you go.   My skill level when I started these workouts was extremely low and overtime, I was able to learn movements that I never thought I could do.  An example of this when I started, I could barely skip rope.  Now, I have mastered double turns and various tricks, allowing my cardio training to elevate to a standard what it was prior.",
    name: "Sarah",
  },
];

export default function Testimonials() {
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const [scrollAmount, setScrollAmount] = useState(100);
  const [scrollIsAtStart, setScrollIsAtStart] = useState(true);
  const [scrollIsAtEnd, setScrollIsAtEnd] = useState(false);

  function scroll(direction: "left" | "right") {
    scrollableContainerRef.current?.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }

  function checkScrollPosition() {
    if (!scrollableContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } =
      scrollableContainerRef.current;

    //Update whether state is at start or end to disable scrollbar buttons accordingly
    setScrollIsAtStart(scrollLeft === 0);
    setScrollIsAtEnd(scrollLeft + clientWidth >= scrollWidth);

    //set scroll amount relative to the width of the videos
    setScrollAmount(
      (scrollableContainerRef.current.children[0] as HTMLElement)
        ?.offsetWidth || clientWidth
    );
  }

  useEffect(() => {
    const container = scrollableContainerRef.current;

    if (!container) return;

    checkScrollPosition();

    container.addEventListener("scroll", checkScrollPosition);
    return () => container.removeEventListener("scroll", checkScrollPosition);
  }, [scrollableContainerRef.current]);

  const truncate = (str: string, max = 230) => {
    if (str.length <= max) return str;
    return str.slice(0, str.lastIndexOf(" ", max)) + "...";
  };

  return (
    <section className={styles.testimonialsSection}>
      <h2 className={`h2-title ${styles.testimonialsHeader}`}>
        <span className="bold">The</span> Testimonials
      </h2>
      <div className={styles.carousel} ref={scrollableContainerRef}>
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className={styles.testimonialCard}>
            <p className={styles.testimonialText}>
              {truncate(testimonial.text)}
            </p>
            <div className={styles.testimonialAuthor}>
              <Image
                className={styles.testimonialImg}
                src={smallS}
                alt="small S for Silk icon"
              />
              <p>{testimonial.name}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.scrollbar}>
        <button
          className={`${styles.scrollbar__button} ${
            scrollIsAtStart ? styles["scrollbar__button--disabled"] : ""
          }`}
          aria-controls="scroll-area"
          onClick={() => scroll("left")}
          disabled={scrollIsAtStart}
          aria-label="Click to view previous videos"
        >
          <Image
            src={chevronIcon}
            aria-hidden="true"
            alt=""
            className={styles.scrollbar__icon}
          />
        </button>
        <button
          className={`${styles.scrollbar__button} ${
            scrollIsAtEnd ? styles["scrollbar__button--disabled"] : ""
          }`}
          aria-controls="scroll-area"
          onClick={() => scroll("right")}
          disabled={scrollIsAtEnd}
          aria-label="Click to view next videos"
        >
          <Image
            src={chevronIcon}
            aria-hidden="true"
            alt=""
            className={`${styles.scrollbar__icon} ${styles["scrollbar__icon--right"]}`}
          />
        </button>
      </div>
    </section>
  );
}
