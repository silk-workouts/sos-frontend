"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import styles from "./ResetPasswordForm.module.scss";
import Button from "../ui/Button/Button";

type Props = {
  token: string;
  userId: string;
};

export default function ResetPasswordForm({ token, userId }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, userId, newPassword: password }),
    });

    if (res.ok) {
      setSuccess(true);
      toast.success("Your password was reset!");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong. Please try again.");
      toast.error(data.error || "Something went wrong.");
    }
  };

  return (
    <div className={styles.resetContainer}>
      {/* Left panel with info */}
      <div className={styles.panelLeft}>
        <h1 className={styles.title}>Reset Your Password</h1>
        <p className={styles.subtitle}>
          Choose a new password below to get back into your account.
        </p>
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
          <h1 className={styles.heading}>Enter New Password</h1>

          <div className={styles.inputGroup}>
            <label htmlFor="password">New Password</label>
            <input
              ref={inputRef}
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              required
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
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
    </div>
  );
}
