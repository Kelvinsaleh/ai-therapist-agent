import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPremium = searchParams.get('isPremium');
    const limit = searchParams.get('limit') || '50';
    
    // Fetch from backend
    const backendUrl = 'https://hope-backend-2.onrender.com';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (isPremium !== null) params.append('isPremium', isPremium);
    params.append('limit', limit);

    const response = await fetch(`${backendUrl}/meditation?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      meditations: data.meditations || []
    });

  } catch (error) {
    console.error('Meditations error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to load meditations',
      meditations: []
    }, { status: 500 });
  }
}