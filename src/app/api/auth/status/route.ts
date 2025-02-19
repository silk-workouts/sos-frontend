import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
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

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };

    return NextResponse.json(
      { isAuthenticated: true, userId: decoded.id, email: decoded.email },
      { status: 200 }
    );
  } catch (error) {
    console.warn('⚠️ Auth Status Error:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  }
}
