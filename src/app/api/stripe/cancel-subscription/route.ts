import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { ResultSetHeader } from "mysql2";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { reason } = await req.json();
    const canceledAt = new Date();

    console.log("📌 Received cancellation request. Reason:", reason);

    // ✅ Retrieve the auth token from cookies
    const tokenCookie = req.cookies.get("auth_token");
    const token = tokenCookie?.value;

    if (!token) {
      console.error("❌ ERROR: Missing auth token in cookies");
      return NextResponse.json(
        { error: "Unauthorized - No valid token provided" },
        { status: 401 }
      );
    }

    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
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

    // ✅ Immediately cancel the subscription
    await stripe.subscriptions.cancel(subscription.id);

    console.log("✅ Subscription was canceled immediately");

    // ✅ Store cancellation reason, timestamp, and mark user as NOT paid in the database
    console.log("📌 Updating database with cancellation details...");
    try {
      const [result] = (await pool.execute(
        "UPDATE users SET is_paid_user = 0, cancellation_reason = ?, canceled_at = ? WHERE id = ?",
        [reason, canceledAt, userId]
      )) as [ResultSetHeader, any];

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
