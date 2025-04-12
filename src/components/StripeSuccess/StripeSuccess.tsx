"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

export default function StripeSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const sessionId = searchParams?.get("session_id") ?? "";

    if (!sessionId) return;

    (async () => {
      try {
        await axios.post("/api/stripe/finalize", { sessionId });
      } catch (err) {
        console.error("Error finalizing Stripe session:", err);
      }

      router.replace("/dashboard");
    })();
  }, [searchParams, router]);

  return null; // or a loading spinner if you want
}
