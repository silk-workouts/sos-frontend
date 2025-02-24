import React from "react";
import styles from "./Element.module.scss";

export interface ElementProps {
	number: string;
	letter: string;
	name: string;
}

export default function Element({ number, letter, name }: ElementProps) {
	return (
		<div className={styles.elementContainer}>
			{/* Tooltip appears on hover */}
			<div className={styles.tooltip}>Boxing 2: Straight Punches</div>

			<div className={styles.element}>
				<div className={styles.number}>{number}</div>
				<div className={styles.letter}>{letter}</div>
				<div className={styles.name}>{name}</div>
			</div>
		</div>
	);
}
