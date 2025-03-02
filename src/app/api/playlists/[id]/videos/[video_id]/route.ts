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

// ✅ DELETE: Remove a video from a playlist
export async function DELETE(req: NextRequest) {
  try {
    const pathSegments = req.nextUrl.pathname.split('/');
    const playlistId = pathSegments[pathSegments.length - 3]; // Extract playlist ID
    const video_id = pathSegments[pathSegments.length - 1]; // Extract video ID

    if (!playlistId || !video_id) {
      return NextResponse.json({
        status: 400,
        message: 'Playlist ID and Video ID are required',
      });
    }

    const auth = authenticateUser(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { userId } = auth;

    // ✅ Check if playlist exists & belongs to the user
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

    // ✅ Retrieve current position of video
    const [videoRows] = (await pool.execute(
      `SELECT position FROM playlist_videos WHERE playlist_id = ? AND video_id = ?`,
      [playlistId, video_id]
    )) as [Array<{ position: number }>, any];

    if (!videoRows.length) {
      return NextResponse.json({
        status: 404,
        message: 'Video not found in playlist',
      });
    }

    const removedPosition = videoRows[0].position;

    // ✅ Delete video from playlist
    await pool.execute(
      `DELETE FROM playlist_videos WHERE playlist_id = ? AND video_id = ?`,
      [playlistId, video_id]
    );

    // ✅ Shift positions of remaining videos
    await pool.execute(
      `UPDATE playlist_videos SET position = position - 1 WHERE playlist_id = ? AND position > ?`,
      [playlistId, removedPosition]
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

// ✅ PATCH: Update video position in playlist
export async function PATCH(req: NextRequest) {
  try {
    const pathSegments = req.nextUrl.pathname.split('/');
    const playlistId = pathSegments[pathSegments.length - 3]; // Extract playlist ID
    const video_id = pathSegments[pathSegments.length - 1]; // Extract video ID

    if (!playlistId || !video_id) {
      return NextResponse.json({
        status: 400,
        message: 'Playlist ID and Video ID are required',
      });
    }

    const auth = authenticateUser(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { userId } = auth;
    const { position } = await req.json();

    if (position === undefined) {
      return NextResponse.json({
        status: 400,
        message: 'Position is required',
      });
    }

    // ✅ Check if playlist exists & belongs to the user
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

    // ✅ Retrieve current position of video
    const [videoRows] = (await pool.execute(
      `SELECT position FROM playlist_videos WHERE playlist_id = ? AND video_id = ?`,
      [playlistId, video_id]
    )) as [Array<{ position: number }>, any];

    if (!videoRows.length) {
      return NextResponse.json({
        status: 404,
        message: 'Video not found in playlist',
      });
    }

    const currentPosition = videoRows[0].position;

    if (currentPosition === position) {
      return NextResponse.json({
        status: 200,
        message: '✅ Video position unchanged',
      });
    }

    // ✅ Shift positions before updating
    if (position < currentPosition) {
      // Moving video up → shift down videos in the range
      await pool.execute(
        `UPDATE playlist_videos 
         SET position = position + 1 
         WHERE playlist_id = ? AND position >= ? AND position < ?`,
        [playlistId, position, currentPosition]
      );
    } else {
      // Moving video down → shift up videos in the range
      await pool.execute(
        `UPDATE playlist_videos 
         SET position = position - 1 
         WHERE playlist_id = ? AND position > ? AND position <= ?`,
        [playlistId, currentPosition, position]
      );
    }

    // ✅ Update video position
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
