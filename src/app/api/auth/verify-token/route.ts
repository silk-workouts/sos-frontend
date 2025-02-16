import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

console.log('🟢 verify-token API loaded!');

export async function POST(req: NextRequest) {
  console.log('📩 Received request to verify token...');

  try {
    const { token } = await req.json();
    console.log('🔑 Token received:', token);

    if (!token) {
      console.log('❌ No token provided!');
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('❌ Invalid token!');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('✅ Token verified! User ID:', decoded.id);
    return NextResponse.json({ userId: decoded.id });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
