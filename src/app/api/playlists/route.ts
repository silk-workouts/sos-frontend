import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import pool from "@/lib/db";

// ✅ Middleware: Extract user ID from headers
const authenticateUser = (req: NextRequest) => {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return { error: "Unauthorized: Missing user authentication", status: 401 };
  }
  return { userId };
};

// ✅ Fetch all playlists (GET)
export async function GET(req: NextRequest) {
  // 🔒 Require authentication for GET requests
  const auth = authenticateUser(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { userId } = auth;

  try {
    // ✅ Fetch only the playlists that belong to the authenticated user
    const [rows] = await pool.execute(
      "SELECT id, user_id, title, description, created_at FROM playlists WHERE user_id = ?",
      [userId],
    );

    return NextResponse.json({ playlists: rows });
  } catch (error) {
    console.error("❌ Failed to fetch playlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 },
    );
  }
}

// ✅ Create a new playlist (POST)
export async function POST(req: NextRequest) {
  // 🔒 Require authentication for POST requests
  const auth = authenticateUser(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { userId } = auth;
  const { title, description } = await req.json();

  if (!title) {
    return NextResponse.json(
      { error: "Playlist title is required" },
      { status: 400 },
    );
  }

  const playlistId = randomUUID(); // ✅ Generate UUID

  try {
    await pool.execute(
      "INSERT INTO playlists (id, user_id, title, description) VALUES (?, ?, ?, ?)",
      [playlistId, userId, title, description || null],
    );

    return NextResponse.json({
      message: "✅ Playlist created successfully",
      playlistId,
    });
  } catch (error) {
    console.error("❌ Failed to create playlist:", error);
    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 },
    );
  }
}
