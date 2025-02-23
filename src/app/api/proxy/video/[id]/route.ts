import { NextRequest, NextResponse } from 'next/server';

const VIMEO_API_TOKEN = process.env.VIMEO_API_TOKEN;

export async function GET(
  request: NextRequest, // Unused, but here for consistency
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
    // Fetch video metadata from Vimeo API using the provided ID
    const vimeoResponse = await fetch(`https://api.vimeo.com/videos/${id}`, {
      headers: {
        Authorization: `Bearer ${VIMEO_API_TOKEN}`,
      },
    });

    if (!vimeoResponse.ok) {
      console.error(
        `❌ Failed to fetch video from Vimeo. Status: ${vimeoResponse.status}`
      );
      return NextResponse.json(
        { error: 'Failed to fetch video from Vimeo' },
        { status: vimeoResponse.status }
      );
    }

    const vimeoData = await vimeoResponse.json();

    // Find the best available MP4 playback URL
    const playbackFile = vimeoData.files?.find(
      (file: any) => file.type === 'video/mp4'
    );

    const playbackUrl = playbackFile?.link ?? null;

    if (!playbackUrl) {
      console.warn(`⚠️ No suitable playback URL found for video ID ${id}`);
      return NextResponse.json(
        { error: 'No playback URL found' },
        { status: 404 }
      );
    }

    console.log(`✅ Proxying video for ID ${id}: ${playbackUrl}`);

    // Proxy the video stream by redirecting to the playback URL
    return NextResponse.redirect(playbackUrl);
  } catch (error) {
    console.error(`❌ Failed to proxy video with ID ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to proxy video' },
      { status: 500 }
    );
  }
}
