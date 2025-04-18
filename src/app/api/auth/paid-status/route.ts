// /src/app/api/auth/paid-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { edgeDb } from "@/lib/edge-db";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");

    const token = cookieHeader
      ?.split("; ")
      .find((c) => c.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ isPaidUser: false }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ isPaidUser: false }, { status: 401 });
    }

    const result = await edgeDb.execute(
      "SELECT is_paid_user FROM users WHERE id = ?",
      [decoded.id]
    );

    const rows = (result as any).rows as { is_paid_user: number }[];
    const user = rows.length > 0 ? rows[0] : undefined;

    return NextResponse.json({ isPaidUser: Boolean(user?.is_paid_user) });
  } catch (err) {
    console.error("❌ Failed to get paid status:", err);
    return NextResponse.json({ isPaidUser: false }, { status: 500 });
  }
}
