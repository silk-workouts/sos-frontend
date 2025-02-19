import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // ✅ Fetch user from database
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

    // ✅ Check if user is verified
    if (!user.is_verified) {
      return NextResponse.json(
        { error: 'Email not verified' },
        { status: 401 }
      );
    }

    // ✅ Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // ✅ Load environment variables
    const JWT_SECRET = process.env.JWT_SECRET;
    const APP_ENV = process.env.APP_ENV || 'local';
    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelop = APP_ENV === 'develop';

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

    // ✅ Set secure cookie based on environment
    const response = NextResponse.json({ message: 'Login successful' });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // ✅ Development-specific logging
    if (isDevelop) {
      console.log('🛠 Running in "develop" environment.');
      console.log(`👤 Logged in user: ${user.email}`);
      console.log(`🔑 JWT Token: ${token}`);
    }

    return response;
  } catch (error) {
    console.error('⚠️ Login Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
