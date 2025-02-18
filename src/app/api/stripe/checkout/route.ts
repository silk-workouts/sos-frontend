import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export async function POST(req: NextRequest) {
  console.log('🔄 Incoming request to Stripe checkout API');
  try {
    const tokenCookie = req.cookies.get('auth_token');
    console.log('🍪 Token Cookie:', tokenCookie);
    const token = tokenCookie?.value;

    if (!token) {
      console.error('❌ No auth token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔑 Verifying JWT Token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    console.log('✅ Decoded JWT:', decoded);

    const userId = decoded.id;
    console.log('🆔 User ID:', userId);

    // ✅ Fix: Properly extract rows from the database result
    const result = await db.execute(
      'SELECT email, stripe_customer_id FROM users WHERE id = ?',
      [userId]
    );

    console.log('📊 Raw Database Response:', result);

    const rows = (
      result as unknown as {
        rows: Array<{ email: string; stripe_customer_id: string | null }>;
      }
    ).rows;

    // ✅ Check if a user was found
    if (!rows || rows.length === 0) {
      console.error('❌ No user found with this ID:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = rows[0] as {
      email: string;
      stripe_customer_id: string | null;
    };

    // ✅ Ensure user is properly defined before accessing properties
    if (!user || !user.email) {
      console.error('❌ User data is invalid or missing email.');
      return NextResponse.json({ error: 'Invalid user data' }, { status: 500 });
    }

    // If user doesn't have a Stripe Customer ID, create one
    let stripeCustomerId = user.stripe_customer_id;
    if (!stripeCustomerId) {
      console.log('🆕 Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: user.email,
      });

      stripeCustomerId = customer.id;
      console.log('✅ Stripe Customer Created:', stripeCustomerId);

      // ✅ Store Stripe Customer ID in the database
      await db.execute('UPDATE users SET stripe_customer_id = ? WHERE id = ?', [
        stripeCustomerId,
        userId,
      ]);

      console.log('✅ Stripe customer ID saved:', stripeCustomerId);
    }

    console.log('💳 Creating Stripe Checkout Session...');

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          price: 'plan_Pr3EoR7dvIAlN7', // Replace with Stripe Price ID or plan ID
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?refresh=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    console.log('✅ Stripe Checkout Session Created:', session.url);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('❌ Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
