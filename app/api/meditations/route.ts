import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement your meditation fetching logic here
    const meditations = [];
    
    return NextResponse.json({ meditations });
  } catch (error) {
    console.error('Meditations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}