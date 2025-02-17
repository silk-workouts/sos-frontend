import { NextRequest, NextResponse } from 'next/server'; // ✅ Ensure correct import
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

// Define user type
interface User {
  id: string;
  email: string;
  password: string;
  is_verified: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Fix: Correctly type MySQL result
    const result = await db.execute('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    const rows = result as unknown as { rows: User[] };

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

    // Fix: Ensure JWT_SECRET is properly defined
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

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return NextResponse.json({ message: 'Login successful', token });
  } catch (error) {
    console.warn('⚠️ Login Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
