import Image from "next/image";
import Link from "next/link";
import facebookIcon from "/public/assets/icons/facebook.svg";
import instagramIcon from "/public/assets/icons/instagram.svg";
import twitterIcon from "/public/assets/icons/twitter.svg";
import styles from "./Footer.module.scss";

export default function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles["footer__logo-container"]}>
				<Link href="/" className={styles["footer__logo-link"]}>
					s.o.s
				</Link>
				<span className="text-small">© 2025 all rights reserved</span>
			</div>
			<div className={styles.socials}>
				<div className={styles["socials__icon-container"]}>
					<a
						href="https://www.instagram.com/aerospacenyc"
						target="_blank"
						title="Follow us on Instagram"
						className={styles.socials__link}
					>
						<Image
							src={instagramIcon}
							alt="The Instagram icon"
							className={styles.socials__icon}
						/>
					</a>
				</div>
				<div className={styles["socials__icon-container"]}>
					<a
						href="https://x.com/Michaelolajide1"
						target="_blank"
						title="Follow us on Twitter"
						className={styles.socials__link}
					>
						<Image
							src={twitterIcon}
							alt="The Twitter icon"
							className={styles["socials__icon--twitter"]}
						/>
					</a>
				</div>

				<div className={styles["socials__icon-container"]}>
					<a
						href="https://www.facebook.com/pages/Aerospace-NYC/370547316468866"
						target="_blank"
						title="Follow us on Facebook"
						className={styles.socials__link}
					>
						<Image
							src={facebookIcon}
							alt="The Facebook icon"
							className={styles.socials__icon}
						/>
					</a>
				</div>
			</div>
			<ul className={styles.footer__list}>
				<li className={styles["footer__item"]}>
					<Link href="/contact" title="Customer Support" className="link">
						customer support
					</Link>
				</li>
				<li className={styles["footer__item"]}>
					<Link href="/privacy-policy" title="Privacy Policy" className="link">
						privacy policy
					</Link>
				</li>
				<li className={styles["footer__item"]}>
					<Link href="/fitness-waiver" title="Fitness Waiver" className="link">
						fitness waiver
					</Link>
				</li>
			</ul>
		</footer>
	);
}
