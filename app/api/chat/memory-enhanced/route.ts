import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId, userId, context, suggestions, userMemory } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    console.log(`Memory-enhanced chat request for user ${userId}:`, {
      message: message.substring(0, 100) + "...",
      sessionId,
      hasContext: !!context,
      suggestionsCount: suggestions?.length || 0,
      memoryDataPoints: userMemory ? 
        (userMemory.journalEntries?.length || 0) + 
        (userMemory.meditationHistory?.length || 0) + 
        (userMemory.moodPatterns?.length || 0) : 0
    });

    if (!BACKEND_API_URL) {
      return NextResponse.json(
        { error: "BACKEND_API_URL is not configured" },
        { status: 500 }
      );
    }

    // Send to your backend with memory context
    const response = await fetch(`${BACKEND_API_URL}/chat/memory-enhanced`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.get("Authorization") || "",
      },
      body: JSON.stringify({
        message,
        sessionId,
        userId,
        context,
        suggestions,
        userMemory,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Backend error:", error);
      return NextResponse.json(
        { error: error.error || "Failed to process memory-enhanced message" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Memory-enhanced response received:", {
      responseLength: data.response?.length || 0,
      insightsCount: data.insights?.length || 0,
      techniquesCount: data.techniques?.length || 0
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in memory-enhanced chat API:", error);
    return NextResponse.json(
      { error: "Failed to process memory-enhanced message" },
      { status: 500 }
    );
  }
}
