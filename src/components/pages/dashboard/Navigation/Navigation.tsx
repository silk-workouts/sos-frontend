"use client";
import Link from "next/link";
import Image from "next/image";
import libraryIcon from "/public/assets/icons/library.svg";
import library_filled from "/public/assets/icons/library-fill.svg";
import profileIcon from "/public/assets/icons/profile.svg";
import profile_filled from "/public/assets/icons/profile-fill.svg";
import weightsIcon from "/public/assets/icons/weights.svg";
import weights_filled from "/public/assets/icons/weights-fill.svg";
import logoIcon from "/public/assets/icons/s-single.svg";
import { usePathname } from "next/navigation";
import styles from "./Navigation.module.scss";

export default function Navigation() {
	const path = usePathname()!;
	const pathSegment = path.split("/");
	let isVideolistPage = false;

	// ✅ Merged route pattern to allow for deeper library routes (from File B)
	if (
		!/^\/dashboard$|^\/dashboard\/library$|^\/dashboard\/library\/[^/]+$|^\/dashboard\/profile$|^\/dashboard\/[^/]+\/[^/]+\/videos$/.test(
			path
		)
	) {
		return <></>;
	}

	// ✅ Logic from File B to detect if we're on a deeper playlist or showcase page
	if (
		(path.startsWith("/dashboard/library") && path.split("/").length > 3) ||
		(pathSegment.length === 5 && pathSegment[4] === "videos")
	) {
		isVideolistPage = true;
	}

	return (
		<nav
			className={`${styles.nav} ${
				isVideolistPage ? styles["nav--videolist"] : ""
			}`}
		>
			<Link
				href="/dashboard"
				aria-label="Navigate to dashboard"
				className={styles["nav__logo-link"]}
			>
				<Image
					src={logoIcon}
					alt="System of Silk logo"
					className={styles.nav__logo}
				/>
			</Link>

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
							path.startsWith("/dashboard/library")
								? styles["nav__link--active"]
								: ""
						}`}
					>
						<Image
							src={
								path.startsWith("/dashboard/library")
									? library_filled
									: libraryIcon
							}
							alt=""
							className={styles.icon}
						/>
						<span id={styles.navOption}>library</span>
					</Link>
				</li>
				<li className={styles.nav__item}>
					<Link
						href="/account/profile"
						className={`${styles.nav__link} ${
							path === "/account/profile" ? styles["nav__link--active"] : ""
						}`}
					>
						<Image
							src={path === "/account/profile" ? profile_filled : profileIcon}
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
