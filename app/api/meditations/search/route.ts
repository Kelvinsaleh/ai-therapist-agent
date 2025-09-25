import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const isPremium = searchParams.get('isPremium');

    // Call the backend to get meditation data
    const backendUrl = 'https://hope-backend-2.onrender.com';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (isPremium) params.append('isPremium', isPremium);

    const response = await fetch(`${backendUrl}/meditation/sessions?${params}`, {
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
        { success: false, error: 'Failed to fetch meditations' },
        { status: 500 }
      );
    }
  }
} 