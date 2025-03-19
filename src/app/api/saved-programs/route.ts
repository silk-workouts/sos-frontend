import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/** ✅ GET: Fetch all saved programs for the user */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const [savedPrograms] = await pool.query(
      `SELECT showcase_id AS showcaseId, title, description, video_count AS videoCount, duration
       FROM saved_programs
       WHERE user_id = ?`,
      [userId]
    );

    return NextResponse.json(savedPrograms);
  } catch (error) {
    console.error("Error fetching saved programs:", error);
    return NextResponse.json(
      { error: "Error fetching programs" },
      { status: 500 }
    );
  }
}

/** ✅ POST: Save a new program */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id"); // ✅ No conversion needed
    const { showcaseId, title, description, videoCount, duration } =
      await req.json();

    if (!userId || !showcaseId || !title) {
      console.error("❌ Missing required fields.");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await pool.execute(
      `INSERT INTO saved_programs (user_id, showcase_id, title, description, video_count, duration) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, showcaseId, title, description, videoCount, duration] // ✅ Keep userId as a string
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error saving program:", error);
    return NextResponse.json(
      { error: "Failed to save program" },
      { status: 500 }
    );
  }
}
