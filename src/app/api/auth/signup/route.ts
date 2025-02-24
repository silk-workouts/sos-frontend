import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader } from 'mysql2';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

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

    // ✅ Generate UUID for user ID
    const userId = randomUUID();

    // ✅ Check if email already exists
    const [existingUser] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if ((existingUser as any[]).length > 0) {
      console.error(`❌ Email already exists: ${email}`);
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = randomUUID();

    // ✅ Insert new user and cast result as ResultSetHeader
    await pool.execute<ResultSetHeader>(
      'INSERT INTO users (id, email, password, verification_token) VALUES (?, ?, ?, ?)',
      [userId, email, hashedPassword, verificationToken]
    );

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
