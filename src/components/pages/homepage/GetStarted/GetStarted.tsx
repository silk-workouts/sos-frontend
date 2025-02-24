'use client';

import PriceCard from '../PriceCard/PriceCard';
import styles from './GetStarted.module.scss';

export default function GetStarted() {
  return (
    <section className={styles.getStarted}>
      <h2 className={`h2-title ${styles.getStarted__mainTitle}`}>
        <span className="bold">get</span> started
      </h2>
      <h3 className={`h3_title ${styles.getStarted__subHeading}`}>
        start your 100% silk journey today.
      </h3>
      <div className={styles.getStarted__pricePlans}>
        <PriceCard /> <PriceCard /> <PriceCard />
      </div>
    </section>
  );
}
