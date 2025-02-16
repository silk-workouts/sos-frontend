import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const [user] = await db.execute(
      "SELECT id FROM users WHERE verification_token = ?",
      [token]
    );

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
    }

    await db.execute(
      "UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = ?",
      [token]
    );

    return NextResponse.json({ message: "User verified successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
