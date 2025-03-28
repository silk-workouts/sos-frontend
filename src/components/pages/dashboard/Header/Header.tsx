"use client";
import Link from "next/link";
import Image from "next/image";
import logoIcon from "/public/assets/images/logo.png";
import styles from "./Header.module.scss";
import { usePathname } from "next/navigation";

export default function Header() {
	const pathname = usePathname()!;
	const pathnameSegment = pathname.split("/");

	if (pathnameSegment.length === 5 && pathnameSegment[4] === "videos") {
		return;
	}

	if (pathname.startsWith("/dashboard/playlistplayer")) return;

	if (pathname.startsWith("/dashboard/library") && pathnameSegment.length > 3) {
		return;
	}

	return (
		<header className={styles.header}>
			<Link href="/dashboard">
				<Image
					src={logoIcon}
					alt="System of Silk Logo"
					className={styles.logo}
				/>
			</Link>
		</header>
	);
}
