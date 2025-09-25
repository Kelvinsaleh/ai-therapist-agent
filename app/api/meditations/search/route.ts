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
      // Return empty array if backend fails - no static fallback
      console.error('Backend meditation fetch failed:', response.status, response.statusText);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch meditations from database',
        meditations: []
      }, { status: response.status });
    }

  } catch (error) {
    console.error('Error fetching meditations:', error);
    
    // Return error response - no static fallback
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to meditation database',
        meditations: []
      },
      { status: 500 }
    );
  }
} 