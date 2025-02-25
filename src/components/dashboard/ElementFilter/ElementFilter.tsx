import styles from "./ElementFilter.module.scss";

export default function ElementFilter() {
	return (
		<ul className={styles.list}>
			<li className={styles.item}>boxing</li>
			<li className={styles.item}>jump rope</li>
			<li className={styles.item}>core crushers</li>
			<li className={styles.item}>isometric</li>
			<li className={styles.item}>upper body bands</li>
			<li className={styles.item}>lower body bands</li>
		</ul>
	);
}
