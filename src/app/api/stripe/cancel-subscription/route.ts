import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ResultSetHeader } from "mysql2";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const { reason } = await req.json();
    const canceledAt = new Date(); // Capture current timestamp

    console.log("📌 Received cancellation request. Reason:", reason);

    // ✅ Retrieve the user's authentication token from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ ERROR: Missing or invalid auth token");
      return NextResponse.json(
        { error: "Unauthorized - No valid token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1]; // Extract token
    let userId;
    try {
      const decoded = verifyToken(token); // Decode JWT
      userId = decoded.id;
    } catch (err) {
      console.error("❌ ERROR: Invalid token:", err);
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    console.log(`✅ Verified user: ${userId}`);

    // ✅ Get the user from the database
    const [user] = (await pool.execute(
      "SELECT stripe_customer_id FROM users WHERE id = ?",
      [userId]
    )) as [{ stripe_customer_id: string }[], any];

    if (!user || !user.length || !user[0].stripe_customer_id) {
      console.error("❌ ERROR: No Stripe Customer ID found for user");
      return NextResponse.json(
        { error: "No associated Stripe customer" },
        { status: 400 }
      );
    }

    const stripeCustomerId = user[0].stripe_customer_id;
    console.log(`✅ User's Stripe Customer ID: ${stripeCustomerId}`);

    // ✅ Get the user's active subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
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
      const [result] = (await pool.execute(
        "UPDATE users SET cancellation_reason = ?, canceled_at = ? WHERE id = ?",
        [reason, canceledAt, userId]
      )) as [ResultSetHeader, any]; // ✅ Explicitly cast to ResultSetHeader

      if (result.affectedRows === 0) {
        console.error(
          `❌ ERROR: Failed to update cancellation info for user ${userId}`
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
