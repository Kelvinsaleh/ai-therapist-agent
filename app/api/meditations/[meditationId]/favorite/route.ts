import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { meditationId: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    
    console.log('Favorites API - POST request received');
    console.log('Meditation ID:', params.meditationId);
    console.log('Auth header exists:', !!authHeader);
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    const { meditationId } = params;

    if (!meditationId) {
      return NextResponse.json(
        { success: false, error: 'Meditation ID is required' },
        { status: 400 }
      );
    }

    console.log('Making request to backend:', `${BACKEND_API_URL}/meditations/${meditationId}/favorite`);

    const response = await fetch(`${BACKEND_API_URL}/meditations/${meditationId}/favorite`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    console.log('Backend response status:', response.status);
    const data = await response.json();
    console.log('Backend response data:', data);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to add meditation to favorites' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error adding meditation to favorites:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add meditation to favorites',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { meditationId: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    
    console.log('Favorites API - DELETE request received');
    console.log('Meditation ID:', params.meditationId);
    console.log('Auth header exists:', !!authHeader);
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    const { meditationId } = params;

    if (!meditationId) {
      return NextResponse.json(
        { success: false, error: 'Meditation ID is required' },
        { status: 400 }
      );
    }

    console.log('Making request to backend:', `${BACKEND_API_URL}/meditations/${meditationId}/favorite`);

    const response = await fetch(`${BACKEND_API_URL}/meditations/${meditationId}/favorite`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    console.log('Backend response status:', response.status);
    const data = await response.json();
    console.log('Backend response data:', data);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to remove meditation from favorites' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error removing meditation from favorites:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove meditation from favorites',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
