// this component is needed b/c useSearchParams() is needed as part of the sucess process
// but it's parent is a static route that Next.js won't allow usage of useSearchParams() in

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

    router.replace("/dashboard");
  }, [searchParams, router]);

  return null; // or a loading spinner if you want
}
