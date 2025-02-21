import Image, { StaticImageData } from "next/image";
import Element from "@/components/Element/Element";
import { ElementProps } from "@/components/Element/Element";
import styles from "./ElementCard.module.scss";

interface ElementInfo {
	element: ElementProps;
	content: string;
	imageSrc: StaticImageData;
	imageAlt: string;
	alternate?: boolean;
}

export default function ElementCard({
	element,
	content,
	imageSrc,
	imageAlt,
	alternate,
}: ElementInfo) {
	return (
		<article
			className={`${styles.card} ${alternate ? styles["card--alternate"] : ""}`}
		>
			<div className={styles.card__info}>
				<Element
					number={element.number}
					letter={element.letter}
					name={element.name}
				/>
				<p className={styles.card__message}>{content}</p>
			</div>
			<Image src={imageSrc} alt={imageAlt} className={styles.card__image} />
		</article>
	);
}
