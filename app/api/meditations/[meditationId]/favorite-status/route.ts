import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export async function GET(req: NextRequest, { params }: { params: { meditationId: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    
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

    const response = await fetch(`${BACKEND_API_URL}/meditations/${meditationId}/favorite-status`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to check favorite status' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error checking favorite status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check favorite status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
