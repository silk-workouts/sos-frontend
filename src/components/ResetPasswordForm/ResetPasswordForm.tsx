"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import leftArrow from "public/assets/icons/arrow-left.svg";
import Link from "next/link";
import whiteS from "public/assets/images/large-S-white-dropshad.svg";

import styles from "./ResetPasswordForm.module.scss";
import Button from "../ui/Button/Button";
import { isValidPassword, sanitizePassword } from "src/utils/authInputUtils";

type Props = {
  token: string;
  userId: string;
};

export default function ResetPasswordForm({ token, userId }: Props) {
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    // Sanitize the password
    const sanitizedPassword = sanitizePassword(password);

    const newErrors: { [key: string]: string } = {};

    // Validate
    if (!sanitizedPassword) {
      newErrors.password = "⚠️ Password is required.";
    } else if (!isValidPassword(sanitizedPassword)) {
      newErrors.password = "⚠️ Invalid password format";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, userId, newPassword: sanitizedPassword }),
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("Your password was reset!");
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } else {
        const data = await res.json();
        // setError(data.error || "Something went wrong. Please try again.");
        setErrors({ general: data.error || "Something went wrong." });
      }
    } catch (err) {
      console.error("❌ An error occurred:", err);
      // setError("An unexpected error occurred.");
      setErrors({ general: "An unexpected error occurred." });
    }
  };

  return (
    <div className={styles.resetContainer}>
      {/* Left panel with info */}
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
        {/* <h1 className={styles.title}>Reset Your Password</h1>
        // <p className={styles.subtitle}>
        //   Choose a new password below to get back into your account.
        // </p> */}
      </div>

      {/* Right panel with form */}
      <div className={styles.panelRight}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className={styles.resetForm}
        >
          <h1 className={`${styles.heading} authForm`}>Reset Password</h1>

          <div className={styles.inputGroup}>
            <label htmlFor="password">New Password</label>
            <div className={styles.tooltipContainer}>
              <input
                ref={inputRef}
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                required
                aria-describedby="passwordTooltip"
              />
              <span className={styles.tooltip} id="passwordTooltip">
                Password must be at least 8 characters, contain one uppercase
                letter, one lowercase letter, and one number.
              </span>
              {errors.password && (
                <span className={styles.errorMessage}>{errors.password}</span>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="secondary"
            className={styles.resetButton}
          >
            Reset Password
          </Button>

          {success && (
            <p className={styles.message}>Success! Redirecting to login...</p>
          )}
        </form>
      </div>
      <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
    </div>
  );
}
