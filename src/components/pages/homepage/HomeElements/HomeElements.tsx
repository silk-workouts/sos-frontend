"use client";

import React from "react";
import styles from "./HomeElements.module.scss";
import Element from "@/components/Element/Element";
import Button from "@/components/ui/Button/Button";
import { useRouter } from "next/navigation";

export default function HomeElements() {
	const router = useRouter();

	const handleNavigate = () => {
		router.push("/the-workout");
	};

	return (
		<>
			<section className={styles.elements}>
				<div>
					<h3 className="h3_title h3_title--accent">How It Works</h3>
					<h2 className="h2-title">
						<span className="bold">The</span> Elements
					</h2>
					<p className="body1">
						Elements are categories of exercises that can be used to master a
						certain skill, or add to your cross-disciplinary workouts.
					</p>
					<Button
						className={styles["align-end"]}
						variant="secondary"
						onClick={handleNavigate}
					>
						Learn More
					</Button>
				</div>
				<div>
					<div className={styles["element-box"]}>
						<Element number="1" letter="B" name="Boxing" />
						<Element number="1" letter="B" name="Boxing" />
						<Element number="1" letter="B" name="Boxing" />
						<Element number="1" letter="B" name="Boxing" />
						<Element number="1" letter="B" name="Boxing" />
						<Element number="1" letter="B" name="Boxing" />
					</div>
				</div>
			</section>

			{/* What Works for you section */}
			<section className={styles.whatworks}>
				<h3 className={`h3_title h3_title--accent ${styles.whatworks__title}`}>
					What works for you
				</h3>
				<div className={styles.whatworks__body}>
					<p className={`body1 ${styles.whatworks__message}`}>
						The essence of 100% Silk is being able to{" "}
						<span className="text__secondary--color">
							formulate your workout to fulfill your body and mind.
						</span>
					</p>
					<div className={styles["whatworks__cards-container"]}>
						<WhatWorksForYouCards
							title="s"
							firstWord="select"
							content="workouts to customize your journey"
						/>
						<WhatWorksForYouCards
							title="o"
							firstWord="optimize"
							content="your experience with equipment"
						/>
						<WhatWorksForYouCards
							title="s"
							firstWord="succeed"
							content="in cross disciplinary exercises and track your progress"
						/>
					</div>
				</div>
			</section>
		</>
	);
}

interface CardContent {
	title: string;
	firstWord: string;
	content: string;
}

function WhatWorksForYouCards({ title, firstWord, content }: CardContent) {
	return (
		<div className={styles.card}>
			<h3 className={styles.card__title}>{title}</h3>
			<p className={`body1 ${styles.card__body}`}>
				{firstWord}{" "}
				<span className={styles["card__body--sentence"]}>{content}</span>{" "}
			</p>
		</div>
	);
}
