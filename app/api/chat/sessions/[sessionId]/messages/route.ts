import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await req.json();

    // Check for authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const res = await fetch(`${BACKEND_API_URL}/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        ...(process.env.BACKEND_API_KEY ? { "x-api-key": process.env.BACKEND_API_KEY } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: errorData.error || "Failed to send message",
          fallbackResponse: "I'm here to support you. Please try again in a moment."
        }, 
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Chat message error:", error);
    return NextResponse.json(
      { 
        error: "Failed to send message",
        fallbackResponse: "I'm here to support you. Please try again in a moment."
      },
      { status: 500 }
    );
  }
}
