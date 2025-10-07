import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId, context, suggestions, userMemory } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Check for authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const res = await fetch(`${BACKEND_API_URL}/memory-enhanced-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        ...(process.env.BACKEND_API_KEY ? { "x-api-key": process.env.BACKEND_API_KEY } : {}),
      },
      body: JSON.stringify({
        message,
        sessionId,
        userId,
        context,
        suggestions,
        userMemory,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: errorData.error || "Failed to process memory-enhanced message",
          fallbackResponse: "I'm here to support you. Please try again in a moment."
        }, 
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Memory-enhanced chat error:", error);
    return NextResponse.json(
      { 
        error: "Failed to process memory-enhanced message",
        fallbackResponse: "I'm here to support you. Please try again in a moment."
      },
      { status: 500 }
    );
  }
}
