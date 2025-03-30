"use client";

import React from "react";
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
  return (
    <section className={styles.testimonialsSection}>
      <h2 className={`h2-title ${styles.testimonialsHeader}`}>
        <span className="bold">The</span> Testimonials
      </h2>
      <div className={styles.carousel}>
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className={styles.testimonialCard}>
            <p>{testimonial.text}</p>
            <div className={styles.testimonialAuthor}>{testimonial.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
