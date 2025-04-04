import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId, name, age, gender, location, fitnessLevel } =
      await req.json();
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await pool.execute(
      "UPDATE users SET user_name = ?, age = ?, gender = ?, location = ?, fitness_level = ? WHERE id = ?",
      [name, age, gender, location, fitnessLevel, userId]
    );

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error: ${error}`);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
