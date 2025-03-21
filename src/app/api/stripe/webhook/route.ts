import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { buffer } from "micro"; // You'll likely need this or a similar library for Next.js
import crypto from "crypto"; // For manual signature comparison

console.log(`Node.js version: ${process.version}`);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export const config = {
  api: {
    bodyParser: false, // Important: Disable Next.js body parsing
  },
};

export async function POST(req: NextRequest) {
  console.log("📌 STRIPE WEBHOOK HIT");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET is not defined!");
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not defined" },
      { status: 500 }
    );
  }

  let event;
  let signature;
  let rawBodyBuffer: Buffer;
  let rawBodyText: string;
  let timestamp: string | null = null;
  let v1Signature: string | null = null;

  try {
    // 1. Get the raw body
    rawBodyBuffer = await buffer(req as any); // Next.js 'req' type may need casting
    rawBodyText = rawBodyBuffer.toString();
    console.log("📌 RAW BODY:", rawBodyText);

    // 2. Get the Stripe signature header
    signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("❌ Missing Stripe signature header");
      return NextResponse.json(
        { error: "Missing Stripe signature header" },
        { status: 400 }
      );
    }

    // Extract timestamp and v1 signature manually for logging and manual comparison
    const signatureParts = signature.split(",");
    const timestampPart = signatureParts.find((part) => part.startsWith("t="));
    const v1SignaturePart = signatureParts.find((part) =>
      part.startsWith("v1=")
    );

    if (timestampPart && v1SignaturePart) {
      timestamp = timestampPart.substring(2); // Remove "t="
      v1Signature = v1SignaturePart.substring(3); // Remove "v1="
      console.log("📌 Extracted Timestamp:", timestamp);
      console.log("📌 Extracted v1Signature:", v1Signature);
    } else {
      console.error("❌ Could not extract timestamp or v1 signature manually.");
    }

    // 3. Construct the event using Stripe's library
    event = stripe.webhooks.constructEvent(
      rawBodyBuffer,
      signature,
      webhookSecret
    );

    console.log("✅ Webhook verified successfully. Event type:", event.type);

    // 4. Manually compare signatures (for verification purposes)
    if (timestamp && v1Signature) {
      const payload = `${timestamp}.${rawBodyText}`;
      const computedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(payload, "utf8")
        .digest("hex");

      // Adjusted logging to match original output
      console.log("📌 Computed Signature:", computedSignature);
      console.log("📌 Signature from Stripe:", v1Signature);

      if (computedSignature !== v1Signature) {
        console.error(
          "❌ Signature Mismatch! Computed signature does not match Stripe's."
        );
      } else {
        console.log("✅ Manual Signature Match!");
      }
    }
  } catch (err) {
    let errorMessage = "Webhook Error";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    console.error("❌ Webhook verification failed:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  // Now you can safely use the 'event' object
  // Example:
  if (event.type === "checkout.session.completed") {
    // Handle checkout session completed event
    console.log("💰 Checkout Session Completed:", event.data.object);
    // ... your logic here
  }

  return NextResponse.json({ received: true });
}
