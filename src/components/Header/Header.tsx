"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/Button/Button";
import styles from "./Header.module.scss";

export default function Header() {
  const pathname = usePathname();

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {/* Logo */}
          <div className={styles.logo}>
            <Link href="/">
              <img
                src="/assets/images/logo.png"
                alt="System of Silk Logo"
                className={styles.logoImage}
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav aria-label="primary" className={styles.navLinks}>
            <Link
              href="/the-workouts"
              className={`link ${
                pathname === "/the-workouts" ? styles.navLinkActive : ""
              }`}
            >
              The Workout
            </Link>
            <Link
              href="/about"
              className={`link ${
                pathname === "/about" ? styles.navLinkActive : ""
              }`}
            >
              About
            </Link>
            {/* <Link
              href="/contact"
              className={`link ${
                pathname === "/contact" ? styles.navLinkActive : ""
              }`}
            >
              Contact
            </Link> */}
            <a
              href="https://shop.systemofsilk.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`link ${
                pathname === "/shop" ? styles.navLinkActive : ""
              }`}
            >
              Shop
            </a>
          </nav>

          {/* Sign Up / Login Button */}
          <div className={styles.authButton}>
            <Button
              variant="secondary"
              onClick={() => console.log("Sign Up/Login Clicked")}
            >
              Sign Up / Log In
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
