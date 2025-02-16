import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion, // ✅ Use explicit type
});

console.log(stripe);

export async function GET() {
  // Instead of accessing _prevApiVersion or _api, retrieve it from Stripe config
  return NextResponse.json({ stripeApiVersion: stripe.apiVersion });
}
