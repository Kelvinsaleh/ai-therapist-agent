import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = "https://hope-backend-2.onrender.com";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId, context, suggestions, userMemory } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

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

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process memory-enhanced message" },
      { status: 500 }
    );
  }
}
