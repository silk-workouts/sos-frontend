// app/api/chapters/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

interface Chapter {
  id: number;
  title: string;
  start_time: number;
  duration: number | null;
  continuous_vimeo_id: string;
  real_vimeo_video_id: string | null;
}

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const continuousVimeoId = searchParams.get("continuous_vimeo_id");

  if (!continuousVimeoId) {
    return NextResponse.json(
      { error: "Missing required parameter: continuous_vimeo_id" },
      { status: 400 }
    );
  }

  try {
    const [rows] = await pool.execute(
      `
      SELECT id, title, start_time, duration, continuous_vimeo_id, real_vimeo_video_id
      FROM chapters
      WHERE continuous_vimeo_id = ?
      ORDER BY start_time ASC;
      `,
      [continuousVimeoId]
    );

    const chapters = rows as Chapter[];

    return NextResponse.json(chapters, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching chapters:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapters." },
      { status: 500 }
    );
  }
}
