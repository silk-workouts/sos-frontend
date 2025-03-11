"use client";
import Image from "next/image";
import libraryIcon from "/public/assets/icons/library.svg";
import library_filled from "/public/assets/icons/library-fill.svg";
import profileIcon from "/public/assets/icons/profile.svg";
import weightsIcon from "/public/assets/icons/weights.svg";
import weights_filled from "/public/assets/icons/weights-fill.svg";
import styles from "./Navigation.module.scss";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navigation() {
	const path = usePathname();

	if (path !== "/dashboard" && path !== "/library" && path !== "/profile") {
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
						<span>home</span>
					</Link>
				</li>
				<li className={styles.nav__item}>
					<Link
						href="/library"
						className={`${styles.nav__link} ${
							path === "/library" ? styles["nav__link--active"] : ""
						}`}
					>
						<Image
							src={path === "/library" ? library_filled : libraryIcon}
							alt=""
							className={styles.icon}
						/>
						<span>library</span>
					</Link>
				</li>
				<li className={styles.nav__item}>
					<Link
						href="/profile"
						className={`${styles.nav__link} ${
							path === "/profile" ? styles["nav__link--active"] : ""
						}`}
					>
						<Image src={profileIcon} alt="" className={styles.icon} />
						<span>profile</span>
					</Link>
				</li>
			</ul>
		</nav>
	);
}
