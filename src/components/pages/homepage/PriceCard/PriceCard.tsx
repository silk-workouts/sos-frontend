"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button/Button";
import styles from "./PriceCard.module.scss";

export default function PriceCard() {
	const router = useRouter();

	return (
		<article className={styles.priceCard}>
			<div className={styles.priceCard__header}>
				<h3 className={styles.priceCard__plan}>Premium Plan</h3>
				<h3 className={styles.priceCard__title}>
					$24 <span className={styles["priceCard__title--small"]}>/ month</span>
				</h3>
				<Button
					variant="tertiary"
					onClick={() => router.push("/auth/signup")}
					className={styles.priceCard__button}
				>
					Start Free Trial
				</Button>
			</div>

			<div className={styles.priceCard__includedSection}>
				<h4 className={styles.priceCard__includedTitle}>Included</h4>
				<ul className={`body1 ${styles.priceCard__list}`}>
					<li className={styles.priceCard__item}>Full access to workouts</li>
					<li className={styles.priceCard__item}>Customizable playlists</li>
					<li className={styles.priceCard__item}>Unlimited personal library</li>
					<li className={styles.priceCard__item}>No commitments</li>
				</ul>
			</div>
		</article>
	);
}
