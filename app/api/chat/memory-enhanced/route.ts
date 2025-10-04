import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = "https://hope-backend-2.onrender.com";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId, context, suggestions, userMemory } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    console.log("Memory-enhanced chat request:", { message, userId, sessionId });

    const res = await fetch(`${BACKEND_API_URL}/memory-enhanced-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") || "",
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
      console.error("Backend memory-enhanced chat failed:", { status: res.status, error: errorData });
      return NextResponse.json(
        { 
          error: errorData.error || "Failed to process memory-enhanced message",
          details: errorData 
        }, 
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("Memory-enhanced chat response:", data);
    
    // Ensure we have a proper response format
    if (!data.response && !data.message && !data.content) {
      console.error("Invalid response format from backend:", data);
      return NextResponse.json(
        { error: "Invalid response format from AI service" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Memory-enhanced chat error:", error);
    return NextResponse.json(
      { error: "Failed to process memory-enhanced message" },
      { status: 500 }
    );
  }
}
