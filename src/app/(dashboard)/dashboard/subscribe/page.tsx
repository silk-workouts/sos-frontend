"use client";
import { useState } from "react";
import Image from "next/image";
import silkHeadshot from "/public/assets/images/silk_headshot_1.jpg";
import styles from "./page.module.scss";

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url; // Redirect to Stripe Checkout
    } else {
      alert("❌ Error starting subscription.");
    }
    setLoading(false);
  }

  return (
    <div className={styles.container}>
      {/* Display the uploaded image */}
      <div className={styles.imageWrapper}>
        <Image
          src={silkHeadshot} // Ensure this is in your public folder or properly linked
          alt="Subscriber Access Required"
          width={400}
          height={400}
          className={styles.image}
        />
      </div>

      <h1 className={styles.title}>Subscribe to Access Premium Content</h1>
      <p className={styles.description}>
        You must be a paid user to access this content.
      </p>

      <button
        className={styles.subscribeButton}
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading ? "Redirecting..." : "Subscribe Now"}
      </button>
    </div>
  );
}
