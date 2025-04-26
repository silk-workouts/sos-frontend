"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import loadingSpinner from "/public/assets/gifs/spinner.svg";
import silkHeadshot from "/public/assets/images/silk_headshot_1_red_patch.png";
import Button from "@/components/ui/Button/Button";
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
      <section className={styles.container__modal}>
        {/* Display the uploaded image */}

        <Image
          src={silkHeadshot} // Ensure this is in your public folder or properly linked
          alt="Subscriber Access Required"
          width={400}
          height={400}
          className={styles.image}
        />

        <div className={styles.header}>
          <h1 className={styles.title}>Subscribe to Access Premium Content</h1>
          <p className={styles.description}>
            You must be a paid user to access this content.
          </p>
        </div>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            className={styles.subscribeButton}
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.loadingText}>
                <Image
                  src={loadingSpinner}
                  alt=""
                  width={20}
                  height={20}
                  aria-hidden="true"
                  className={styles.icon}
                />
                <span>redirecting</span>
              </span>
            ) : (
              <span>Subscribe Now</span>
            )}
          </Button>
          <div className={styles.links}>
            <Link
              href="/account/profile"
              className={`${styles.actions__link} link--emphasis`}
            >
              Account
            </Link>
            <Link href="/" className={`${styles.actions__link} link--emphasis`}>
              Main Site
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
