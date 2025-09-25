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

    // Fix: Call /meditation instead of /meditation/sessions to get meditation library
    const response = await fetch(`${backendUrl}/meditation?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const meditations = data.meditations || data.data || [];
      
      // Transform the data to match frontend expectations
      const transformedMeditations = meditations.map((meditation: any) => ({
        id: meditation._id || meditation.id,
        title: meditation.title,
        description: meditation.description,
        duration: meditation.duration,
        audioUrl: meditation.audioUrl,
        category: meditation.category,
        isPremium: meditation.isPremium || false,
        tags: meditation.tags || [],
        createdAt: meditation.createdAt
      }));
      
      return NextResponse.json({
        success: true,
        meditations: transformedMeditations,
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