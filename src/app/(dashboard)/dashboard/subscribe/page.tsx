"use client";
import { useState } from "react";

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
    <div>
      <h1>Subscribe to Access Premium Content</h1>
      <p>You must be a paid user to access this content.</p>
      <button onClick={handleSubscribe} disabled={loading}>
        {loading ? "Redirecting..." : "Subscribe Now"}
      </button>
    </div>
  );
}
