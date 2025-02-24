import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const [rows] = (await pool.execute(
      'SELECT id, vimeo_showcase_id, name, description, thumbnail_url, vimeo_link, created_at FROM showcases'
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
      any
    ];

    return NextResponse.json({ showcases: rows });
  } catch (error) {
    console.error('❌ Failed to fetch showcases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch showcases' },
      { status: 500 }
    );
  }
}
