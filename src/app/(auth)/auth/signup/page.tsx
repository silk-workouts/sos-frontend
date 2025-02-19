"use client";
import { useState } from "react";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import styles from "./page.module.scss";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault(); // ✅ Prevent form from reloading the page

    let newErrors: { [key: string]: string } = {};
    if (!firstName) newErrors.firstName = "⚠️ Required";
    if (!lastName) newErrors.lastName = "⚠️ Required";
    if (!email) newErrors.email = "⚠️ Required";
    if (!password) newErrors.password = "⚠️ Required";
    if (!confirmPassword) newErrors.confirmPassword = "⚠️ Required";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "⚠️ Passwords do not match!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      console.log("🛠️ Attempting signup...");

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        await sendVerificationEmail(data.email, data.verificationToken); // ✅ Sends email verification
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setMessage(
          "✅ Signup successful! Check your email (including SPAM folder) for verification."
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
      {/* ✅ Left panel with navigation */}
      <div className={styles.panelLeft}>
        <Link href="/" className={styles.backLink}>
          ⬅️ Back to Site
        </Link>
        <h1 className={styles.title}>Become a part of the System of Silk</h1>
      </div>

      {/* ✅ Right panel containing the signup form */}
      <div className={styles.panelRight}>
        <form onSubmit={handleSignup} className={styles.signupForm}>
          {/* ✅ Link to login for existing users */}
          <p className={styles.footerText}>
            Already have an account?{" "}
            <Link className="link--emphasis" href="/login">
              Log in
            </Link>
          </p>
          {/* <h1 className={styles.heading}>Sign Up</h1> */}

          {[
            "firstName",
            "lastName",
            "email",
            "password",
            "confirmPassword",
          ].map((field) => (
            <div className={styles.inputGroup} key={field}>
              <label>{field.replace(/([A-Z])/g, " $1").trim()}</label>
              <input
                type={field.includes("password") ? "password" : "text"}
                placeholder={`Enter your ${field
                  .replace(/([A-Z])/g, " $1")
                  .trim()
                  .toLowerCase()}`}
                value={eval(field)}
                onChange={(e) =>
                  eval(`set${field.charAt(0).toUpperCase() + field.slice(1)}`)(
                    e.target.value
                  )
                }
                required
              />
              {errors[field] && (
                <span className={styles.errorMessage}>{errors[field]}</span>
              )}
            </div>
          ))}

          {/* ✅ Signup button using the tertiary variant */}
          <Button
            type="submit"
            variant="secondary"
            className={styles.signupButton}
          >
            Start 7-Day Free Trial
          </Button>

          {/* ✅ Display messages */}
          <p className={styles.message}>{message}</p>
        </form>
      </div>
    </div>
  );
}
