import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const VIMEO_API_TOKEN = process.env.VIMEO_API_TOKEN;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  if (!id) {
    return NextResponse.json(
      { error: "Video ID is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch video metadata from the database (🎯 showcase_id removed)
    const [rows] = (await pool.execute(
      "SELECT id, vimeo_video_id, title, description, thumbnail_url, duration, created_at FROM videos WHERE vimeo_video_id = ?",
      [id]
    )) as [
      Array<{
        id: number;
        vimeo_video_id: string;
        title: string;
        description: string | null;
        thumbnail_url: string | null;
        duration: number;
        created_at: string;
      }>,
      any
    ];

    if (rows.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const video = rows[0];

    // Fetch playback URL from Vimeo API
    const vimeoResponse = await fetch(
      `https://api.vimeo.com/videos/${video.vimeo_video_id}`,
      {
        headers: { Authorization: `Bearer ${VIMEO_API_TOKEN}` },
      }
    );

    if (!vimeoResponse.ok) {
      console.error(
        `❌ Failed to fetch video from Vimeo. Status: ${vimeoResponse.status}`
      );
      return NextResponse.json(
        { error: "Failed to fetch video playback URL" },
        { status: 500 }
      );
    }

    const vimeoData = await vimeoResponse.json();

    // Extract only the necessary playback URL without exposing tokens
    const playbackFile = vimeoData.files?.find(
      (file: any) => file.type === "video/mp4"
    );
    const secureUrl = playbackFile?.link ?? null;

    if (!secureUrl) {
      console.warn(
        `⚠️ No suitable playback URL found for video ID ${video.vimeo_video_id}`
      );
    }

    // Return only the essential video data and a proxied playback endpoint
    return NextResponse.json({
      ...video,
      playbackUrl: secureUrl
        ? `/api/proxy/video/${video.vimeo_video_id}`
        : null,
    });
  } catch (error) {
    console.error(`❌ Failed to fetch video with ID ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 }
    );
  }
}
