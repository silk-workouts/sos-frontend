"use client";
import { useState } from "react";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import styles from "./page.module.scss";
import Button from "@/components/ui/Button/Button";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault(); // ✅ Prevent form from reloading the page

    if (!email || !password) {
      setMessage("Email and password are required!");
      return;
    }

    try {
      console.log("🛠️ Attempting signup...");

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        await sendVerificationEmail(data.email, data.verificationToken);

        // Clear form fields after successful signup
        setEmail("");
        setPassword("");

        setMessage(
          "Signup successful! Check your email (including SPAM folder) for verification."
        );
      } else {
        console.error("❌ Signup failed:", data);
        setMessage(data.error || "Signup failed.");
      }
    } catch (error) {
      console.error("❌ Unexpected error:", error);
      setMessage("An error occurred.");
    }
  }

  return (
    <div className={styles.signupContainer}>
      {/* ✅ Left panel with signup information */}
      <div className={styles.panelLeft}>
        <Link href="/" className={styles.backLink}>
          Back to Site
        </Link>
        <h1 className={styles.title}>Join System of Silk</h1>
      </div>

      {/* ✅ Right panel containing the signup form */}
      <div className={styles.panelRight}>
        <form onSubmit={handleSignup} className={styles.signupForm}>
          <h1 className={styles.heading}>Create an Account</h1>
          <p className={styles.subtitle}>
            Already have an account?{" "}
            <Link className="link--emphasis" href="/auth/login">
              Login
            </Link>
          </p>
          {/* ✅ Email input field */}
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* ✅ Password input field */}
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* ✅ Sign Up button */}
          <Button type="submit" variant="secondary">
            Sign Up
          </Button>

          {/* ✅ Display messages */}
          <p className={styles.message}>{message}</p>
        </form>
      </div>
    </div>
  );
}
