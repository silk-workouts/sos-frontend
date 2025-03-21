import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import crypto from "crypto";

console.log(`Node.js version: ${process.version}`);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  console.log("📌 STRIPE WEBHOOK HIT");

  function getStripeSignatureAndTimestamp(headers: Headers) {
    const sigHeader = headers.get("stripe-signature");
    if (!sigHeader) return null;

    const parts = sigHeader.split(",");
    const timestampPart = parts.find((part) => part.startsWith("t="));
    const v1SignaturePart = parts.find((part) => part.startsWith("v1="));

    if (!timestampPart || !v1SignaturePart) return null;

    const timestamp = timestampPart.substring(2); // Remove "t="
    const v1Signature = v1SignaturePart.substring(3); // Remove "v1="

    return { timestamp, v1Signature };
  }

  console.log(
    "📌 FULL HEADERS RECEIVED FROM STRIPE:",
    JSON.stringify(Object.fromEntries(req.headers), null, 2)
  );

  const sigData = getStripeSignatureAndTimestamp(req.headers);
  console.log("📌 Extracted Signature Data:", sigData);

  if (!sigData) {
    console.error("❌ Missing or invalid Stripe signature");
    return NextResponse.json(
      { error: "Missing or invalid Stripe signature" },
      { status: 400 }
    );
  }

  let rawBodyText;
  let rawBodyBuffer;
  try {
    rawBodyText = await req.text();
    rawBodyBuffer = Buffer.from(rawBodyText, "utf8"); // Explicitly use utf8
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
    const payload = `${sigData.timestamp}.${rawBodyText}`;

    const computedSignature = crypto
      .createHmac("sha256", expectedSecret)
      .update(payload, "utf8")
      .digest("hex");

    console.log("📌 Computed Signature:", computedSignature);
    console.log("📌 Signature from Stripe:", sigData.v1Signature);

    if (computedSignature !== sigData.v1Signature) {
      console.error(
        "❌ Signature Mismatch! Computed signature does not match Stripe's."
      );
    }
  } catch (error) {
    console.error("❌ Error computing signature manually:", error);
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBodyBuffer,
      sigData.v1Signature, // Use v1 signature
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
