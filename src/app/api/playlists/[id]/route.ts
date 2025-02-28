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

// ✅ Fetch a single playlist and its videos (GET)
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const playlistId = context.params.id;
    const auth = authenticateUser(req);

    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { userId } = auth;

    // ✅ Check if the playlist exists and belongs to the user
    const [playlistRows] = (await pool.execute(
      `SELECT id, user_id, title, description, created_at 
       FROM playlists 
       WHERE id = ? AND user_id = ?`,
      [playlistId, userId]
    )) as [Array<any>, any];

    if (!playlistRows.length) {
      return NextResponse.json(
        { error: 'Playlist not found or access denied' },
        { status: 404 }
      );
    }

    const playlist = playlistRows[0];

    // ✅ Fetch associated videos (Fix: Use correct `video_id` mapping)
    const [videoRows] = (await pool.execute(
      `SELECT v.id, v.vimeo_video_id, v.title, v.description, v.thumbnail_url, v.duration, pv.position
       FROM playlist_videos pv
       JOIN videos v ON pv.video_id = v.id
       WHERE pv.playlist_id = ?
       ORDER BY pv.position ASC`,
      [playlistId]
    )) as [Array<any>, any];

    return NextResponse.json({
      playlist,
      videos: videoRows,
    });
  } catch (error) {
    console.error(`❌ Failed to fetch playlist ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    );
  }
}

// ✅ Update playlist details (PATCH)
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const playlistId = context.params.id;
    const auth = authenticateUser(req);

    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { userId } = auth;
    const body = await req.json();

    // ✅ Allow only `title` and `description` updates
    const allowedFields = ['title', 'description'];
    const updateFields: Record<string, string> = {};

    for (const key in body) {
      if (allowedFields.includes(key)) {
        updateFields[key] = body[key];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        {
          error:
            'Invalid fields. Only "title" and "description" can be updated.',
        },
        { status: 400 }
      );
    }

    // ✅ Ensure playlist belongs to user before updating
    const [existingRows] = (await pool.execute(
      `SELECT id FROM playlists WHERE id = ? AND user_id = ?`,
      [playlistId, userId]
    )) as [Array<any>, any];

    if (!existingRows.length) {
      return NextResponse.json(
        { error: 'Playlist not found or access denied' },
        { status: 404 }
      );
    }

    // ✅ Construct dynamic SQL update query
    const updateQuery = `
      UPDATE playlists
      SET ${Object.keys(updateFields)
        .map((field) => `${field} = ?`)
        .join(', ')}
      WHERE id = ? AND user_id = ?
    `;

    const values = [...Object.values(updateFields), playlistId, userId];

    await pool.execute(updateQuery, values);

    return NextResponse.json({
      message: '✅ Playlist updated successfully',
      playlistId,
    });
  } catch (error) {
    console.error(`❌ Failed to update playlist ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update playlist' },
      { status: 500 }
    );
  }
}

// ✅ Delete a playlist (DELETE)
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const playlistId = context.params.id;
    const auth = authenticateUser(req);

    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { userId } = auth;

    // ✅ Ensure the playlist belongs to the user before deleting
    const [existingRows] = (await pool.execute(
      `SELECT id FROM playlists WHERE id = ? AND user_id = ?`,
      [playlistId, userId]
    )) as [Array<any>, any];

    if (!existingRows.length) {
      return NextResponse.json(
        { error: 'Playlist not found or access denied' },
        { status: 404 }
      );
    }

    // ✅ Remove associated videos first (to prevent foreign key constraint issues)
    await pool.execute('DELETE FROM playlist_videos WHERE playlist_id = ?', [
      playlistId,
    ]);

    // ✅ Delete the playlist itself
    const [result] = await pool.execute('DELETE FROM playlists WHERE id = ?', [
      playlistId,
    ]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: '✅ Playlist deleted successfully',
      playlistId,
    });
  } catch (error) {
    console.error(`❌ Failed to delete playlist ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    );
  }
}
