"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import { isValidEmail, sanitizeEmail } from "src/utils/authInputUtils";
import Link from "next/link";
import leftArrow from "public/assets/icons/arrow-left.svg";
import Button from "@/components/ui/Button/Button";
import styles from "./page.module.scss";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleForgotPassword(event: React.FormEvent) {
    event.preventDefault();

    // Sanitize the email input
    const sanitizedEmail = sanitizeEmail(email.trim());

    // Validate the sanitized email
    if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

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
        toast.error(data.error || "❌ Failed to send reset link.");
      }
    } catch (error) {
      console.error("❌ An error occurred:", error);
      toast.error("❌ An error occurred while sending the reset link.");
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
        <h1 className={styles.title}>Reset Your Password</h1>
      </div>

      {/* ✅ Right panel containing the forgot password form */}
      <div className={styles.panelRight}>
        <form
          onSubmit={handleForgotPassword}
          className={styles.forgotPasswordForm}
        >
          {/* <h1 className={styles.heading}>Forgot Password</h1> */}

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
          </div>

          {/* ✅ Send Reset Link button */}
          <Button
            type="submit"
            variant="tertiary"
            className={styles.resetButton}
          >
            Send Reset Link
          </Button>

          {/* ✅ Display messages */}
          <p className={styles.message}>{message}</p>

          {/* ✅ Link to login page */}
          <p className={styles.footerText}>
            Remembered your password?{" "}
            <Link className="link--emphasis" href="/auth/login">
              Log in
            </Link>
          </p>
        </form>
      </div>
      <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
    </div>
  );
}
