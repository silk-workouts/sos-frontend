import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    console.log('📩 Received signup request...');

    // Read request body as text first
    const rawBody = await req.text();
    console.log('📜 Raw request body:', rawBody);

    // Validate JSON input
    if (!rawBody) {
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }

    const { email, password } = JSON.parse(rawBody);
    console.log('✅ Parsed JSON:', { email, password });

    // Ensure email and password are provided
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = randomUUID();

    console.log('🔐 Hashing password and generating verification token...');

    const result = await db.execute(
      'INSERT INTO users (email, password, verification_token) VALUES (?, ?, ?)',
      [email, hashedPassword, verificationToken]
    );

    console.log('✅ User inserted into database', result);

    const userId = result.insertId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    console.log('📩 Returning signup response:', { email, verificationToken });

    return NextResponse.json({
      message: 'User registered successfully!',
      email, // ✅ Ensure email is returned
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
