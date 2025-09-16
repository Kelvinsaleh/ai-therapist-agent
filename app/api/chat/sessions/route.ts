import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = "https://hope-backend-2.onrender.com";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_API_URL}/chat/sessions`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch chat sessions" }, { status: 500 });
  }
}
