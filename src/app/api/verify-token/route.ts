import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth'; // ✅ Your existing function is used here

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({ userId: decoded.id });
  } catch (error) {
    console.error(`Error: ${error}`);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
