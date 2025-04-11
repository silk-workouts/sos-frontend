"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import styles from "./page.module.scss";

export default function StripeSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    async function finalizeStripePayment() {
      if (!sessionId) return;

      try {
        // Optional: Verify or finalize session
        await axios.post("/api/stripe/finalize", { sessionId });
      } catch (err) {
        console.error("Error finalizing Stripe session:", err);
      }

      // After processing, redirect to dashboard
      router.replace("/dashboard");
    }

    finalizeStripePayment();
  }, [sessionId, router]);

  return (
    <div className={styles.subscribeSuccess}>
      <h1>Finishing up your subscription...</h1>
    </div>
  );
}
