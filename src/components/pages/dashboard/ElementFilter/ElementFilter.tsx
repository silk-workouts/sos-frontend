import styles from "./ElementFilter.module.scss";

interface FilterProps {
  elementFilter: Set<string>;
  handleFilter: (s: string) => void;
}

export default function ElementFilter({
  elementFilter,
  handleFilter,
}: FilterProps) {
  return (
    <ul
      className={styles.list}
      role="tablist"
      tabIndex={0}
      aria-multiselectable="true"
      aria-label="filter"
    >
      <li
        className={`${styles.item} ${
          elementFilter.has("boxing") ? styles["item--selected"] : ""
        }`}
        role="tab"
        tabIndex={0}
        aria-selected={elementFilter.has("boxing")}
        onClick={() => handleFilter("boxing")}
      >
        boxing
      </li>
      <li
        className={`${styles.item} ${
          elementFilter.has("jump rope") ? styles["item--selected"] : ""
        }`}
        role="tab"
        tabIndex={0}
        aria-selected={elementFilter.has("jump rope")}
        onClick={() => handleFilter("jump rope")}
      >
        jump rope
      </li>
      <li
        className={`${styles.item} ${
          elementFilter.has("core crushers") ? styles["item--selected"] : ""
        }`}
        role="tab"
        tabIndex={0}
        aria-selected={elementFilter.has("core crushers")}
        onClick={() => handleFilter("core crushers")}
      >
        core crushers
      </li>
      <li
        className={`${styles.item} ${
          elementFilter.has("isometric") ? styles["item--selected"] : ""
        }`}
        role="tab"
        tabIndex={0}
        aria-selected={elementFilter.has("isometric")}
        onClick={() => handleFilter("isometric")}
      >
        isometric
      </li>
      <li
        className={`${styles.item} ${
          elementFilter.has("upper body bands") ? styles["item--selected"] : ""
        }`}
        role="tab"
        tabIndex={0}
        aria-selected={elementFilter.has("upper body bands")}
        onClick={() => handleFilter("upper body bands")}
      >
        upper body bands
      </li>
      <li
        className={`${styles.item} ${
          elementFilter.has("lower body bands") ? styles["item--selected"] : ""
        }`}
        role="tab"
        tabIndex={0}
        aria-selected={elementFilter.has("lower body bands")}
        onClick={() => handleFilter("lower body bands")}
      >
        lower body bands
      </li>
    </ul>
  );
}
