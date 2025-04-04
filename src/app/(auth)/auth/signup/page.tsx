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
import leftArrow from "public/assets/icons/arrow-left.svg";
import Button from "@/components/ui/Button/Button";
import Link from "next/link";
import styles from "./page.module.scss";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault(); // ✅ Prevent form from reloading the page

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email.trim());
    const sanitizedPassword = sanitizePassword(password);

    // Validate inputs
    if (!sanitizedEmail || !sanitizedPassword) {
      toast.error("Email and password are required!");
      return;
    }

    if (!isValidEmail(sanitizedEmail)) {
      toast.error("Invalid email format.");
      return;
    }

    if (!isValidPassword(sanitizedPassword)) {
      toast.error(
        "Password must be at least 8 characters, contain one uppercase letter, one lowercase letter, and one number."
      );

      return;
    }

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
        toast.error("This email is already registered. Please log in.");
      } else {
        console.error("❌ Signup failed:", data);
        toast.error(data.error || "Signup failed.");
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
          <Image src={leftArrow} alt="" aria-hidden="true" />
          <span>Back to Site</span>
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
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
          </div>

          {/* ✅ Sign Up button */}
          <Button type="submit" variant="secondary">
            Sign Up
          </Button>
        </form>
      </div>
      <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
    </div>
  );
}
