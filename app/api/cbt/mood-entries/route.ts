import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Accept mock token for testing
    const token = authHeader.replace('Bearer ', '');
    if (token !== "mock-jwt-token-for-testing") {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { 
      score, 
      triggers, 
      copingStrategies, 
      thoughts, 
      situation, 
      cbtInsights,
      timestamp 
    } = body;

    // Validate required fields
    if (score === undefined || score === null) {
      return NextResponse.json(
        { success: false, error: "Mood score is required" },
        { status: 400 }
      );
    }

    // Return mock data for testing
    const mockMoodEntry = {
      id: `mood-entry-${Date.now()}`,
      userId: 'test-user-id',
      score,
      triggers: triggers || [],
      copingStrategies: copingStrategies || [],
      thoughts: thoughts || '',
      situation: situation || '',
      cbtInsights: cbtInsights || null,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockMoodEntry
    });

  } catch (error) {
    console.error("Error saving mood entry:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to save mood entry",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Accept mock token for testing
    const token = authHeader.replace('Bearer ', '');
    if (token !== "mock-jwt-token-for-testing") {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';
    const period = searchParams.get('period') || '30days';

    // Return mock data for testing
    const mockMoodEntries = [
      {
        id: 'mood-entry-1',
        userId: 'test-user-id',
        score: 3,
        triggers: ['Work stress', 'Relationship issues'],
        copingStrategies: ['Deep breathing', 'Talking to someone'],
        thoughts: 'I feel overwhelmed and like nothing is going right',
        situation: 'Having a difficult week at work and home',
        cbtInsights: {
          cognitiveDistortions: ['Catastrophizing'],
          suggestedChallenges: ['What evidence do you have for this?'],
          balancedThoughts: ['This is a challenging time, but I can handle it']
        },
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockMoodEntries
    });

  } catch (error) {
    console.error("Error fetching mood entries:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch mood entries",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
