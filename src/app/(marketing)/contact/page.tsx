'use client';
import Image from 'next/image';
import plusIcon from '/public/assets/icons/plus.svg';
import minusIcon from '/public/assets/icons/minus.svg';
import closeIcon from '/public/assets/icons/close.svg';
import PageTitleHeader from '@/components/ui/PageTitleHeader/PageTitleHeader';
import Button from '@/components/ui/Button/Button';
import styles from './page.module.scss';
import { useState } from 'react';

export default function Contact() {
  const [showContactModal, setShowContactModal] = useState(false);

  function handleCloseContactModal() {
    setShowContactModal(!showContactModal);
  }

  return (
    <>
      <PageTitleHeader title="support" subHeading="how can we help?" />
      <div className={styles.body}>
        <h2 className="h2-title">
          <span className="bold">Frequently</span> Asked Questions
        </h2>
        <div id="accordionGroup" className={`body1 ${styles.accordionGroup}`}>
          <Accordion
            title="Can I start System of Silk if I haven't worked out in a
								while?"
            content="Of course. System of Silk is geared toward ALL fitness and
							everyone is free and encouraged to go at their own pace.We
							recommend trying a free* introductory workout, then discussing any
							thoughts or questions you may have regarding our fitness goals,
							with your coach."
            position="1"
          />
          <Accordion
            title="Can I start System of Silk if I haven't worked out in a
								while?"
            content="Of course. System of Silk is geared toward ALL fitness and
							everyone is free and encouraged to go at their own pace.We
							recommend trying a free* introductory workout, then discussing any
							thoughts or questions you may have regarding our fitness goals,
							with your coach."
            position="2"
          />
          <Accordion
            title="Can I start System of Silk if I haven't worked out in a
								while?"
            content="Of course. System of Silk is geared toward ALL fitness and
							everyone is free and encouraged to go at their own pace.We
							recommend trying a free* introductory workout, then discussing any
							thoughts or questions you may have regarding our fitness goals,
							with your coach."
            position="3"
          />
          <Accordion
            title="Can I start System of Silk if I haven't worked out in a
								while?"
            content="Of course. System of Silk is geared toward ALL fitness and
							everyone is free and encouraged to go at their own pace.We
							recommend trying a free* introductory workout, then discussing any
							thoughts or questions you may have regarding our fitness goals,
							with your coach."
            position="4"
          />
          <Accordion
            title="Can I start System of Silk if I haven't worked out in a
								while?"
            content="Of course. System of Silk is geared toward ALL fitness and
							everyone is free and encouraged to go at their own pace.We
							recommend trying a free* introductory workout, then discussing any
							thoughts or questions you may have regarding our fitness goals,
							with your coach."
            position="5"
          />
        </div>
        <div className={styles.contact}>
          <h2 className="h2-title">Still looking for answers?</h2>
          <Button variant="secondary" onClick={handleCloseContactModal}>
            contact us
          </Button>
        </div>
        <ContactFormModal
          show={showContactModal}
          handleClose={handleCloseContactModal}
        />
      </div>
    </>
  );
}

type AccordionSection = {
  title: string;
  content: string;
  position: string;
};

function Accordion({ title, content, position }: AccordionSection) {
  const [isExpanded, setIsExpanded] = useState(false);

  function handleOnClick() {
    setIsExpanded(!isExpanded);
  }

  return (
    <>
      <h3>
        <button
          id={`accordion-button-${position}`}
          className={`body1 ${styles['accordion-button']}`}
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
            {title}
          </span>
        </button>
      </h3>
      <div
        id={`accordion-panel-${position}`}
        className={`${styles['accordion-panel']} ${
          isExpanded ? styles.expanded : ''
        }`}
        aria-labelledby="accordion-button"
        aria-hidden={!isExpanded}
        role="region"
      >
        <p>{content}</p>
      </div>
    </>
  );
}

type contactModal = {
  show: boolean;
  handleClose: () => void;
};

function ContactFormModal({ show, handleClose }: contactModal) {
  if (!show) {
    return null;
  }

  function handleCloseContactModal(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target;

    if (target instanceof HTMLElement && target.id === 'dialog-container') {
      handleClose();
    }
  }

  return (
    <div
      id="dialog-container"
      role="button"
      className={styles['dialog-container']}
      onClick={(e) => handleCloseContactModal(e)}
    >
      <div
        role="dialog"
        aria-labelledby="dialogTitle"
        className={styles.dialog}
      >
        <div className={styles.dialog__header}>
          <h2 id="dialogTitle" className="h2-title">
            Send us a message{' '}
          </h2>
          <button className={styles.dialog__closeButton} onClick={handleClose}>
            <Image src={closeIcon} alt="An icon of an X" />
          </button>
        </div>

        <form className={`body1 ${styles.form}`}>
          <div className={styles['form__fields-wrapper']}>
            <div className={styles['form__input-container']}>
              <label htmlFor="name" className={styles.form__label}>
                name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                className={styles.form__input}
              />
            </div>
            <div className={styles['form__input-container']}>
              <label htmlFor="email" className={styles.form__label}>
                email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className={styles.form__input}
              />
            </div>
          </div>

          <div className={styles['form__input-container']}>
            <label htmlFor="message" className={styles.form__label}>
              message
            </label>
            <textarea
              id="message"
              name="message"
              className={`${styles.form__input} ${styles['form__input--textarea']}`}
            ></textarea>
          </div>

          <div className={styles['form__button-container']}>
            <button
              className={`body1 ${styles.form__button}`}
              onClick={handleClose}
            >
              Cancel
            </button>
            <Button variant="tertiary" onClick={handleClose}>
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
