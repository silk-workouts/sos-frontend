"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import whiteS from "public/assets/images/large-S-white-dropshad.svg";
import leftArrow from "public/assets/icons/arrow-left.svg";
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
        setMessage(
          `❌ ${data.error || "Verification failed, please contact support."}`
        );
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className={styles.verifyContainer}>
      <div className={styles["verifyContainer-wrapper"]}>
        {/* ✅ Left panel with branding */}
        <div className={styles.panelLeft}>
          <Link href="/" className={styles.backLink} aria-label="Navigate back">
            <Image src={leftArrow} alt="" aria-hidden="true" />
            <span>Back to Site</span>
          </Link>
          <Image
            className={styles.panelLeft__img}
            src={whiteS}
            alt="small S for silk logo"
          />
        </div>

        {/* ✅ Right panel containing the verification message */}
        <div className={styles.panelRight}>
          <h1 className={`authForm ${styles.heading}`}>Verification Status</h1>
          <div className={styles.verifyMessage}>
            <p className={styles.message}>{message}</p>
            <Button
              onClick={() => router.push("/auth/login")}
              variant="tertiary"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
