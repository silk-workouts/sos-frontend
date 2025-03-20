import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  try {
    const { reason } = await req.json();

    // Retrieve the logged-in user's Stripe customer ID
    const user = await getUserFromSession(req);
    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get the user's active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "active",
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    const subscription = subscriptions.data[0];

    // Cancel at the end of the billing cycle
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    // Optionally: Store the reason for cancellation in the database
    await saveCancellationReason(user.id, reason);

    return NextResponse.json({ message: "Subscription canceled successfully" });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Simulated function to get user session
async function getUserFromSession(req: Request) {
  return {
    id: "user_123",
    stripeCustomerId: "cus_ABC123",
  };
}

// Simulated function to save the cancellation reason
async function saveCancellationReason(userId: string, reason: string) {
  console.log(`User ${userId} canceled with reason: ${reason}`);
}
