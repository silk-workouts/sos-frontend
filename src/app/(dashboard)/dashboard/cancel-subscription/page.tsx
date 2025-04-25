"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import loadingSpinner from "/public/assets/gifs/spinner.svg";
import Button from "@/components/ui/Button/Button";
import styles from "./page.module.scss"; // Import SCSS styles

export default function CancelSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const router = useRouter();

  const handleCancel = async () => {
    setIsLoading(true);

    const finalReason = reason === "Other" ? otherReason : reason;

    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        body: JSON.stringify({ reason: finalReason }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast.success(
          "Your subscription has been canceled. You will still have access until the end of your billing cycle.",
          { position: "top-center" }
        );
        setTimeout(() => {
          router.push("/account/profile");
        }, 1500);
      } else {
        toast.error("Failed to cancel. Please try again or contact support.");
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className={styles.container}>
      <section className={styles.container__modal}>
        <h1 className={styles.title}>Are you sure you want to cancel?</h1>
        <p className={styles.description}>
          Your subscription will remain active until the end of your current
          billing cycle.
        </p>

        <label className={styles.label} aria-labelledby="cancelReasons">
          Why are you canceling? (Optional)
        </label>

        <div className={styles.radioGroup} id="cancelReasons">
          {[
            "Outside of my budget",
            "Not Using It Enough",
            "Technical Issues",
            "Prefer a Different Service",
            "Temporary Pause",
            "Injury or Health Reasons",
          ].map((option) => (
            <label htmlFor={option} key={option} className={styles.radioLabel}>
              <input
                id={option}
                type="radio"
                name="reason"
                value={option}
                checked={reason === option}
                onChange={(e) => setReason(e.target.value)}
                className={styles.radioInput}
              />
              {option}
            </label>
          ))}

          {/* {reason === "Other" && (
            <textarea
              className={styles.textarea}
              placeholder="Let us know why"
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
            />
          )} */}
        </div>

        <div className={styles.buttonContainer}>
          <Button
            variant="text"
            onClick={() => router.push("/account/profile")}
            className={styles.keepButton}
          >
            Keep Subscription
          </Button>
          <Button
            type="submit"
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
            className={styles.cancelButton}
          >
            {isLoading ? (
              <span>
                <Image
                  src={loadingSpinner}
                  alt=""
                  width={20}
                  height={20}
                  aria-hidden="true"
                  className={styles.icon}
                />
                <span>Canceling</span>
              </span>
            ) : (
              <span>Confirm Cancellation</span>
            )}
          </Button>
        </div>

        <p className={styles.supportText}>
          Need help?{" "}
          <a href="/contact" className={styles.supportLink}>
            Contact support
          </a>
          .
        </p>
      </section>
    </div>
  );
}
