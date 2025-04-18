"use client";
import { useState } from "react";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import { isValidEmail, sanitizeEmail } from "src/utils/authInputUtils";
import Link from "next/link";
import whiteS from "public/assets/images/large-S-white-dropshad.svg";
import leftArrow from "public/assets/icons/arrow-left.svg";
import loadingSpinner from "/public/assets/gifs/spinner.svg";
import Button from "@/components/ui/Button/Button";
import styles from "./page.module.scss";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isResetting, setIsResetting] = useState(false);

  async function handleForgotPassword(event: React.FormEvent) {
    event.preventDefault();

    // Sanitize the email input
    const sanitizedEmail = sanitizeEmail(email.trim());
    const newErrors: { [key: string]: string } = {};

    if (!sanitizedEmail) {
      newErrors.email = "⚠️ Email is required.";
    } else if (!isValidEmail(sanitizedEmail)) {
      newErrors.email = "⚠️ Invalid email format.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      setIsResetting(true);

      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitizedEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("If your email exists, a reset link has been sent!");
        setEmail(""); // Clear the input field after success
      } else {
        console.error("❌ Failed to send reset link:", data);
        setErrors({ general: data.error || "❌ Failed to send reset link." });
      }
    } catch (error) {
      console.error("❌ An error occurred:", error);
      setErrors({ general: "❌ An unexpected error occurred." });
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className={styles.forgotPasswordContainer}>
      <div className={styles["forgotPasswordContainer-wrapper"]}>
        {/* ✅ Left panel with branding */}
        <div className={styles.panelLeft}>
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

        {/* ✅ Right panel containing the forgot password form */}
        <div className={styles.panelRight}>
          <div className={styles.panelRight__header}>
            <h1 className="authForm">Forgot Password</h1>
            <p className={styles.panelRight__subtitle}>
              <span> Remembered your password?</span>{" "}
              <span>
                <Link
                  className={`link--emphasis ${styles.loginLink}`}
                  href="/auth/login"
                >
                  Log in
                </Link>
              </span>
            </p>
          </div>
          <form
            onSubmit={handleForgotPassword}
            className={styles.forgotPasswordForm}
          >
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

            {/* ✅ Send Reset Link button */}
            <Button
              type="submit"
              disabled={isResetting}
              className={styles.button}
            >
              {isResetting ? (
                <span>
                  <Image
                    src={loadingSpinner}
                    alt={`List of playlists is loading`}
                    width={20}
                    height={20}
                    className={styles.icon}
                  />
                  <span>Sending...</span>
                </span>
              ) : (
                <span style={{ color: "white", fontWeight: "600" }}>
                  Send Reset Link
                </span>
              )}
            </Button>
            {errors.general && <p className={styles.error}>{errors.general}</p>}
          </form>
        </div>
        <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
      </div>
    </div>
  );
}
