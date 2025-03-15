import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const [rows] = (await pool.execute(
      "SELECT id, vimeo_video_id, title, description, thumbnail_url, duration, created_at FROM videos",
    )) as [
      Array<{
        id: string;
        vimeo_video_id: string;
        title: string;
        description: string;
        thumbnail_url: string;
        duration: number;
        created_at: string;
      }>,
      any,
    ];

    return NextResponse.json({ videos: rows });
  } catch (error) {
    console.error("❌ Failed to fetch videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 },
    );
  }
}
