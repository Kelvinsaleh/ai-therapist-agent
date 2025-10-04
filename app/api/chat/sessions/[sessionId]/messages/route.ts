import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await req.json();

    console.log("Chat message request:", { sessionId, message: body.message });

    const res = await fetch(`${BACKEND_API_URL}/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") || "",
      },
      body: JSON.stringify({
        ...body,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Backend chat message failed:", { status: res.status, error: errorData });
      return NextResponse.json(
        { 
          error: errorData.error || "Failed to send message",
          details: errorData 
        }, 
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("Chat message response:", data);
    
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
    console.error("Chat message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
