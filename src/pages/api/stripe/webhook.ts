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

  // Handle the event (e.g. checkout.session.completed)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("🎉 Checkout completed:", session);
    // Do your DB stuff here
  }

  return res.json({ received: true });
}
