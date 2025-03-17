import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { playlist_id, video_id, progress_seconds } = body;
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Upsert to avoid duplicates
    await pool.execute(
      `INSERT INTO playlist_video_progress (user_id, playlist_id, video_id, progress_seconds)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE progress_seconds = ?`,
      [userId, playlist_id, video_id, progress_seconds, progress_seconds]
    );

    return NextResponse.json({ message: "Progress updated successfully" });
  } catch (error) {
    console.error("Failed to update progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
