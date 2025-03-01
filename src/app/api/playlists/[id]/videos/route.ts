import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// ✅ Middleware: Extract and validate user ID from headers
const authenticateUser = (req: NextRequest) => {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return { error: 'Unauthorized: Missing user authentication', status: 401 };
  }
  return { userId };
};

// ✅ Add a video to a playlist (POST)
export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const auth = authenticateUser(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { userId } = auth;

    const playlistId = context.params.id;
    const { vimeo_video_id, position } = await req.json();

    if (!playlistId || !vimeo_video_id) {
      return NextResponse.json({
        status: 400,
        message: 'Playlist ID and Vimeo Video ID are required',
      });
    }

    // ✅ Ensure vimeo_video_id is strictly numeric
    if (!/^\d+$/.test(vimeo_video_id)) {
      return NextResponse.json({
        status: 400,
        message: 'Invalid Vimeo Video ID format',
      });
    }

    // ✅ Check if playlist exists and belongs to the user
    const [playlistRows] = (await pool.execute(
      `SELECT user_id FROM playlists WHERE id = ?`,
      [playlistId]
    )) as [Array<{ user_id: string }>, any];

    if (!playlistRows.length) {
      return NextResponse.json({
        status: 404,
        message: 'Playlist not found or has been deleted',
      });
    }

    if (playlistRows[0].user_id !== userId) {
      return NextResponse.json({
        status: 403,
        message: 'Forbidden: You do not own this playlist',
      });
    }

    // ✅ Validate vimeo_video_id exists in `videos` table
    const [videoRows] = (await pool.execute(
      `SELECT id FROM videos WHERE CAST(vimeo_video_id AS CHAR) = ?`,
      [vimeo_video_id]
    )) as [Array<{ id: number }>, any];

    if (!videoRows.length) {
      return NextResponse.json({
        status: 400,
        message: 'Invalid Vimeo Video ID: Video does not exist in our database',
      });
    }

    // ✅ Get the actual internal video_id
    const video_id = videoRows[0].id;

    // ✅ Check if the video is already in the playlist
    const [existingVideo] = (await pool.execute(
      `SELECT video_id FROM playlist_videos WHERE playlist_id = ? AND video_id = ?`,
      [playlistId, video_id]
    )) as [Array<{ video_id: number }>, any];

    if (existingVideo.length > 0) {
      return NextResponse.json({
        status: 409, // HTTP 409 Conflict
        message: 'Duplicate Video: This video is already in the playlist',
      });
    }

    // ✅ Determine position if not provided
    let finalPosition = position;
    if (finalPosition === undefined) {
      const [maxPositionRows] = (await pool.execute(
        `SELECT COALESCE(MAX(position), 0) + 1 AS next_position FROM playlist_videos WHERE playlist_id = ?`,
        [playlistId]
      )) as [Array<{ next_position: number }>, any];

      finalPosition = maxPositionRows[0].next_position;
    }

    // ✅ Shift existing videos down if inserting at a specific position
    await pool.execute(
      `UPDATE playlist_videos SET position = position + 1 WHERE playlist_id = ? AND position >= ?`,
      [playlistId, finalPosition]
    );

    // ✅ Insert video into playlist with correct position
    await pool.execute(
      `INSERT INTO playlist_videos (playlist_id, video_id, position)
       VALUES (?, ?, ?)`,
      [playlistId, video_id, finalPosition]
    );

    return NextResponse.json({
      status: 200,
      message: '✅ Video added to playlist successfully',
    });
  } catch (error) {
    console.error('❌ Failed to add video to playlist:', error);
    return NextResponse.json({
      status: 500,
      message: 'Failed to add video to playlist',
    });
  }
}
