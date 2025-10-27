import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://hope-backend-2.onrender.com';

// Helper function to get auth token
function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// GET /api/community/spaces
export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api/community/', '');
  
  try {
    const token = getAuthToken(request);
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BACKEND_API_URL}/community/${path}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Community API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch community data' },
      { status: 500 }
    );
  }
}

// POST /api/community/*
export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const path = pathname.replace('/api/community/', '');
  
  try {
    const body = await request.json();
    const token = getAuthToken(request);
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_API_URL}/community/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Community API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process community request' },
      { status: 500 }
    );
  }
}
