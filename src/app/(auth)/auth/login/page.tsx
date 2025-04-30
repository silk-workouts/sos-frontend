"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import leftArrow from "public/assets/icons/arrow-left.svg";
import whiteS from "public/assets/images/large-S-white-dropshad.svg";
import loadingSpinner from "/public/assets/gifs/spinner.svg";
import eyeOpen from "public/assets/icons/eye.svg";
import eyeClosed from "public/assets/icons/eye-off.svg";
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
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email.trim());
    const sanitizedPassword = sanitizePassword(password);

    // Validate inputs
    const newErrors: { [key: string]: string } = {};
    if (!sanitizedEmail) newErrors.email = "⚠️ Email is required";
    if (!sanitizedPassword) newErrors.password = "⚠️ Password is required";

    if (!isValidEmail(sanitizedEmail)) {
      newErrors.email = "⚠️ Incorrect email";
    }

    if (!isValidPassword(sanitizedPassword)) {
      newErrors.password = "⚠️ Incorrect password";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      setIsLoggingIn(true);
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
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles["loginContainer-wrapper"]}>
        {/* ✅ Left panel with login options */}
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

        {/* ✅ Right panel containing the login form */}
        <div className={styles.panelRight}>
          <div className={styles.panelRight__header}>
            <h1 className="authForm">Welcome Back!</h1>
            <p className={styles.panelRight__subtitle}>
              <span> Don&#39;t have an account yet?</span>{" "}
              <span>
                <Link
                  className={`link--emphasis ${styles.panelRight__signupLink}`}
                  href="/auth/signup"
                >
                  Sign up
                </Link>
              </span>
            </p>
          </div>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles["loginForm__input-container"]}>
              {/* ✅ Email input field */}
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="tex†"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: "" });
                  }}
                  className={`${styles.input} ${
                    errors.email ? styles.error : ""
                  }`}
                />
                {errors.email && (
                  <span className={styles.errorMessage}>{errors.email}</span>
                )}
              </div>

              {/* ✅ Password input field */}
              <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <div className={styles["password-container"]}>
                  <input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors({ ...errors, password: "" });
                    }}
                    className={`${styles.input} ${
                      errors.password ? styles.error : ""
                    }`}
                  />
                  <button
                    type="button"
                    aria-label={
                      isPasswordVisible
                        ? "Hide password text"
                        : "Show password text"
                    }
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? (
                      <Image src={eyeOpen} alt="" aria-hidden="true" />
                    ) : (
                      <Image src={eyeClosed} alt="" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span
                    className={`${styles.errorMessage} ${styles.pwErrorMessage}`}
                  >
                    {errors.password}
                  </span>
                )}
                <Link
                  href="/auth/forgot-password"
                  className={`link--emphasis ${styles.forgotPassword}`}
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoggingIn}
              className={styles.button}
            >
              {" "}
              {isLoggingIn ? (
                <span>
                  <Image
                    src={loadingSpinner}
                    alt=""
                    width={20}
                    height={20}
                    aria-hidden="true"
                    className={styles.icon}
                  />
                  <span className={styles.button__buttonText}>Logging in</span>
                </span>
              ) : (
                <span className={styles.button__buttonText}>Log In</span>
              )}
            </Button>
          </form>
        </div>
        <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
      </div>
    </div>
  );
}
