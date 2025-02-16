import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  try {
    // ✅ Use full URL for API call
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-token`;

    const res = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const { userId } = await res.json();

    // ✅ Fetch user’s payment status from the database
    const result = await db.execute(
      'SELECT is_paid_user FROM users WHERE id = ?',
      [userId]
    );

    // ✅ Extract the rows property from the result
    const rows = (result as any).rows as { is_paid_user: number }[];

    // ✅ Extract the first user from the rows array
    const user = rows.length > 0 ? rows[0] : undefined;

    if (!user) {
      console.log('❌ No user found in database, redirecting to login...');
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Ensure is_paid_user is a boolean
    const isPaidUser = Boolean(user.is_paid_user);

    if (!isPaidUser) {
      if (req.nextUrl.pathname !== '/dashboard/subscribe') {
        console.log('🚫 User is not paid, redirecting to subscribe page...');
        return NextResponse.redirect(new URL('/dashboard/subscribe', req.url));
      } else {
        console.log('🛑 Already on subscribe page, not redirecting.');
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('❌ Middleware error:', error);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
