"use client";
import { useState } from "react";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import {
  isValidEmail,
  isValidPassword,
  sanitizeEmail,
  sanitizePassword,
} from "src/utils/authInputUtils";
import whiteS from "public/assets/images/large-S-white-dropshad.svg";
import leftArrow from "public/assets/icons/arrow-left.svg";
import Button from "@/components/ui/Button/Button";
import Link from "next/link";
import styles from "./page.module.scss";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault(); // ✅ Prevent form from reloading the page

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email.trim());
    const sanitizedPassword = sanitizePassword(password);

    // ✅ Initialize a fresh error object
    const newErrors: { [key: string]: string } = {};

    // ✅ Validation logic
    if (!sanitizedEmail) {
      newErrors.email = "⚠️ Email is required.";
    } else if (!isValidEmail(sanitizedEmail)) {
      newErrors.email = "⚠️ Invalid email format.";
    }

    if (!sanitizedPassword) {
      newErrors.password = "⚠️ Password is required.";
    } else if (!isValidPassword(sanitizedPassword)) {
      newErrors.password = "⚠️ Invalid password format";
    }

    // ✅ If any errors, update state and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // ✅ Clear previous errors if validation passed
    setErrors({});

    try {
      console.log("🛠️ Attempting signup...");

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: sanitizedEmail,
          password: sanitizedPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await sendVerificationEmail(data.email, data.verificationToken);

        // Clear form fields after successful signup
        setEmail("");
        setPassword("");

        toast.success(
          "Signup successful! Check your email (including SPAM folder) for verification."
        );
      } else if (res.status === 409) {
        // Handle duplicate email error
        // toast.error("This email is already registered. Please log in.");
        setErrors({
          general: "This email is already registered. Please log in.",
        });
      } else {
        console.error("❌ Signup failed:", data);
        setErrors({ general: data.error || "Signup failed." });
        // toast.error(data.error || "Signup failed.");
      }
    } catch (error) {
      console.error("❌ Unexpected error:", error);
      setErrors({ general: "An unexpected error occurred." });
    }
  }

  return (
    <div className={styles.signupContainer}>
      {/* ✅ Left panel with signup information */}
      <div className={styles.panelLeft}>
        <Link
          href="/"
          className={`${styles.backLink} ${styles["backLink--hideDesktop"]}`}
        >
          <Image src={leftArrow} alt="" aria-hidden="true" />
          <span>Back to Site</span>
        </Link>
        <Image
          src={whiteS}
          alt=""
          aria-hidden="true"
          className={styles.panelLeft__sLogo}
        />

        {/* <h1 className={styles.title}>Join System of Silk</h1> */}
      </div>

      {/* ✅ Right panel containing the signup form */}
      <div className={styles.panelRight}>
        <Link
          href="/"
          className={`${styles.backLink} ${styles["backLink--hideMobile"]}`}
        >
          <Image src={leftArrow} alt="" aria-hidden="true" />
          <span>Back to Site</span>
        </Link>
        <form onSubmit={handleSignup} className={styles.signupForm}>
          <h1 className={`${styles.heading} authForm`}>Create an Account</h1>
          <div className={styles.subtitle}>
            <p>Already have an account? </p>
            <Link
              className={`link--emphasis ${styles.loginLink}`}
              href="/auth/login"
            >
              Login
            </Link>
          </div>
          {/* ✅ Email input field */}
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input
              type="text"
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
            <div className={styles.tooltipContainer}>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="passwordTooltip"
              />
              <span className={styles.tooltip} id="passwordTooltip">
                Password must be at least 8 characters, contain one uppercase
                letter, one lowercase letter, and one number.
              </span>
            </div>
            {errors.password && (
              <span
                className={`${styles.errorMessage} ${styles.pwErrorMessage}`}
              >
                {errors.password}
              </span>
            )}
          </div>

          {/* ✅ Sign Up button */}
          <Button type="submit">Sign Up</Button>
        </form>
      </div>
      <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
    </div>
  );
}
