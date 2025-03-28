import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const urlSegments = req.nextUrl.pathname.split("/");
    const continuousVideoId = urlSegments[urlSegments.length - 1]; // Extract from URL

    if (!userId || !continuousVideoId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await pool.execute(
      `DELETE FROM saved_programs WHERE user_id = ? AND continuous_vimeo_id = ?`,
      [userId, continuousVideoId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting saved program:", error);
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    );
  }
}
