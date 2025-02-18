"use client";
import { useRef, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";
import Button from "@/components/ui/Button/Button";
import styles from "./Header.module.scss";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = Cookies.get("auth_token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "GET" });
    setIsLoggedIn(false);
    router.push("/");
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src="/assets/images/logo.png"
              alt="System of Silk Logo"
              width={104}
              height={36}
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.navLinks}>
          <Link
            href="/the-workouts"
            className={`${styles.menuItem} ${
              pathname === "/the-workouts" ? styles.activeLink : ""
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            The Workout
          </Link>
          <Link
            href="/about"
            className={`${styles.menuItem} ${
              pathname === "/about" ? styles.activeLink : ""
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>
          <a
            href="https://shop.systemofsilk.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.menuItem} ${
              pathname === "/shop" ? styles.activeLink : ""
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Shop
          </a>
          <Button variant="secondary" className={styles.signupButton}>
            <Link href="/auth/signup">Sign up/Log in</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button & 7-Day Free Trial Button */}
        <div className={styles.mobileActions}>
          <Button variant="tertiary" className={styles.trialButton}>
            <Link href="/auth/signup">7-Day Free Trial</Link>
          </Button>
          <button
            className={styles.hamburger}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <nav
          ref={menuRef}
          className={`${styles.mobileMenu} ${
            isMobileMenuOpen ? styles.open : ""
          }`}
        >
          <div className={styles.menuContainer}>
            <Link
              href="/the-workouts"
              className={`${styles.menuItem} ${
                pathname === "/the-workouts" ? styles.activeLink : ""
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              The Workout
            </Link>
            <Link
              href="/about"
              className={`${styles.menuItem} ${
                pathname === "/about" ? styles.activeLink : ""
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <a
              href="https://shop.systemofsilk.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.menuItem} ${
                pathname === "/shop" ? styles.activeLink : ""
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shop
            </a>
            <Link
              href="/auth/login"
              className={`${styles.menuItem} ${
                pathname === "/auth/login" ? styles.activeLink : ""
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className={`${styles.menuItem} ${
                pathname === "/auth/signup" ? styles.activeLink : ""
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
