import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 }
    );
  }

  let event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error(`❌ Webhook verification failed: ${err}`);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const stripeCustomerId = session.customer as string;

        if (!stripeCustomerId) {
          console.error('❌ Missing Stripe Customer ID in checkout session.');
          return NextResponse.json(
            { error: 'Invalid session data' },
            { status: 400 }
          );
        }

        // Update user in the database
        const result = await db.execute(
          'UPDATE users SET is_paid_user = 1 WHERE stripe_customer_id = ?',
          [stripeCustomerId]
        );

        console.log('✅ Payment successful, user updated:', result);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const stripeCustomerId = invoice.customer as string;

        if (!stripeCustomerId) {
          console.error('❌ Missing Stripe Customer ID in invoice event.');
          return NextResponse.json(
            { error: 'Invalid invoice data' },
            { status: 400 }
          );
        }

        // Ensure user remains active after recurring payment
        const result = await db.execute(
          'UPDATE users SET is_paid_user = 1 WHERE stripe_customer_id = ?',
          [stripeCustomerId]
        );

        console.log(
          '✅ Recurring payment received, user remains active:',
          result
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer as string;

        if (!stripeCustomerId) {
          console.error(
            '❌ Missing Stripe Customer ID in subscription deletion event.'
          );
          return NextResponse.json(
            { error: 'Invalid subscription data' },
            { status: 400 }
          );
        }

        // Mark user as not paid
        const result = await db.execute(
          'UPDATE users SET is_paid_user = 0 WHERE stripe_customer_id = ?',
          [stripeCustomerId]
        );

        console.log('✅ Subscription canceled, user downgraded:', result);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
