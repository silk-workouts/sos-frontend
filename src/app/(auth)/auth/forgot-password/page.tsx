"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import { isValidEmail, sanitizeEmail } from "src/utils/authInputUtils";
import Link from "next/link";
import whiteS from "public/assets/images/large-S-white-dropshad.svg";
import leftArrow from "public/assets/icons/arrow-left.svg";
import Button from "@/components/ui/Button/Button";
import styles from "./page.module.scss";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

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
      console.log("📩 Sending reset email...");

      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitizedEmail }),
      });

      const data = await res.json();
      console.log(data, "DATA");

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
    }
  }

  return (
    <div className={styles.forgotPasswordContainer}>
      {/* ✅ Left panel with branding */}
      <div className={styles.panelLeft}>
        <Link href="/" className={styles.backLink}>
          <Image src={leftArrow} alt="" aria-hidden="true" />
          <span>Back to Site</span>
        </Link>
        <Image
          className={styles.panelLeft__img}
          src={whiteS}
          alt="small S for silk logo"
        />
        {/* <h1 className={styles.title}>Reset Your Password</h1> */}
      </div>

      {/* ✅ Right panel containing the forgot password form */}
      <div className={styles.panelRight}>
        <form
          onSubmit={handleForgotPassword}
          className={styles.forgotPasswordForm}
        >
          <h1 className={`${styles.heading} authForm`}>Forgot Password</h1>

          {/* ✅ Email input field */}
          <div className={styles.inputGroup}>
            {/* <p className={styles.subtitle}>
              Enter your email to receive a password reset link.
            </p> */}
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

          {/* ✅ Send Reset Link button */}
          <Button
            type="submit"
            // variant="tertiary"
            className={styles.resetButton}
          >
            Send Reset Link
          </Button>

          {/* ✅ Link to login page */}
          <div className={styles.footerText}>
            <p>Remembered your password? </p>
            <Link className="link--emphasis" href="/auth/login">
              Log in
            </Link>
          </div>
        </form>
      </div>
      <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
    </div>
  );
}
