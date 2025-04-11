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
					<ul className={styles.nav__list} role="list">
						<li className={styles.nav__item} role="listitem">
							<Link
								href="/contact"
								title="Customer Support"
								id={styles.nav__link}
							>
								customer support
							</Link>
						</li>
						<li className={styles.nav__item} role="listitem">
							<Link
								href="/privacy-policy"
								title="Privacy Policy"
								id={styles.nav__link}
							>
								privacy policy
							</Link>
						</li>
						<li className={styles.nav__item} role="listitem">
							<Link
								href="/fitness-waiver"
								title="Fitness Waiver"
								id={styles.nav__link}
							>
								fitness waiver
							</Link>
						</li>
					</ul>
				</nav>
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
