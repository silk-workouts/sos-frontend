import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Execute the query and get the result
    const [rows] = (await pool.execute(
      "SELECT id FROM users WHERE verification_token = ?",
      [token],
    )) as [Array<{ id: string }>, any];

    // ✅ Extract the user correctly
    const user = rows?.[0]; // Access the first row

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 },
      );
    }

    // Update the user as verified and clear the token
    await pool.execute(
      "UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = ?",
      [token],
    );

    return NextResponse.json(
      { message: "User verified successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Error: ${error}`);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
