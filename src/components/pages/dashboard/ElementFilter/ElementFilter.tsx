import Button from "@/components/ui/Button/Button";
import { Filter } from "../DashboardPageContent/DashboardPageContent";
import styles from "./ElementFilter.module.scss";

interface FilterProps {
  elementFilter: Set<string>;
  setFilter: (arg: Set<string>) => void;
  handleFilter: (s: string) => void;
  options: Filter[];
}

export default function ElementFilter({
  elementFilter,
  setFilter,
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
      {options.length > 0 && (
        <li>
          <Button
            variant="text"
            onClick={() => setFilter(new Set())}
            className={styles.button}
          >
            Clear filter
          </Button>
        </li>
      )}
    </ul>
  );
}
