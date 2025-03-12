"use client";
import Image from "next/image";
import libraryIcon from "/public/assets/icons/library.svg";
import library_filled from "/public/assets/icons/library-fill.svg";
import profileIcon from "/public/assets/icons/profile.svg";
import profile_filled from "/public/assets/icons/profile-fill.svg";
import weightsIcon from "/public/assets/icons/weights.svg";
import weights_filled from "/public/assets/icons/weights-fill.svg";
import styles from "./Navigation.module.scss";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navigation() {
	const path = usePathname();

	if (!/^(\/dashboard|\/dashboard\/library|\/dashboard\/profile)$/.test(path)) {
		return <></>;
	}

	return (
		<nav className={styles.nav}>
			<ul className={styles.nav__list} role="list">
				<li className={styles.nav__item}>
					<Link
						href="/dashboard"
						className={`${styles.nav__link} ${
							path === "/dashboard" ? styles["nav__link--active"] : ""
						}`}
					>
						<Image
							src={path === "/dashboard" ? weights_filled : weightsIcon}
							alt=""
							className={styles.icon}
						/>
						<span id={styles.navOption}>home</span>
					</Link>
				</li>
				<li className={styles.nav__item}>
					<Link
						href="/dashboard/library"
						className={`${styles.nav__link} ${
							path === "/dashboard/library" ? styles["nav__link--active"] : ""
						}`}
					>
						<Image
							src={path === "/dashboard/library" ? library_filled : libraryIcon}
							alt=""
							className={styles.icon}
						/>
						<span id={styles.navOption}>library</span>
					</Link>
				</li>
				<li className={styles.nav__item}>
					<Link
						href="/dashboard/profile"
						className={`${styles.nav__link} ${
							path === "/dashboard/profile" ? styles["nav__link--active"] : ""
						}`}
					>
						<Image
							src={path === "/dashboard/profile" ? profile_filled : profileIcon}
							alt=""
							className={styles.icon}
						/>
						<span id={styles.navOption}>profile</span>
					</Link>
				</li>
			</ul>
		</nav>
	);
}
