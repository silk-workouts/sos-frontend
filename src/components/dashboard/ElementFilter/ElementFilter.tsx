import styles from "./ElementFilter.module.scss";

export default function ElementFilter() {
	return (
		<ul
			className={styles.list}
			role="tablist"
			tabIndex={0}
			aria-multiselectable="true"
			aria-label="filter"
		>
			<li className={styles.item} role="tab" tabIndex={0}>
				boxing
			</li>
			<li className={styles.item} role="tab" tabIndex={0}>
				jump rope
			</li>
			<li className={styles.item} role="tab" tabIndex={0}>
				<p>core crushers</p>
			</li>
			<li className={styles.item} role="tab" tabIndex={0}>
				isometric
			</li>
			<li className={styles.item} role="tab" tabIndex={0}>
				upper body bands
			</li>
			<li className={styles.item} role="tab" tabIndex={0}>
				lower body bands
			</li>
		</ul>
	);
}
