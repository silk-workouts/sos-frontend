import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const result = await db.execute('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    const rows = result as unknown as {
      rows: {
        id: string;
        email: string;
        password: string;
        is_verified: boolean;
      }[];
    };

    if (!rows.rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const user = rows.rows[0];

    if (!user.is_verified) {
      return NextResponse.json(
        { error: 'Email not verified' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.warn(
        '⚠️ Warning: JWT_SECRET is not defined in environment variables.'
      );
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // ✅ Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const isProduction = process.env.NODE_ENV === 'production';

    // ✅ Set cookie correctly based on environment
    const response = NextResponse.json({ message: 'Login successful' });

    response.cookies.set('auth_token', token, {
      httpOnly: isProduction, // ✅ True in production, false in dev for debugging
      secure: isProduction, // ✅ True in production (requires HTTPS), false in dev
      sameSite: 'strict', // ✅ CSRF protection while allowing normal navigation
      path: '/', // ✅ Available across the whole app
      maxAge: 7 * 24 * 60 * 60, // ✅ 7 days expiration
    });

    return response;
  } catch (error) {
    console.warn('⚠️ Login Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
