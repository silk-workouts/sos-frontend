import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import pool from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export const config = {
  api: {
    bodyParser: false, // ✅ Critical: Ensures we receive the raw body from Stripe
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
    // ✅ Convert the request to a raw buffer (Stripe expects this format)
    const rawBody = await req.text();

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("✅ Webhook verified successfully.");
  } catch (err: any) {
    console.error(`❌ Webhook verification failed: ${err.message}`);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const stripeCustomerId = session.customer as string;

        if (!stripeCustomerId) {
          console.error("❌ Missing Stripe Customer ID in checkout session.");
          return NextResponse.json(
            { error: "Invalid session data" },
            { status: 400 }
          );
        }

        // ✅ Log user before update
        const [user] = (await pool.execute(
          "SELECT id FROM users WHERE stripe_customer_id = ?",
          [stripeCustomerId]
        )) as [{ id: string }[], any];

        if (!user.length) {
          console.error(
            `❌ No user found with Stripe Customer ID: ${stripeCustomerId}`
          );
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        // ✅ Update user in the database
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
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer as string;
        const cancelAt = subscription.current_period_end;

        if (!stripeCustomerId) {
          console.error(
            "❌ Missing Stripe Customer ID in subscription deletion event."
          );
          return NextResponse.json(
            { error: "Invalid subscription data" },
            { status: 400 }
          );
        }

        // ✅ Ensure user is not locked out early
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (cancelAt > currentTimestamp) {
          console.log(
            `🕒 User ${stripeCustomerId} still has access until ${new Date(
              cancelAt * 1000
            ).toISOString()}`
          );
          return NextResponse.json({
            message:
              "Subscription is canceled but still active until period end.",
          });
        }

        // ❌ Only now should we mark them as not paid
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
