import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Execute the query and properly destructure the results
    const [rows] = (await pool.execute(
      "SELECT id FROM users WHERE verification_token = ?",
      [token],
    )) as [Array<{ id: number }>, any];

    const user = rows?.[0]; // Access the first row from the array

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 },
      );
    }

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
