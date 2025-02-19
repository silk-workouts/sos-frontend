"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import styles from "./page.module.scss";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleForgotPassword(event: React.FormEvent) {
    event.preventDefault();

    if (!email) {
      setMessage("⚠️ Email is required!");
      return;
    }

    try {
      console.log("📩 Sending reset email...");

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Reset link sent! Check your email.");
      } else {
        setMessage(`❌ ${data.error || "Failed to send reset link."}`);
      }
    } catch (error) {
      setMessage("❌ An error occurred.");
    }
  }

  return (
    <div className={styles.forgotPasswordContainer}>
      {/* ✅ Left panel with branding */}
      <div className={styles.panelLeft}>
        <Link href="/" className={styles.backLink}>
          Back to Site
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
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
    </div>
  );
}
