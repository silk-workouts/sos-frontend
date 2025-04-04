// src/app/api/get-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const email = url.searchParams.get("email");
    const userId = url.searchParams.get("id");

    if (!email && !userId) {
      return NextResponse.json(
        { error: "Email or ID is required" },
        { status: 400 }
      );
    }

    let query = "";
    let param: string;

    if (email) {
      query =
        "SELECT id, email, user_name, is_verified, age, location, gender, fitness_level FROM users WHERE email = ?";
      param = email;
    } else {
      query =
        "SELECT id, email, user_name, is_verified, age, location, gender, fitness_level FROM users WHERE id = ?";
      param = userId!;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(query, [param]);

    const user = rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(`Error in get-user:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
