import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Read request body as text first
    const rawBody = await req.text();

    // Validate JSON input
    if (!rawBody) {
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }

    const { email, password } = JSON.parse(rawBody);

    // Ensure email and password are provided
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = randomUUID();

    const result = await db.execute(
      'INSERT INTO users (email, password, verification_token) VALUES (?, ?, ?)',
      [email, hashedPassword, verificationToken]
    );

    const userId = result.insertId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User registered successfully!',
      email, //  Ensure email is returned
      verificationToken,
    });
  } catch (error) {
    console.error('❌ Signup Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
