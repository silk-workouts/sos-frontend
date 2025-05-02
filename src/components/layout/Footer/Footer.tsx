"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "/public/assets/images/logo.png";
import instagramIcon from "/public/assets/icons/instagram.svg";
import styles from "./Footer.module.scss";

export default function Footer() {
  const path = usePathname()!;

  if (
    path.startsWith("/dashboard") ||
    path.startsWith("/auth") ||
    path.startsWith("/account ")
  ) {
    return;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles["footer-container"]}>
        <nav aria-label="Footer" className={styles.nav}>
          <ul className={styles.nav__list} role="list" id={styles.nav__links}>
            <li className={styles.nav__item} role="listitem">
              <Link href="/contact" title="Customer Support">
                customer support
              </Link>
            </li>
            <li className={styles.nav__item} role="listitem">
              <Link href="/privacy-policy" title="Privacy Policy">
                privacy policy
              </Link>
            </li>
            <li className={styles.nav__item} role="listitem">
              <Link href="/fitness-waiver" title="Fitness Waiver">
                fitness waiver
              </Link>
            </li>
          </ul>
        </nav>

        <a
          href="https://www.instagram.com/systemofsilk"
          target="_blank"
          rel="noopener noreferrer"
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

        <div className={styles["logo-container"]}>
          <Link href="/">
            <Image
              src={logo}
              alt="System of Silk logo"
              className={styles.logo}
            />
          </Link>
          <span className={styles.copyright}>© 2025 all rights reserved</span>
        </div>
      </div>
    </footer>
  );
}
