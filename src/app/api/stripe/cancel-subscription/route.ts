import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth"; // ✅ Import auth helper

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const { reason } = await req.json();
    const canceledAt = new Date(); // Capture current timestamp

    console.log("📌 Received cancellation request. Reason:", reason);

    // ✅ Retrieve the logged-in user's session
    const user = await getUserFromSession(req);
    if (!user || !user.stripeCustomerId) {
      console.error("❌ ERROR: User not authenticated or missing Stripe ID");
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    console.log(`✅ User authenticated: ${user.stripeCustomerId}`);

    // ✅ Get the user's active subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "active",
    });

    if (subscriptions.data.length === 0) {
      console.error("❌ ERROR: No active subscription found for customer");
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    const subscription = subscriptions.data[0];
    console.log(`✅ Found active subscription: ${subscription.id}`);

    // ✅ Cancel at the end of the billing cycle
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    console.log("✅ Subscription cancellation scheduled successfully");

    // ✅ Store cancellation reason & timestamp in the database
    console.log("📌 Updating database with cancellation reason...");
    try {
      const [result] = await pool.execute(
        "UPDATE users SET cancellation_reason = ?, canceled_at = ? WHERE stripe_customer_id = ?",
        [reason, canceledAt, user.stripeCustomerId]
      );

      if (result.affectedRows === 0) {
        console.error(
          `❌ ERROR: Failed to update cancellation info for ${user.stripeCustomerId}`
        );
        return NextResponse.json(
          { error: "Database update failed" },
          { status: 500 }
        );
      }
    } catch (dbError) {
      console.error("❌ DATABASE ERROR:", dbError);
      return NextResponse.json(
        { error: "Database update failed" },
        { status: 500 }
      );
    }

    console.log("✅ Cancellation reason stored in the database");
    return NextResponse.json({ message: "Subscription canceled successfully" });
  } catch (error) {
    console.error("❌ SERVER ERROR canceling subscription:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ✅ Get the real user session
async function getUserFromSession(req: Request) {
  const session = await getSession(req); // Uses real session-based authentication
  if (!session || !session.user) return null;

  return {
    id: session.user.id,
    stripeCustomerId: session.user.stripeCustomerId, // ✅ This should now be correct
  };
}
