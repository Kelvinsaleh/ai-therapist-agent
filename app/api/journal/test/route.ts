import { NextRequest, NextResponse } from 'next/server';

// Test endpoint for journal functionality
export async function GET(req: NextRequest) {
  try {
    const testData = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      backend: {
        url: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'Not Set',
      },
      journal: {
        localStorageRemoved: true,
        cloudStorageOnly: true,
        requiresAuth: true,
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Journal system is configured for cloud storage only',
      data: testData
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Journal test endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Test journal entry creation
export async function POST(req: NextRequest) {
  try {
    const { title, content, mood, tags } = await req.json();

    if (!title || !content || !mood) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, content, mood' },
        { status: 400 }
      );
    }

    // Simulate journal entry creation
    const mockEntry = {
      _id: `test_${Date.now()}`,
      title,
      content,
      mood: parseInt(mood),
      tags: tags || [],
      createdAt: new Date().toISOString(),
      insights: [
        "🌟 This is a test journal entry",
        "📝 Content analysis would happen here",
        "🧠 AI insights would be generated"
      ],
      emotionalState: mood >= 4 ? "Positive mood" : "Neutral to low mood",
      keyThemes: ["Test Entry", "Development"],
      concerns: mood <= 2 ? ["Low mood detected"] : [],
      achievements: ["Created test entry"]
    };

    return NextResponse.json({
      success: true,
      message: 'Test journal entry created successfully',
      data: mockEntry
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test journal entry creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}