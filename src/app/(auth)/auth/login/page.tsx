"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import leftArrow from "public/assets/icons/arrow-left.svg";
import whiteS from "public/assets/images/large-S-white-dropshad.svg";
import { Toaster, toast } from "react-hot-toast";
import {
	isValidEmail,
	isValidPassword,
	sanitizeEmail,
	sanitizePassword,
} from "src/utils/authInputUtils";
import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import styles from "./page.module.scss";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [message, setMessage] = useState("");
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const router = useRouter();

	async function handleLogin(event: React.FormEvent) {
		event.preventDefault();

		// Sanitize inputs
		const sanitizedEmail = sanitizeEmail(email.trim());
		const sanitizedPassword = sanitizePassword(password);

		// Validate inputs
		let newErrors: { [key: string]: string } = {};
		if (!sanitizedEmail) newErrors.email = "⚠️ Email is required";
		if (!sanitizedPassword) newErrors.password = "⚠️ Password is required";

		if (!isValidEmail(sanitizedEmail)) {
			newErrors.email = "⚠️ Invalid email format";
		}

		if (!isValidPassword(sanitizedPassword)) {
			newErrors.password = "⚠️ Invalid password";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			// toast.error("Please subit valid email and password.");
			return;
		}

		setErrors({});

		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: sanitizedEmail,
					password: sanitizedPassword,
				}),
				credentials: "include",
			});

			const data = await res.json();

			if (res.ok) {
				toast.success("Login successful!");

				// Call /api/auth/verify-token after login
				const verifyRes = await fetch("/api/auth/verify-token", {
					method: "GET",
					credentials: "include",
				});

				if (verifyRes.ok) {
					setTimeout(() => {
						router.push("/dashboard"); // Redirect after auth verification
					}, 1000);
				} else {
					toast.error("❌ Auth verification failed after login.");
					console.warn("❌ Auth verification failed after login.");
				}
			} else {
				toast.error(data.error || "❌ Login failed.");
				setErrors({ general: data.error || "Login failed" });
			}
		} catch (error) {
			console.error("❌ Unexpected error:", error);
			toast.error("An unexpected error occurred.");
			setErrors({ general: "An unexpected error occurred." });
		}
	}

	return (
		<div className={styles.loginContainer}>
			{/* ✅ Left panel with login options */}
			<div className={styles.panelLeft}>
				<div className={styles.panelLeft__navHeader}>
					<Link href="/" className={styles.panelLeft__backLink}>
						<Image src={leftArrow} alt="" aria-hidden="true" />
						<span>Back to Site</span>
					</Link>

					<Image
						className={styles.panelLeft__img}
						src={whiteS}
						alt="small S for silk logo"
					/>
				</div>

				{/* <h1 className={styles.title}>Login</h1> */}
			</div>

			{/* ✅ Right panel containing the login form */}
			<div className={styles.panelRight}>
				<div className={styles.panelRight__wrap}>
					<form onSubmit={handleLogin} className={styles.loginForm}>
						<h1 className={`${styles.heading} authForm`}>Welcome Back!</h1>
						<p className={styles.panelRight__subtitle}>
							Don’t have an account yet?{" "}
						</p>
						<Link
							className={`link--emphasis ${styles.panelRight__signupLink}`}
							href="/auth/signup"
						>
							Sign up now
						</Link>
						{/* ✅ Email input field */}
						<div className={styles.inputGroup}>
							<label>Email Address</label>
							<input
								type="tex†"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							{errors.email && (
								<span className={styles.errorMessage}>{errors.email}</span>
							)}
						</div>

						{/* ✅ Password input field */}
						<div className={styles.inputGroup}>
							<label>Password</label>
							<input
								type="password"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							{errors.password && (
								<span
									className={`${styles.errorMessage} ${styles.pwErrorMessage}`}
								>
									{errors.password}
								</span>
							)}
						</div>

						{/* ✅ Remember me and forgot password options */}
						<div className={styles.optionsGroup}>
							<label className={styles.checkboxContainer}>
								<input
									type="checkbox"
									checked={rememberMe}
									onChange={() => setRememberMe(!rememberMe)}
								/>
								Remember me
							</label>
							<Link
								href="/auth/forgot-password"
								className={`link--emphasis ${styles.optionsGroup__forgotPassword}`}
							>
								Forgot password?
							</Link>
						</div>

						<Button type="submit">Log In</Button>

						{/* ✅ Display messages */}
						<p className={styles.message}>{message}</p>
					</form>
				</div>
			</div>
			<Toaster position="top-center" toastOptions={{ duration: 5000 }} />
		</div>
	);
}
