"use client";

import { useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import profileIcon from "/public/assets/icons/profile-white-fill.svg";
import Button from "@/components/ui/Button/Button";
import styles from "./Header.module.scss";

export default function Header() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
	const pathname = usePathname()!;
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

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			const target = event.target as HTMLElement;

			if (
				isMobileMenuOpen &&
				menuRef.current &&
				!menuRef.current.contains(target) &&
				target.id !== "menu"
			) {
				setIsMobileMenuOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isMobileMenuOpen]);

	if (pathname.startsWith("/dashboard")) {
		return;
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
							width={104}
							height={36}
						/>
					</Link>
				</div>

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
					{isLoggedIn ? (
						<Link href="/dashboard" className={styles.dashboardLink}>
							<Image
								src={profileIcon}
								alt="Avatar for logged in user"
								className={styles.icon}
							/>{" "}
						</Link>
					) : (
						<Button variant="secondary">
							<Link href="/auth/signup">Sign up/Log in</Link>
						</Button>
					)}
				</nav>

				<div className={styles.mobileActions}>
					{isLoggedIn ? (
						<Link href="/dashboard" className={styles.dashboardLink}>
							<Image
								src={profileIcon}
								alt="Avatar for logged in user"
								className={styles.icon}
							/>{" "}
						</Link>
					) : (
						<Button className={styles.header__trialButton}>
							<Link href="/auth/signup">30-Day Free Trial</Link>
						</Button>
					)}
					<button
						id="menu"
						className={styles.hamburger}
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						aria-expanded={isMobileMenuOpen}
						aria-label="Toggle navigation menu"
					>
						☰
					</button>
				</div>

				{isMobileMenuOpen && (
					<nav ref={menuRef} className={styles.mobileMenu}>
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
							{!isLoggedIn && (
								<Link
									href="/auth/login"
									className={styles.menuItem}
									onClick={() => setIsMobileMenuOpen(false)}
								>
									Login
								</Link>
							)}
						</div>
					</nav>
				)}
			</div>
		</header>
	);
}
