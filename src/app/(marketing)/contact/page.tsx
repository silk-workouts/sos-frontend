"use client";
import PageTitleHeader from "@/components/ui/PageTitleHeader/PageTitleHeader";
import Button from "@/components/ui/Button/Button";
import Accordion from "@/components/pages/contact/Accordion/Accordion";
import ContactFormModal from "@/components/pages/contact/ContactFormModal/ContactFormModal";
import styles from "./page.module.scss";
import { useState } from "react";

export default function Contact() {
  const [showContactModal, setShowContactModal] = useState(false);

  function handleCloseContactModal() {
    setShowContactModal(!showContactModal);
  }

  return (
    <>
      <PageTitleHeader title="support" subHeading="how can we help?" />
      <div className={`body2 ${styles.body}`}>
        <div className={styles.wrapper}>
          <h2 className="h2-title">
            <span className="bold">Frequently</span> Asked Questions
          </h2>
          <div id="accordionGroup" className={styles.accordionGroup}>
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
            <h2 className={`h2-title ${styles.contact__title}`}>
              Still looking for answers?
            </h2>
            <a href="mailto:team.systemofsilk@gmail.com">
              <Button variant="secondary">contact us</Button>
            </a>
          </div>

          {/* <ContactFormModal
						show={showContactModal}
						handleClose={handleCloseContactModal}
					/> */}
        </div>
      </div>
    </>
  );
}
