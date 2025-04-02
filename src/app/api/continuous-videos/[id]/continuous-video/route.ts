import { NextResponse, NextRequest } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const continuous_video_id = req.nextUrl.pathname.split("/").slice(-2, -1)[0];

  if (!continuous_video_id) {
    return NextResponse.json(
      { error: "Missing continuous_video_id in URL" },
      { status: 400 }
    );
  }

  try {
    // Get video metadata (title + optional description)
    const [metaRows] = await pool.execute(
      `
      SELECT 
        continuous_video_id, 
        continuous_video_title,
        (
          SELECT description
          FROM video_mappings AS vm
          WHERE vm.continuous_video_id = video_mappings.continuous_video_id
            AND vm.description IS NOT NULL
          ORDER BY created_at ASC
          LIMIT 1
        ) AS description,
        (
          SELECT video_description
          FROM video_mappings AS vm
          WHERE vm.continuous_video_id = video_mappings.continuous_video_id
            AND vm.video_description IS NOT NULL
          ORDER BY created_at ASC
          LIMIT 1
        ) AS video_description
      FROM video_mappings
      WHERE continuous_video_id = ?
      LIMIT 1
      `,
      [continuous_video_id]
    );

    // if ((metaRows as any[]).length === 0) {
    //   return NextResponse.json(
    //     { error: "Continuous video not found" },
    //     { status: 404 }
    //   );
    // }

    const continuousVideo = (metaRows as any[])[0];

    // Get all chapters
    const [chapterRows] = await pool.execute(
      `
      SELECT
        id,
        chapter_id,
        chapter_title,
        corresponding_video_title,
        real_vimeo_video_id,
        video_description,
        thumbnail_url,
        created_at
      FROM video_mappings
      WHERE continuous_video_id = ?
      ORDER BY id ASC
      `,
      [continuous_video_id]
    );

    return NextResponse.json({
      continuousVideo,
      chapters: chapterRows,
    });
  } catch (error) {
    console.error("❌ Error fetching continuous video:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
