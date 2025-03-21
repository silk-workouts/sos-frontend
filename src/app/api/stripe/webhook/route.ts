import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import crypto from "crypto"; // ⬅️ Added for manual signature verification
import pool from "@/lib/db";

console.log(`Node.js version: ${process.version}`);

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2023-10-16",
// });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any, // Loosen type enforcement
});

export const config = {
  api: {
    bodyParser: false, // ✅ Ensures raw body is passed to Stripe
  },
};

export async function POST(req: NextRequest) {
  console.log("📌 STRIPE WEBHOOK HIT");

  function getStripeSignature(headers: Headers) {
    const sigHeader = headers.get("stripe-signature");
    if (!sigHeader) return null;

    const v1Signature = sigHeader
      .split(",")
      .find((part) => part.startsWith("v1="));
    return v1Signature ? v1Signature.substring(3) : null;
  }

  console.log(
    "📌 FULL HEADERS RECEIVED FROM STRIPE:",
    JSON.stringify(Object.fromEntries(req.headers), null, 2)
  );

  const sig = getStripeSignature(req.headers);
  console.log("📌 Extracted Stripe Signature (v1 only):", sig);

  if (!sig) {
    console.error("❌ Missing Stripe signature");
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let rawBodyText;
  let rawBodyBuffer;
  try {
    rawBodyText = await req.text(); // Read raw request body
    rawBodyBuffer = Buffer.from(rawBodyText); // Convert text to Buffer
    console.log("📌 RAW BODY TEXT:", rawBodyText);
    console.log(
      "📌 RAW BODY AS BUFFER (hex format):",
      rawBodyBuffer.toString("hex")
    );
    console.log("📌 EXPECTED SECRET:", process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("❌ Error reading raw body:", error);
    return NextResponse.json({ error: "Failed to read body" }, { status: 400 });
  }

  // **Manually Compute Signature for Debugging**
  try {
    const expectedSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const timestamp = sig.split(",")[0].split("=")[1]; // Extract timestamp from signature
    const payload = `${timestamp}.${rawBodyText}`; // Stripe's expected payload format

    const computedSignature = crypto
      .createHmac("sha256", expectedSecret)
      .update(payload, "utf8")
      .digest("hex");

    console.log("📌 Computed Signature:", computedSignature);
    console.log("📌 Signature from Stripe:", sig);

    if (sig !== computedSignature) {
      console.error(
        "❌ Signature Mismatch! The computed signature does not match the one from Stripe."
      );
    }
  } catch (error) {
    console.error("❌ Error computing signature manually:", error);
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBodyBuffer, // ✅ Pass buffer to match Stripe's verification
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
