'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import silkHeadshot from '/public/assets/images/silk_headshot_1.jpg';
import Button from '@/components/ui/Button/Button';
import styles from './About.module.scss';

export default function About() {
  const router = useRouter();

  return (
    <section className={styles.about}>
      <Image src={silkHeadshot} alt="A headshot of Michael `Silk` Olajide" />
      <div className={styles['about-container']}>
        <h3 className="h3_title h3_title--accent">about</h3>
        <div className={styles.about__info}>
          <h4 className={`h2-title ${styles.about__subHeading}`}>
            <span className="bold">the godfather</span> of Boxing for Fitness
          </h4>
          <p className={`body1 ${styles.about__message}`}>
            Michael “Silk” Olajide Jr., began his career as a prizefighter. He
            was a highly respected championship boxer whose fights were
            televised internationally. In 1991 he retired from an eye injury and
            ushered in the age of boxing fitness.
          </p>
          <Button variant="secondary" onClick={() => router.push('/about')}>
            More about Michael
          </Button>
        </div>
      </div>
    </section>
  );
}
