/**
 * ⚠️ IMPORTANT:
 * This route is placed inside `pages/api/` instead of `app/api/`
 * because Stripe requires access to the raw request body in order to verify webhook signatures.
 *
 * Next.js 13+ App Router automatically parses request bodies (even with `bodyParser: false`),
 * which breaks Stripe's `constructEvent()` verification method.
 *
 * Stripe sends the signature as a header (`stripe-signature`), and if the body is altered (parsed),
 * the signature check will fail with: ❌ "Webhook verification failed: No signatures found matching the expected signature for payload".
 *
 * Only `pages/api` routes support disabling body parsing in a way that preserves the raw stream.
 *
 * Related Stripe docs: https://stripe.com/docs/webhooks/signatures
 * Related Next.js issue: https://github.com/vercel/next.js/issues/49368
 */

import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import pool from "@/lib/db"; // ⬅️ Ensure this points to your MySQL (PlanetScale) pool

// for testing expected Stripe signature HMAC-SHA256
import { createHmac } from "crypto";

function computeExpectedSignature(
  secret: string,
  payload: string,
  timestamp: string
): string {
  const signedPayload = `${timestamp}.${payload}`;
  const hash = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");
  return `v1=${hash}`; // Include "v1=" prefix to match Stripe's format
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"] as string;

  let event;
  try {
    const rawBody = await buffer(req);

    // Extract timestamp and signature from the Stripe header
    const timestamp = sig.split(",")[0].split("=")[1];

    // Extract all signature versions (v1, v0, etc.) from the header
    // Extract all signature versions (v1, v0, etc.) from the header
    const signatures = sig
      .split(",")
      .reduce((acc: Record<string, string>, part) => {
        const [version, signature] = part.split("=");
        acc[version] = signature;
        return acc;
      }, {});

    // Retrieve the v1 signature for comparison (prioritize v1)
    const receivedSignature = signatures["v1"] || signatures["v0"]; // Fallback to v0 if v1 not available

    // Compute the expected signature
    const expectedSignature = computeExpectedSignature(
      process.env.STRIPE_WEBHOOK_SECRET!,
      rawBody.toString(),
      timestamp
    );

    // Logging the relevant information for comparison
    console.log("🔑 Stripe Signature Header:", sig);
    console.log("📅 Timestamp from Header:", timestamp);
    console.log("🔑 Received Signature:", receivedSignature);
    console.log("📝 Expected Signature:", expectedSignature);
    console.log("🔍 Raw body received:", rawBody.toString());

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("✅ Webhook verified. Type:", event.type);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Webhook verification failed:", msg);
    return res.status(400).send(`Webhook Error: ${msg}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const stripeCustomerId = session.customer as string;

      console.log("🎉 Checkout completed:", session);

      const [user] = (await pool.execute(
        "SELECT id FROM users WHERE stripe_customer_id = ?",
        [stripeCustomerId]
      )) as [{ id: string }[], any];

      if (!user.length) {
        console.error(
          `❌ No user found with Stripe Customer ID: ${stripeCustomerId}`
        );
        return res.status(404).json({ error: "User not found" });
      }

      const [result] = (await pool.execute(
        "UPDATE users SET is_paid_user = 1 WHERE stripe_customer_id = ?",
        [stripeCustomerId]
      )) as [{ affectedRows: number }, any];

      if (result.affectedRows === 0) {
        console.error(
          `❌ Failed to update user for customer ID: ${stripeCustomerId}`
        );
        return res.status(500).json({ error: "User not updated" });
      }

      console.log(`✅ User ${user[0].id} marked as paid.`);
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const stripeCustomerId = subscription.customer as string;
      const cancelAt = subscription.current_period_end;

      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (cancelAt > currentTimestamp) {
        console.log(
          `🕒 Subscription canceled but active until ${new Date(
            cancelAt * 1000
          ).toISOString()}`
        );
        return res.json({
          message: "Subscription canceled, but still active until period end.",
        });
      }

      const [result] = (await pool.execute(
        "UPDATE users SET is_paid_user = 0 WHERE stripe_customer_id = ?",
        [stripeCustomerId]
      )) as [{ affectedRows: number }, any];

      if (result.affectedRows === 0) {
        console.error(
          `❌ Failed to mark user as unpaid for customer ID: ${stripeCustomerId}`
        );
        return res.status(500).json({ error: "User not updated" });
      }

      console.log(`✅ User ${stripeCustomerId} marked as unpaid.`);
    }

    return res.json({ received: true });
  } catch (error: any) {
    console.error("❌ Error processing webhook:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
