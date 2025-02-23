import styles from "./PageTitleHeader.module.scss";

type pageHeader = {
	title: string;
	subHeading: string;
};
export default function PageTitleHeader({ title, subHeading }: pageHeader) {
	return (
		<div className={styles.header}>
			<h1 className={styles.header__title}>{title}</h1>
			<h2 className={styles.header__subHeading}>{subHeading}</h2>
		</div>
	);
}
