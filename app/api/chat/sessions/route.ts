import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${BACKEND_API_URL}/chat/sessions`, { 
      cache: "no-store",
      headers: {
        Authorization: req.headers.get("authorization") || "",
        ...(process.env.BACKEND_API_KEY ? { "x-api-key": process.env.BACKEND_API_KEY } : {}),
      }
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch chat sessions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const res = await fetch(`${BACKEND_API_URL}/chat/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
        ...(process.env.BACKEND_API_KEY ? { "x-api-key": process.env.BACKEND_API_KEY } : {}),
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 });
  }
}
