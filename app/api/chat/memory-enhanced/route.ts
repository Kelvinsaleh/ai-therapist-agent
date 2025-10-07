import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3002";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId, context, suggestions, userMemory } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    console.log('Calling backend for real AI processing:', message);
    
    // Call the backend for real AI processing
    const backendResponse = await fetch(`${BACKEND_API_URL}/memory-enhanced-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || 'Bearer test-token'
      },
      body: JSON.stringify({
        message,
        sessionId,
        userId,
        context,
        suggestions,
        userMemory
      })
    });

    if (!backendResponse.ok) {
      console.error('Backend error:', backendResponse.status, backendResponse.statusText);
      return NextResponse.json(
        { 
          error: "AI service temporarily unavailable. Please try again in a moment.",
          message: `Backend error: ${backendResponse.status} ${backendResponse.statusText}`
        },
        { status: 500 }
      );
    }

    const backendData = await backendResponse.json();
    console.log('Backend response received:', backendData);

    if (backendData.success) {
      // Convert backend response to frontend format
      const frontendResponse = {
        response: backendData.response,
        techniques: backendData.suggestions || [],
        breakthroughs: [],
        moodAnalysis: {
          current: 3,
          trend: "AI analysis",
          triggers: []
        },
        personalizedSuggestions: backendData.suggestions || [],
        success: true,
        sessionId: backendData.sessionId || sessionId,
        memoryContext: backendData.memoryContext || {
          hasJournalEntries: false,
          meditationHistory: false,
          hasMoodData: false,
          lastUpdated: new Date().toISOString()
        }
      };
      
      return NextResponse.json(frontendResponse, { status: 200 });
    } else {
      return NextResponse.json(
        { 
          error: backendData.error || "AI service temporarily unavailable",
          message: backendData.message || "Unknown error occurred"
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        error: "AI service temporarily unavailable. Please try again in a moment.",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    );
  }
}