'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.scss';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaidUser, setIsPaidUser] = useState(false); // ✅ New: Track paid status
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const res = await fetch('/api/auth/verify-token', {
          method: 'GET',
          credentials: 'include', // ✅ Ensure cookies are sent
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          console.warn('❌ Auth check failed, user not logged in.');
          setIsLoggedIn(false);
          setIsPaidUser(false);
          return;
        }

        const data = await res.json();

        setIsLoggedIn(true);
        setIsPaidUser(data.isPaidUser ?? false); // ✅ Update paid status
      } catch (error) {
        console.error('❌ Auth verification error:', error);
        setIsLoggedIn(false);
        setIsPaidUser(false);
      }
    }

    checkAuthStatus();
  }, [pathname]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'GET' });
    setIsLoggedIn(false);
    setIsPaidUser(false);
    setIsDropdownOpen(false);
    router.push('/');
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src="/assets/images/logo.png"
              alt="System of Silk Logo"
              className={styles.logoImage}
              width={128}
              height={36}
            />
          </Link>
        </div>

        <nav aria-label="primary" className={styles.navLinks}>
          <Link
            href="/the-workouts"
            className={pathname === '/the-workouts' ? styles.navLinkActive : ''}
          >
            The Workout
          </Link>
          <Link
            href="/about"
            className={pathname === '/about' ? styles.navLinkActive : ''}
          >
            About
          </Link>
          <a
            href="https://shop.systemofsilk.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={pathname === '/shop' ? styles.navLinkActive : ''}
          >
            Shop
          </a>
        </nav>

        <div className={styles.authSection}>
          {isLoggedIn ? (
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
                      <button onClick={handleLogout}>Logout</button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          ) : (
            <nav className={styles.authButtons}>
              <Link href="/auth/login" className={styles.loginButton}>
                Login
              </Link>
              <Link href="/auth/signup" className={styles.signupButton}>
                Sign Up
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
