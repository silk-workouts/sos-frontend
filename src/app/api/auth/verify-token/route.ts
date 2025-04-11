import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
// import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");

    const token = cookieHeader
      ?.split("; ")
      .find((cookie) => cookie.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token) {
      console.log("❌ No token provided!");
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    const decoded = verifyToken(token);
    console.log(decoded);
    if (!decoded) {
      console.log("❌ Invalid token!");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json({ userId: decoded.id, token });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
