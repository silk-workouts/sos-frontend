import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Define a TypeScript type for the user
interface User {
  id: string;
  is_verified: boolean;
}

// Function to safely extract query results
async function getUserByToken(token: string): Promise<User | null> {
  const result = await db.execute(
    'SELECT id, is_verified FROM users WHERE verification_token = ?',
    [token]
  );

  // Fix: Ensure TypeScript knows the correct result structure
  const rows = result as unknown as { rows: User[] };

  return rows.rows.length > 0 ? rows.rows[0] : null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Missing verification token' },
      { status: 400 }
    );
  }

  const user = await getUserByToken(token);

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 400 }
    );
  }

  if (user.is_verified) {
    return NextResponse.json({ message: 'Email already verified' });
  }

  // Mark user as verified
  await db.execute(
    'UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?',
    [user.id]
  );

  return NextResponse.json({ message: 'Email verified successfully' });
}
