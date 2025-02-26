import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import pool from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    console.error('❌ Missing Stripe signature');
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
    console.log('✅ Webhook verified successfully.');
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

        // ✅ Log user before update
        const [user] = (await pool.execute(
          'SELECT id, email, is_paid_user FROM users WHERE stripe_customer_id = ?',
          [stripeCustomerId]
        )) as [
          Array<{ id: string; email: string; is_paid_user: boolean }>,
          any
        ];

        if (!user || user.length === 0) {
          console.error(
            `❌ No user found with Stripe Customer ID: ${stripeCustomerId}`
          );
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        // ✅ Update user in the database
        const [result] = (await pool.execute(
          'UPDATE users SET is_paid_user = 1 WHERE stripe_customer_id = ?',
          [stripeCustomerId]
        )) as [{ affectedRows: number }, any];

        if (result.affectedRows === 0) {
          console.error(
            `❌ Failed to update user for customer ID: ${stripeCustomerId}`
          );
          return NextResponse.json(
            { error: 'User not updated' },
            { status: 404 }
          );
        }

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
        const [result] = (await pool.execute(
          'UPDATE users SET is_paid_user = 1 WHERE stripe_customer_id = ?',
          [stripeCustomerId]
        )) as [{ affectedRows: number }, any];

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
        const [result] = (await pool.execute(
          'UPDATE users SET is_paid_user = 0 WHERE stripe_customer_id = ?',
          [stripeCustomerId]
        )) as [{ affectedRows: number }, any];

        break;
      }

      default:
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }

  console.log('✅ Webhook processed successfully.');
  return NextResponse.json({ received: true });
}
