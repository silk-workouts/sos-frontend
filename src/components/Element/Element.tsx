import styles from "./Element.module.scss";

export default function Element({ name }: { name: string }) {
	//filter out body
	const nameSegments = name
		.split(" ")
		.filter((word) => word.toLowerCase() !== "body");
	let elementSymbol = "";

	if (nameSegments.length == 1) {
		elementSymbol = name.slice(0, 2);
	} else {
		elementSymbol = nameSegments
			.map((str: string) => str[0])
			.join("")
			.slice(0, 2);
	}

	return (
		<div className={styles.elementContainer}>
			<div className={styles.element}>
				<div className={styles.symbol}>{elementSymbol.toLowerCase()}</div>
				<div className={styles.name}>{nameSegments.join(" ")}</div>
			</div>
		</div>
	);
}
