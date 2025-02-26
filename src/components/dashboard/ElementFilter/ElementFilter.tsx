import styles from "./ElementFilter.module.scss";

export default function ElementFilter() {
	return (
		<ul className={styles.list} tabIndex={0} role="region" aria-label="filter">
			<li className={styles.item}>boxing</li>
			<li className={styles.item}>jump rope</li>
			<li className={styles.item}>
				<p>core crushers</p>
			</li>
			<li className={styles.item}>isometric</li>
			<li className={styles.item}>upper body bands</li>
			<li className={styles.item}>lower body bands</li>
		</ul>
	);
}
