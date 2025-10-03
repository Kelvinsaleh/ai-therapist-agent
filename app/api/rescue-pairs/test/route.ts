import { NextRequest, NextResponse } from 'next/server';

// Test endpoint for rescue pairs anonymous matching
export async function GET(req: NextRequest) {
  try {
    const testData = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      features: {
        anonymousMatching: true,
        chatEnabled: true,
        identityReveal: true,
        communicationAllowed: true,
      },
      backend: {
        url: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'Not Set',
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Rescue pairs anonymous matching system is configured',
      data: testData
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Rescue pairs test endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Test anonymous match creation
export async function POST(req: NextRequest) {
  try {
    const { isAnonymous, preference } = await req.json();

    // Simulate anonymous match creation
    const mockMatch = {
      _id: `test_match_${Date.now()}`,
      user1Id: {
        _id: 'test_user_1',
        name: 'Test User 1',
        email: 'test1@example.com'
      },
      user2Id: {
        _id: 'test_user_2',
        name: isAnonymous ? undefined : 'Test User 2',
        email: 'test2@example.com'
      },
      status: 'pending',
      isAnonymous: isAnonymous || false,
      anonymousId: isAnonymous ? `anon_${Date.now()}_${Math.random().toString(36).substr(2, 4)}` : undefined,
      chatEnabled: false,
      revealIdentity: false,
      compatibilityScore: Math.floor(Math.random() * 20) + 80, // 80-100%
      sharedChallenges: ['Anxiety', 'Stress Management'],
      complementaryGoals: ['Mindfulness', 'Better Sleep'],
      communicationStyle: 'supportive',
      experienceLevel: 'intermediate',
      trustLevel: 9,
      emergencySupport: true,
      createdAt: new Date().toISOString(),
      acceptedAt: null
    };

    return NextResponse.json({
      success: true,
      message: `Test ${isAnonymous ? 'anonymous' : 'revealed'} match created successfully`,
      data: mockMatch
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test match creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}