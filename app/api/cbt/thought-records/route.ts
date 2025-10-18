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
    const { situation, automaticThoughts, emotions, emotionIntensity, evidenceFor, evidenceAgainst, balancedThought, cognitiveDistortions } = body;

    // Validate required fields
    if (!situation || !automaticThoughts) {
      return NextResponse.json(
        { success: false, error: "Situation and automatic thoughts are required" },
        { status: 400 }
      );
    }

    // Return mock data for testing
    const mockThoughtRecord = {
      id: `thought-record-${Date.now()}`,
      userId: 'test-user-id',
      situation,
      automaticThoughts,
      emotions: emotions || [],
      emotionIntensity: emotionIntensity || 5,
      evidenceFor: evidenceFor || '',
      evidenceAgainst: evidenceAgainst || '',
      balancedThought: balancedThought || '',
      cognitiveDistortions: cognitiveDistortions || [],
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockThoughtRecord
    });

  } catch (error) {
    console.error("Error saving thought record:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to save thought record",
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

    // Return mock data for testing
    const mockThoughtRecords = [
      {
        id: 'thought-record-1',
        userId: 'test-user-id',
        situation: 'Had a disagreement with my boss',
        automaticThoughts: 'I always mess up everything',
        emotions: ['Anxious', 'Frustrated'],
        emotionIntensity: 8,
        evidenceFor: 'I made a mistake last week',
        evidenceAgainst: 'I\'ve been praised before',
        balancedThought: 'I made a mistake, but that doesn\'t mean I\'m terrible',
        cognitiveDistortions: ['All-or-nothing thinking'],
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockThoughtRecords
    });

  } catch (error) {
    console.error("Error fetching thought records:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch thought records",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}