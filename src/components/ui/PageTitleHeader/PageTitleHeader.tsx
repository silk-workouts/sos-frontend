import styles from "./PageTitleHeader.module.scss";

interface pageHeader {
	title: string;
	subHeading: string;
}

export default function PageTitleHeader({ title, subHeading }: pageHeader) {
	return (
		<div className={styles.header}>
			<div className={styles.wrapper}>
				<h1 className={`heroTitle`}>{title}</h1>
				<h2 className={styles.header__subHeading}>{subHeading}</h2>
			</div>
		</div>
	);
}
