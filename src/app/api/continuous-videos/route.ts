import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const [rows] = (await pool.execute(
      `
      SELECT 
        MIN(id) AS id,
        continuous_video_id,
        continuous_video_title,
        name,
        (
          SELECT description
          FROM video_mappings AS vm
          WHERE vm.continuous_video_id = video_mappings.continuous_video_id
            AND vm.description IS NOT NULL
          ORDER BY created_at ASC
          LIMIT 1
        ) AS description,
        MIN(thumbnail_url) AS thumbnail_url,
        MIN(created_at) AS created_at
      FROM video_mappings
      WHERE continuous_video_id IS NOT NULL
      GROUP BY continuous_video_id, continuous_video_title, name
      ORDER BY created_at ASC;
      `
    )) as [
      Array<{
        id: string;
        continuous_video_id: string;
        continuous_video_title: string;
        name: string;
        description: string | null;
        thumbnail_url: string;
        created_at: string;
      }>,
      any
    ];

    return NextResponse.json({ continuousVideos: rows });
  } catch (error) {
    console.error("❌ Failed to fetch continuous videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch continuous videos" },
      { status: 500 }
    );
  }
}
