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
      `SELECT user_id, continuous_vimeo_id, title, description, video_count, duration, created_at
       FROM saved_programs
       WHERE user_id = ?`,
      [userId]
    );

    // 🔁 Remap DB response to camelCase for frontend consistency
    const transformed = (savedPrograms as any[]).map((program) => ({
      userId: program.user_id,
      continuousVideoId: program.continuous_vimeo_id,
      title: program.title,
      description: program.description,
      videoCount: program.video_count,
      duration: program.duration,
      createdAt: program.created_at,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("❌ Error fetching saved programs:", error);
    return NextResponse.json(
      { error: "Error fetching programs" },
      { status: 500 }
    );
  }
}

/** ✅ POST: Save a new continuous video program */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const { continuousVideoId, title, description, videoCount, duration } =
      await req.json();

    if (!userId || !continuousVideoId?.trim() || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await pool.execute(
      `INSERT INTO saved_programs (user_id, continuous_vimeo_id, title, description, video_count, duration)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, continuousVideoId, title, description, videoCount, duration]
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
