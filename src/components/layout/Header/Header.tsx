"use client";

import { useRef, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button/Button";
import styles from "./Header.module.scss";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const res = await fetch("/api/auth/verify-token", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          console.warn("❌ Auth check failed, user not logged in.");
          setIsLoggedIn(false);
          return;
        }

        setIsLoggedIn(true);
      } catch (error) {
        console.error("❌ Auth verification error:", error);
        setIsLoggedIn(false);
      }
    }

    checkAuthStatus();
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "GET" });
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false); // Close mobile menu upon logout
    router.push("/");
  }

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

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src="/assets/images/logo.png"
              alt="System of Silk Logo"
              className={styles.logoImage}
              width={104}
              height={36}
            />
          </Link>
        </div>

        {isLoggedIn ? (
          <div
            className={`${styles.authSection} ${styles["is-logged-in"]}`}
            data-type="CODE-REFERENCE"
          >
            <div className={styles.profileMenu} role="menu">
              <button
                className={styles.profileButton}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <Image
                  src="/assets/images/jumpRope.png"
                  alt="User Profile"
                  width={40}
                  height={40}
                />
              </button>

              {isDropdownOpen && (
                <nav className={styles.dropdownMenu} role="menu">
                  <ul>
                    <li>
                      <Link href="/dashboard">Dashboard</Link>
                    </li>
                    <li>
                      <Link href="/about">About</Link>
                    </li>
                    <li>
                      <button onClick={handleLogout}>Logout</button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        ) : (
          <>
            <nav className={styles.navLinks}>
              <Link
                href="/the-workout"
                className={`${styles.menuItem} ${
                  pathname === "/the-workout" ? styles.activeLink : ""
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

            <nav
              ref={menuRef}
              className={`${styles.mobileMenu} ${
                isMobileMenuOpen ? styles.open : ""
              }`}
            >
              <div className={styles.menuContainer}>
                <Link
                  href="/the-workout"
                  className={styles.menuItem}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  The Workout
                </Link>
                <Link
                  href="/about"
                  className={styles.menuItem}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <a
                  href="https://shop.systemofsilk.com/"
                  className={styles.menuItem}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Shop
                </a>
                <Link
                  href="/auth/login"
                  className={styles.menuItem}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
}
