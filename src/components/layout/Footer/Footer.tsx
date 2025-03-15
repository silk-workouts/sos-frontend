"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "/public/assets/images/logo.png";
import facebookIcon from "/public/assets/icons/facebook.svg";
import instagramIcon from "/public/assets/icons/instagram.svg";
import twitterIcon from "/public/assets/icons/twitter.svg";
import styles from "./Footer.module.scss";

export default function Footer() {
  const path = usePathname();

  if (path.startsWith("/dashboard")) {
    return;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.header}>
        <Link href="/">
          <Image src={logo} alt="System of Silk logo" className={styles.logo} />
        </Link>
        <div className={styles.socials}>
          <a
            href="https://www.instagram.com/aerospacenyc"
            target="_blank"
            title="Follow us on Instagram"
            className={styles.socials__link}
          >
            <div className={styles["socials__icon-container"]}>
              <Image
                src={instagramIcon}
                alt="Follow us on Instagram"
                className={styles.socials__icon}
              />
            </div>
          </a>
          <a
            href="https://x.com/Michaelolajide1"
            target="_blank"
            title="Follow us on Twitter"
            className={styles.socials__link}
          >
            <div className={styles["socials__icon-container"]}>
              <Image
                src={twitterIcon}
                alt="Follow us on Twitter"
                className={styles["socials__icon--twitter"]}
              />
            </div>
          </a>

          <a
            href="https://www.facebook.com/pages/Aerospace-NYC/370547316468866"
            target="_blank"
            title="Follow us on Facebook"
            className={styles.socials__link}
          >
            <div className={styles["socials__icon-container"]}>
              <Image
                src={facebookIcon}
                alt="Follow us on Facebook"
                className={styles.socials__icon}
              />
            </div>
          </a>
        </div>
      </div>

      <nav aria-label="Footer" className={styles.nav}>
        <ul className={styles.nav__list}>
          <li className={styles.nav__item}>
            <Link
              href="/contact"
              title="Customer Support"
              className={`link ${styles.nav__link}`}
            >
              customer support
            </Link>
          </li>
          <li className={styles.nav__item}>
            <Link
              href="/privacy-policy"
              title="Privacy Policy"
              className={`link ${styles.nav__link}`}
            >
              privacy policy
            </Link>
          </li>
          <li className={styles.nav__item}>
            <Link
              href="/fitness-waiver"
              title="Fitness Waiver"
              className={`link ${styles.nav__link}`}
            >
              fitness waiver
            </Link>
          </li>
        </ul>
      </nav>
      <span className={styles.copyright}>© 2025 all rights reserved</span>
    </footer>
  );
}
