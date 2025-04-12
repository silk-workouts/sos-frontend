import { Filter } from "../DashboardPageContent/DashboardPageContent";
import styles from "./ElementFilter.module.scss";

interface FilterProps {
	elementFilter: Set<string>;
	handleFilter: (s: string) => void;
	options: Filter[];
}

export default function ElementFilter({
	elementFilter,
	handleFilter,
	options,
}: FilterProps) {
	return (
		<ul
			className={styles.list}
			role="tablist"
			tabIndex={0}
			aria-multiselectable="true"
			aria-label="Filter workout by element type"
		>
			{options.map((option) => {
				const isSelected = elementFilter.has(option.name);
				return (
					<li
						key={option.id}
						className={`${styles.item} ${
							isSelected ? styles["item--selected"] : ""
						}`}
						role="tab"
						tabIndex={isSelected ? 0 : -1}
						aria-selected={isSelected}
						onClick={() => handleFilter(option.name)}
					>
						{option.name}
					</li>
				);
			})}
		</ul>
	);
}
