import { NextRequest, NextResponse } from "next/server";

const RETRIES = 1;
const TIMEOUT_MS = 20000;

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;
  try {
    const res = await fetch(`${BACKEND_API_URL}/chat/sessions/${sessionId}`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch chat session" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const doFetch = async (): Promise<Response> => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        return await fetch(`${BACKEND_API_URL}/chat/sessions/${sessionId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(process.env.BACKEND_API_KEY ? { "x-api-key": process.env.BACKEND_API_KEY } : {}),
          },
          body: JSON.stringify({ message }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(id);
      }
    };

    let response = await doFetch();
    if (response.status >= 500) {
      for (let i = 0; i < RETRIES; i++) {
        await new Promise(r => setTimeout(r, 600));
        response = await doFetch();
        if (response.ok || response.status < 500) break;
      }
    }

    const ct = response.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return NextResponse.json({ error: 'Upstream returned non-JSON' }, { status: 502 });
    }
    let data: any;
    try {
      data = await response.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON from upstream' }, { status: 502 });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
