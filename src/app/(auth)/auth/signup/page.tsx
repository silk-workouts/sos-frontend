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
import loadingSpinner from "/public/assets/gifs/spinner.svg";
import Button from "@/components/ui/Button/Button";
import Link from "next/link";
import styles from "./page.module.scss";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSigningUp, setIsSigningUp] = useState(false);

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
      setIsSigningUp(true);
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
    } finally {
      setIsSigningUp(false);
    }
  }

  return (
    <div className={styles.signupContainer}>
      <div className={styles["signupContainer-wrapper"]}>
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
          <div className={styles.panelRight__header}>
            <h1 className="authForm">Create an Account</h1>
            <p className={styles.panelRight__subtitle}>
              <span>Already have an account? </span>
              <span>
                <Link
                  className={`link--emphasis ${styles.loginLink}`}
                  href="/auth/login"
                >
                  Login
                </Link>
              </span>
            </p>
          </div>
          <form onSubmit={handleSignup} className={styles.signupForm}>
            <div className={styles["signupForm__input-container"]}>
              {/* ✅ Email input field */}
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="text"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: "" });
                  }}
                  className={errors.email ? styles.error : ""}
                />
                {errors.email && (
                  <span className={styles.errorMessage}>{errors.email}</span>
                )}
              </div>

              {/* ✅ Password input field */}
              <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <div className={styles.tooltipContainer}>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors({ ...errors, password: "" });
                    }}
                    aria-describedby="passwordTooltip"
                    className={errors.password ? styles.error : ""}
                  />
                  <span className={styles.tooltip} id="passwordTooltip">
                    Password must be at least 8 characters, contain one
                    uppercase letter, one lowercase letter, and one number.
                  </span>
                </div>
                {errors.password && (
                  <span className={styles.errorMessage}>{errors.password}</span>
                )}
              </div>
            </div>

            {/* ✅ Sign Up button */}
            <Button
              type="submit"
              disabled={isSigningUp}
              className={styles.button}
            >
              {isSigningUp ? (
                <span>
                  <Image
                    src={loadingSpinner}
                    alt={`List of playlists is loading`}
                    width={20}
                    height={20}
                    className={styles.icon}
                  />
                  <span className={styles.button__buttonText}>
                    Signing up...
                  </span>
                </span>
              ) : (
                <span className={styles.button__buttonText}> Sign Up</span>
              )}
            </Button>
          </form>
        </div>
        <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
      </div>
    </div>
  );
}
