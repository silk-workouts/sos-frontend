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
