import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const showcaseId = req.nextUrl.pathname.split("/").pop();

  if (!showcaseId) {
    console.error("❌ Showcase ID is missing.");
    return NextResponse.json(
      { error: "Showcase ID is required" },
      { status: 400 },
    );
  }

  try {
    // ✅ Fetch showcase details
    const [showcaseRows] = (await pool.execute(
      `SELECT id, vimeo_showcase_id, name, description, thumbnail_url, vimeo_link, created_at 
       FROM showcases 
       WHERE vimeo_showcase_id = ?`,
      [showcaseId],
    )) as [
      Array<{
        id: string;
        vimeo_showcase_id: string;
        name: string;
        description: string;
        thumbnail_url: string;
        vimeo_link: string;
        created_at: string;
      }>,
      any,
    ];

    if (!showcaseRows || showcaseRows.length === 0) {
      console.warn(`⚠️ No showcase found with ID: ${showcaseId}`);
      return NextResponse.json(
        { error: "Showcase not found" },
        { status: 404 },
      );
    }

    const showcase = showcaseRows[0];

    // ✅ Fetch associated videos, sorted by position
    const [videoRows] = (await pool.execute(
      `
      SELECT v.id, v.vimeo_video_id, v.title, v.description, v.thumbnail_url, v.duration, v.created_at, sv.position
      FROM videos v
      JOIN showcase_videos sv
      ON v.vimeo_video_id = sv.vimeo_video_id
      WHERE sv.vimeo_showcase_id = ?
      ORDER BY sv.position ASC;
      `,
      [showcaseId],
    )) as [Array<any>, any];

    // ✅ Response
    return NextResponse.json({
      showcase,
      videos: videoRows,
    });
  } catch (error) {
    console.error(`❌ Failed to fetch showcase with ID ${showcaseId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch showcase" },
      { status: 500 },
    );
  }
}
