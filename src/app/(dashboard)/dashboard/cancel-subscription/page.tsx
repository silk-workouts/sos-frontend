"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss"; // Import SCSS styles

export default function CancelSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleCancel = async () => {
    setIsLoading(true);

    const response = await fetch("/api/stripe/cancel-subscription", {
      method: "POST",
      body: JSON.stringify({ reason }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      alert(
        "Your subscription has been canceled. You will still have access until the end of your billing cycle."
      );
      router.push("/dashboard/profile");
    } else {
      alert("Failed to cancel. Please try again or contact support.");
    }

    setIsLoading(false);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Are you sure you want to cancel?</h2>
      <p className={styles.description}>
        Your subscription will remain active until the end of your current
        billing cycle.
      </p>

      <label className={styles.label}>
        Why are you canceling? (Optional)
        <textarea
          className={styles.textarea}
          placeholder="Your feedback helps us improve."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>

      <div className={styles.buttonContainer}>
        <button
          className={styles.cancelButton}
          onClick={handleCancel}
          disabled={isLoading}
        >
          {isLoading ? "Canceling..." : "Confirm Cancellation"}
        </button>

        <button
          className={styles.keepButton}
          onClick={() => router.push("/dashboard/profile")}
        >
          Keep Subscription
        </button>
      </div>

      <p className={styles.supportText}>
        Need help?{" "}
        <a href="/contact" className={styles.supportLink}>
          Contact support
        </a>
        .
      </p>
    </div>
  );
}
