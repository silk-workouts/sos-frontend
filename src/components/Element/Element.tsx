import styles from "./Element.module.scss";

export default function Element({ name }: { name: string }) {
	const nameSegments = name.split(" ");
	const elementSymbol = nameSegments.map((str: string) => str[0]).join("");

	return (
		<div className={styles.elementContainer}>
			<div className={styles.element}>
				<div className={styles.symbol}>{elementSymbol}</div>
				<div className={styles.name}>{name}</div>
			</div>
		</div>
	);
}
