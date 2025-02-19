"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import styles from "./page.module.scss";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Verifying...");
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setMessage("❌ Invalid or missing verification token.");
        return;
      }

      const res = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Email verified! You can now log in.");
      } else {
        setMessage(`❌ ${data.error || "Verification failed."}`);
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className={styles.verifyContainer}>
      {/* ✅ Left panel with branding */}
      <div className={styles.panelLeft}>
        <Link href="/" className={styles.backLink}>
          ⬅️ Back to Site
        </Link>
        <h1 className={styles.title}>Email Verification</h1>
      </div>

      {/* ✅ Right panel containing the verification message */}
      <div className={styles.panelRight}>
        <div className={styles.verifyMessage}>
          <h1 className={styles.heading}>Verification Status</h1>
          <p className={styles.message}>{message}</p>
          <div className={styles.buttonContainer}>
            <Button
              onClick={() => router.push("/auth/login")}
              variant="secondary"
              className={styles.verifyButton}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
