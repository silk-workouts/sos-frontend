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

    // ✅ Check if playlist exists
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

    // ✅ Check if user owns the playlist
    if (playlistRows[0].user_id !== userId) {
      return NextResponse.json({
        status: 403,
        message: 'Forbidden: You do not own this playlist',
      });
    }

    // ✅ Validate vimeo_video_id exists in `videos` table
    const [videoRows] = (await pool.execute(
      `SELECT id FROM videos WHERE vimeo_video_id = ?`,
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
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE position = VALUES(position);`,
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

// ✅ Remove a video from a playlist (DELETE)
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string; video_id: string } }
) {
  try {
    const auth = authenticateUser(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { userId } = auth;

    const { id: playlistId, video_id } = context.params;

    if (!playlistId || !video_id) {
      return NextResponse.json({
        status: 400,
        message: 'Playlist ID and Video ID are required',
      });
    }

    // ✅ Check if playlist exists
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

    // ✅ Check if user owns the playlist
    if (playlistRows[0].user_id !== userId) {
      return NextResponse.json({
        status: 403,
        message: 'Forbidden: You do not own this playlist',
      });
    }

    // ✅ Remove video from playlist
    await pool.execute(
      `DELETE FROM playlist_videos WHERE playlist_id = ? AND video_id = ?`,
      [playlistId, video_id]
    );

    return NextResponse.json({
      status: 200,
      message: '✅ Video removed from playlist successfully',
    });
  } catch (error) {
    console.error('❌ Failed to remove video from playlist:', error);
    return NextResponse.json({
      status: 500,
      message: 'Failed to remove video from playlist',
    });
  }
}

// ✅ Update video position in playlist (PATCH)
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string; video_id: string } }
) {
  try {
    const auth = authenticateUser(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { userId } = auth;

    const { id: playlistId, video_id } = context.params;
    const { position } = await req.json();

    if (!playlistId || !video_id || position === undefined) {
      return NextResponse.json({
        status: 400,
        message: 'Playlist ID, Video ID, and position are required',
      });
    }

    // ✅ Check if playlist exists
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

    // ✅ Check if user owns the playlist
    if (playlistRows[0].user_id !== userId) {
      return NextResponse.json({
        status: 403,
        message: 'Forbidden: You do not own this playlist',
      });
    }

    // ✅ Update video position in playlist
    await pool.execute(
      `UPDATE playlist_videos SET position = ? WHERE playlist_id = ? AND video_id = ?`,
      [position, playlistId, video_id]
    );

    return NextResponse.json({
      status: 200,
      message: '✅ Video position updated successfully',
    });
  } catch (error) {
    console.error('❌ Failed to update video position:', error);
    return NextResponse.json({
      status: 500,
      message: 'Failed to update video position',
    });
  }
}
