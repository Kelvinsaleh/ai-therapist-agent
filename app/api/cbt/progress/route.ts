import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    // For now, return mock data since backend CBT endpoints may not exist yet
    // In production, this would fetch from the backend
    const mockProgress = {
      thoughtRecordsCompleted: 3,
      activitiesScheduled: 7,
      moodEntries: 12,
      relaxationSessions: 5,
      goalsAchieved: 2,
      weeklyStreak: 4,
      lastActivity: new Date().toISOString(),
      insights: [
        "You've been consistent with mood tracking this week",
        "Consider trying more thought records when feeling anxious",
        "Your relaxation practice is helping with sleep quality"
      ]
    };

    return NextResponse.json({
      success: true,
      progress: mockProgress
    });

  } catch (error) {
    console.error('CBT progress fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch CBT progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
