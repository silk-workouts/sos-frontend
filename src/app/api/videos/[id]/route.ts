import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: 'Video ID is required' },
      { status: 400 }
    );
  }

  try {
    const [rows] = (await pool.execute(
      'SELECT id, vimeo_video_id, title, description, thumbnail_url, duration, created_at FROM videos WHERE vimeo_video_id = ?',
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
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(`❌ Failed to fetch video with ID ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}
