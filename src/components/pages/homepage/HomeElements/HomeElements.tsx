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
		<section className={styles.elements}>
			<div>
				<h2 className={`h2-title ${styles["element-container"]}`}>
					<span className="bold">Formulate</span> your workout
				</h2>
			</div>
			<div className={styles["element-container2"]}>
				<div className={styles["element-box"]}>
					<Element name="Boxing" />
					<p className="body2">+</p>
					<Element name="Boxing" />
					<p className="body2">+</p>
					<Element name="Boxing" />
				</div>
				<div className={styles["workout-description"]}>
					<p className="body2">→</p>
					<p className={`${styles["underline"]} body2`}>A killer arm workout</p>
				</div>
			</div>
			<Button
				className={styles["align-end"]}
				variant="secondary"
				onClick={handleNavigate}
			>
				Learn More
			</Button>
		</section>
	);
}
