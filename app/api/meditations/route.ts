import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Call the backend to get real meditation data
    const response = await fetch('https://hope-backend-2.onrender.com/meditation/sessions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        meditations: data.data || [],
      });
    } else {
      // Fallback to static data if backend fails
      const { MEDITATION_TRACKS } = await import('@/lib/meditations/static-meditations');
      return NextResponse.json({
        success: true,
        meditations: MEDITATION_TRACKS,
      });
    }

  } catch (error) {
    console.error('Error fetching meditations:', error);
    
    // Fallback to static data
    try {
      const { MEDITATION_TRACKS } = await import('@/lib/meditations/static-meditations');
      return NextResponse.json({
        success: true,
        meditations: MEDITATION_TRACKS,
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Failed to fetch meditations' },
        { status: 500 }
      );
    }
  }
}
