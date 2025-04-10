"use client";
import { ReactNode } from "react";
import Image from "next/image";
import arrowIcon from "/public/assets/icons/arrow-right-white.svg";
import redArrow from "/public/assets/icons/red-arrow-right.svg";
import styles from "./Button.module.scss";

interface ButtonProps {
	type?: "button" | "submit";
	variant?: "primary" | "secondary" | "tertiary" | "text" | "homeHero";
	children: ReactNode;
	onClick?: () => void;
	className?: string;
}

export default function Button({
	type = "button",
	variant = "primary",
	children,
	onClick,
	className = "",
}: ButtonProps) {
	return (
		<button
			type={type}
			className={`${styles.button} ${
				styles[`button--${variant}`]
			} ${className}`}
			onClick={onClick}
		>
			<span className={styles.button__text}>{children}</span>
			{variant === "primary" && (
				<Image
					src={arrowIcon}
					alt="A right arrow icon"
					aria-hidden="true"
					className={styles.button__arrow}
				/>
			)}
			{(variant === "homeHero" || variant === "tertiary") && (
				<Image
					src={redArrow}
					alt="A right arrow icon"
					aria-hidden="true"
					className={`${styles.button__arrow} ${
						variant === "homeHero" ? styles.heroArrow : ""
					}`}
				/>
			)}
		</button>
	);
}
