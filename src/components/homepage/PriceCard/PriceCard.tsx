'use client';

import Button from '@/components/ui/Button/Button';
import styles from './PriceCard.module.scss';

export default function PriceCard() {
  const handleStartTrial = () => {
    window.open('https://buy.stripe.com/3csaF8cac3ZZd2w7st', '_blank');
  };

  return (
    <article className={styles.priceCard}>
      <div className={styles.priceCard__header}>
        <h3 className={styles.priceCard__title}>
          $24 <span className={styles['priceCard__title--small']}>/ month</span>
        </h3>
        <Button
          variant="tertiary"
          onClick={handleStartTrial}
          className={styles.priceCard__button}
        >
          7-day free trial
        </Button>
      </div>

      <ul className={`body1 ${styles.priceCard__list}`}>
        <li className={styles.priceCard__item}>Full access to workouts</li>
        <li className={styles.priceCard__item}>Customize sets/queue</li>
        <li className={styles.priceCard__item}>How-to tutorials</li>
      </ul>
    </article>
  );
}
