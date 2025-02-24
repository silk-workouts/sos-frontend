// import Image, { StaticImageData } from "next/image";
import styles from "./InstructionCard.module.scss";

interface InstructionInfo {
	number: string;
	title: string;
	content: string;
	// imageSrc: StaticImageData;
	// imageAlt: string;
}

export default function InstructionCard({
	number,
	title,
	content,
}: // imageSrc,
// imageAlt,
InstructionInfo) {
	return (
		<article className={styles.card}>
			<div className={styles.card__content}>
				<h3 className={styles.card__title}>step {number}</h3>
				<h4 className={styles.card__subHeading}>{title}</h4>
				<p>{content}</p>
			</div>
			{/* <Image src={imageSrc} alt={imageAlt} /> */}
			<div className={styles.card__image}></div>
		</article>
	);
}
