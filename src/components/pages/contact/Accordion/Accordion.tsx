import Image from "next/image";
import { useState } from "react";
import plusIcon from "/public/assets/icons/plus.svg";
import minusIcon from "/public/assets/icons/minus.svg";
import styles from "./Accordion.module.scss";

interface AccordionSection {
  title: string;
  content: string;
  position: string;
}

export default function Accordion({
  title,
  content,
  position,
}: AccordionSection) {
  const [isExpanded, setIsExpanded] = useState(false);

  function handleOnClick() {
    setIsExpanded(!isExpanded);
  }

  return (
    <>
      <div className={styles.accordionItem}>
        <button
          id={`accordion-button-${position}`}
          className={`body2 ${styles["accordion-button"]}`}
          aria-controls={`accordion-panel-${position}`}
          aria-expanded={isExpanded}
          onClick={handleOnClick}
        >
          <span className={styles.accordion__title}>
            <span className={styles.accordion__icon}>
              {isExpanded ? (
                <Image src={minusIcon} alt="An icon of a minus symbol " />
              ) : (
                <Image src={plusIcon} alt="An icon of a plus symbol " />
              )}
            </span>
            <span>{title}</span>
          </span>
        </button>
        {/* </h3> */}
        <div
          id={`accordion-panel-${position}`}
          className={`${styles["accordion-panel"]} ${
            isExpanded ? styles.expanded : ""
          }`}
          aria-labelledby="accordion-button"
          aria-hidden={!isExpanded}
          role="region"
        >
          <p>{content}</p>
        </div>
      </div>
    </>
  );
}
