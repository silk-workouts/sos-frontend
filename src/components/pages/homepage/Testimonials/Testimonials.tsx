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
    name: "Jeff",
  },
  {
    id: 2,
    text: "The real magic is Michael himself. He pushes people to reach further and deeper, and does so in a way that you really feel he wants the best for you.",
    name: "Em",
  },
  {
    id: 3,
    text: "I’ve been training with Mike/the Silk methodology for 10 years, and from the first workout, I could tell this program was different.",
    name: "Danny",
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

  return (
    <section className={styles.testimonialsSection}>
      <h2 className={`h2-title ${styles.testimonialsHeader}`}>
        <span className="bold">The</span> Testimonials
      </h2>
      <div className={styles.carousel} ref={scrollableContainerRef}>
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className={styles.testimonialCard}>
            <p className={styles.testimonialText}>{testimonial.text}</p>
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
