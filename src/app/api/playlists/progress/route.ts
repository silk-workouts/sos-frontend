import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// ✅ Middleware: Extract user ID from headers
const authenticateUser = (req: NextRequest) => {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return { error: "Unauthorized: Missing user authentication", status: 401 };
  }
  return { userId };
};

// ✅ Fetch last watched video & progress for a playlist (GET)
// ✅ Fetch last watched video progress (GET)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const playlistId = searchParams.get("playlist_id");

    if (!playlistId) {
      return NextResponse.json(
        { error: "Missing playlist_id" },
        { status: 400 }
      );
    }

    const auth = authenticateUser(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { userId } = auth;

    console.log(
      `🔎 Fetching last watched video for user ${userId} in playlist ${playlistId}...`
    );

    // ✅ Retrieve the most recently updated progress entry
    const [progressRows] = (await pool.execute(
      `SELECT video_id, progress_seconds 
       FROM playlist_video_progress 
       WHERE user_id = ? AND playlist_id = ? 
       ORDER BY updated_at DESC 
       LIMIT 1`,
      [userId, playlistId]
    )) as [Array<any>, any];

    if (!progressRows.length) {
      console.log("🚫 No progress found for this playlist.");
      return NextResponse.json({
        message: "No progress found",
        video_id: null,
        progress_seconds: 0,
      });
    }

    console.log(
      `✅ Found progress: Video ${progressRows[0].video_id}, Time ${progressRows[0].progress_seconds} sec`
    );

    return NextResponse.json({
      video_id: progressRows[0].video_id,
      progress_seconds: progressRows[0].progress_seconds,
    });
  } catch (error) {
    console.error(`❌ Failed to fetch progress:`, error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

// ✅ Update progress for a video in a playlist (PUT)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { playlist_id, video_id, progress_seconds } = body;

    console.log("➡️ Received progress update request:", body);

    if (!playlist_id || !video_id || progress_seconds === undefined) {
      console.error("❌ Missing required fields", {
        playlist_id,
        video_id,
        progress_seconds,
      });
      return NextResponse.json(
        {
          error:
            "Missing required fields: playlist_id, video_id, progress_seconds",
        },
        { status: 400 }
      );
    }

    const auth = authenticateUser(req);
    if ("error" in auth) {
      console.error("❌ Authentication failed:", auth.error);
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { userId } = auth;

    console.log(
      `🔹 [API] User ${userId} updating progress for video ${video_id}: ${progress_seconds} sec`
    );

    // ✅ SQL query: Ensure progress is always updated
    const query = `
      INSERT INTO playlist_video_progress (user_id, playlist_id, video_id, progress_seconds)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        progress_seconds = VALUES(progress_seconds), 
        updated_at = NOW();
    `;

    const values = [userId, playlist_id, video_id, progress_seconds];

    console.log("🛠 Executing SQL:", query, values);

    const [result] = await pool.execute(query, values);
    console.log("✅ Progress updated in database:", result);

    return NextResponse.json({ message: "✅ Progress updated successfully" });
  } catch (error) {
    console.error(`❌ Failed to update progress:`, error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
