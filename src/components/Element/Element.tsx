import styles from "./Element.module.scss";

interface ElementProps {
	name: string;
	type: "dashboard" | "marketing";
}

export default function Element({ name, type }: ElementProps) {
	const nameSegments = name.split(" ");
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
		<div
			className={` ${
				type === "marketing"
					? styles["elementContainer--red"]
					: styles.elementContainer
			}`}
		>
			<div className={styles.element}>
				<div className={styles.symbol}>{elementSymbol.toLowerCase()}</div>
				<div className={styles.name}>{name}</div>
			</div>
		</div>
	);
}
