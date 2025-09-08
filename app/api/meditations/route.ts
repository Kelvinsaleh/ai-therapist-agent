import { NextRequest, NextResponse } from 'next/server';
import { MEDITATION_TRACKS } from '@/lib/meditations/static-meditations';

export async function GET(request: NextRequest) {
  try {
    // Return static meditation tracks from backend
    // In production, this would come from your database
    const meditations = MEDITATION_TRACKS;

    return NextResponse.json({
      success: true,
      meditations,
    });

  } catch (error) {
    console.error('Error fetching meditations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meditations' },
      { status: 500 }
    );
  }
}
