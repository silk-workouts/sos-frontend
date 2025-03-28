import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();

  if (!id) {
    console.error("❌ ID is missing.");
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    // 1. Get continuous video metadata
    type VideoRow = {
      id: number;
      continuous_video_id: string;
      continuous_video_title: string;
      name: string;
    } & RowDataPacket;

    const [videoRows] = await pool.execute<VideoRow[]>(
      `
      SELECT id, continuous_video_id, continuous_video_title, name
      FROM video_mappings
      WHERE continuous_video_id = ?
      LIMIT 1
    `,
      [id]
    );

    if (!videoRows || videoRows.length === 0) {
      return NextResponse.json(
        { error: "Continuous video not found" },
        { status: 404 }
      );
    }

    const continuousVideo = videoRows[0];
    const continuousVideoId = continuousVideo.continuous_video_id;

    // 2. Get all video_mappings for this continuous_video
    const [mappings] = await pool.execute(
      `
      SELECT 
        id,
        chapter_id,
        chapter_title,
        corresponding_video_title,
        real_vimeo_video_id,
        thumbnail_url,
        created_at
      FROM video_mappings
      WHERE continuous_video_id = ?
    `,
      [continuousVideoId]
    );

    // 3. Fetch all chapters for this continuous_video
    const [chapters] = await pool.execute(
      `
      SELECT 
        real_vimeo_video_id,
        start_time,
        duration
      FROM chapters
      WHERE continuous_vimeo_id = ?
        AND title NOT LIKE '%warmup%'
        AND title NOT LIKE '%cooldown%'
      ORDER BY id ASC
    `,
      [continuousVideoId]
    );

    // 4. Build map: real_vimeo_video_id → earliest start_time/duration
    const chapterMap = new Map<
      string,
      { start_time: number; duration: number | null }
    >();
    for (const ch of chapters as any[]) {
      if (!chapterMap.has(ch.real_vimeo_video_id)) {
        chapterMap.set(ch.real_vimeo_video_id, {
          start_time: ch.start_time,
          duration: ch.duration,
        });
      }
    }

    // 5. Merge data
    const enrichedMappings = (mappings as any[]).map((mapping) => {
      const timeData = chapterMap.get(mapping.real_vimeo_video_id) || {
        start_time: null,
        duration: null,
      };

      return {
        ...mapping,
        start_time: timeData.start_time,
        duration: timeData.duration,
      };
    });

    return NextResponse.json({
      continuousVideo,
      chapters: enrichedMappings,
    });
  } catch (error) {
    console.error(`❌ Failed to fetch continuous video with ID ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch continuous video" },
      { status: 500 }
    );
  }
}
