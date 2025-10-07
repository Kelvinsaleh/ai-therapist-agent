import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const res = await fetch(`${BACKEND_API_URL}/chat/sessions/${sessionId}/history`, { 
      cache: "no-store",
      headers: {
        Authorization: req.headers.get("authorization") || "",
        ...(process.env.BACKEND_API_KEY ? { "x-api-key": process.env.BACKEND_API_KEY } : {}),
      }
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}
