import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import pool from "@/lib/db";

console.log(`Node.js version: ${process.version}`);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export const config = {
  api: {
    bodyParser: false, // ✅ Ensures raw body is passed to Stripe
  },
};

export async function POST(req: NextRequest) {
  console.log("📌 STRIPE WEBHOOK HIT");

  // Log full headers to check if "stripe-signature" is missing
  console.log(
    "📌 FULL HEADERS RECEIVED FROM STRIPE:",
    JSON.stringify(Object.fromEntries(req.headers), null, 2)
  );

  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("❌ Missing Stripe signature");
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let rawBody;
  try {
    rawBody = await req.text();
    console.log("📌 RAW BODY RECEIVED FROM STRIPE:", rawBody);
    console.log("📌 SIGNATURE RECEIVED:", sig);
    console.log("📌 EXPECTED SECRET:", process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("❌ Error reading raw body:", error);
    return NextResponse.json({ error: "Failed to read body" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("✅ Webhook verified successfully. Event type:", event.type);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Webhook verification failed:", errorMessage);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  return NextResponse.json({ received: true });
}
