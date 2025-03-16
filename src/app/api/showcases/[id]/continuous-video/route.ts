import { NextResponse, NextRequest } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  // Extract vimeo_showcase_id from the URL path
  const vimeo_showcase_id = req.nextUrl.pathname.split("/").slice(-2, -1)[0];

  if (!vimeo_showcase_id) {
    return NextResponse.json(
      { error: "Missing showcase_id in URL" },
      { status: 400 }
    );
  }

  try {
    // First, look up internal showcase.id using vimeo_showcase_id
    const [showcases] = await pool.execute(
      "SELECT id FROM showcases WHERE vimeo_showcase_id = ?",
      [vimeo_showcase_id]
    );

    if ((showcases as any[]).length === 0) {
      return NextResponse.json(
        { error: "Showcase not found for given Vimeo Showcase ID" },
        { status: 404 }
      );
    }

    const showcase_id = (showcases as any[])[0].id;

    // Now look up continuous video using internal showcase_id
    const [rows] = await pool.execute(
      "SELECT continuous_vimeo_id, continuous_vimeo_title FROM showcases_continuous_videos WHERE showcase_id = ?",
      [showcase_id]
    );

    if ((rows as any[]).length === 0) {
      console.warn(
        `No continuous video found for showcase ID ${vimeo_showcase_id}`
      );
      return NextResponse.json(
        { error: "No continuous video found for this showcase" },
        { status: 404 }
      );
    }

    // Return the first (and only expected) continuous video
    return NextResponse.json((rows as any[])[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching continuous video:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
