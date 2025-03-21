import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import pool from "@/lib/db";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
  console.error(
    "❌ Stripe secret keys are missing. Check your environment variables."
  );
  throw new Error("Missing Stripe keys");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia", // ✅ Fixed to match your project's version
});

// ✅ Ensures Next.js does not modify the webhook request body
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("❌ Missing Stripe signature");
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event;
  try {
    const rawBody = await req.body; // ✅ Ensure Stripe receives the raw request body

    event = stripe.webhooks.constructEvent(
      rawBody as any, // Stripe expects a raw buffer, not a parsed JSON object
      sig,
      STRIPE_WEBHOOK_SECRET
    );

    console.log("✅ Webhook verified successfully. Event type:", event.type);
  } catch (error: any) {
    console.error("❌ Webhook verification failed:", error.message);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  try {
    const eventData = event.data.object as any; // Type assertion

    switch (event.type) {
      case "checkout.session.completed":
      case "invoice.payment_succeeded": {
        const stripeCustomerId = eventData.customer as string;

        if (!stripeCustomerId) {
          console.error(
            `❌ Missing Stripe Customer ID in ${event.type} event.`
          );
          return NextResponse.json(
            { error: "Invalid event data" },
            { status: 400 }
          );
        }

        const [user] = (await pool.execute(
          "SELECT id FROM users WHERE stripe_customer_id = ?",
          [stripeCustomerId]
        )) as [{ id: string }[], any];

        if (!user.length) {
          console.error(
            `❌ No user found for Stripe Customer ID: ${stripeCustomerId}`
          );
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        const [result] = (await pool.execute(
          "UPDATE users SET is_paid_user = 1 WHERE stripe_customer_id = ?",
          [stripeCustomerId]
        )) as [{ affectedRows: number }, any];

        if (result.affectedRows === 0) {
          console.error(
            `❌ Failed to update user for customer ID: ${stripeCustomerId}`
          );
          return NextResponse.json(
            { error: "User not updated" },
            { status: 500 }
          );
        }

        console.log(`✅ User ${user[0].id} marked as paid.`);
        return NextResponse.json({ success: true });
      }

      case "customer.subscription.deleted": {
        const stripeCustomerId = eventData.customer as string;
        const cancelAt = eventData.current_period_end;

        if (!stripeCustomerId) {
          console.error(
            "❌ Missing Stripe Customer ID in subscription deletion event."
          );
          return NextResponse.json(
            { error: "Invalid subscription data" },
            { status: 400 }
          );
        }

        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (cancelAt > currentTimestamp) {
          console.log(
            `🕒 User ${stripeCustomerId} has access until ${new Date(
              cancelAt * 1000
            ).toISOString()}`
          );
          return NextResponse.json({
            message:
              "Subscription is canceled but user retains access until period end.",
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
          return NextResponse.json(
            { error: "User not updated" },
            { status: 500 }
          );
        }

        console.log(`✅ User ${stripeCustomerId} marked as unpaid.`);
        return NextResponse.json({ success: true });
      }

      default:
        console.warn(`⚠️ Unhandled event type: ${event.type}`);
        return NextResponse.json({ received: true });
    }
  } catch (error: any) {
    console.error("❌ Error processing webhook:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
