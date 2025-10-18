import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Accept mock token for testing
    const token = authHeader.replace('Bearer ', '');
    if (token !== "mock-jwt-token-for-testing") {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { 
      type, 
      data, 
      effectiveness, 
      moodBefore, 
      moodAfter 
    } = body;

    // Validate required fields
    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: "Activity type and data are required" },
        { status: 400 }
      );
    }

    // Return mock data for testing
    const mockActivity = {
      id: `cbt-activity-${Date.now()}`,
      userId: 'test-user-id',
      type,
      data,
      effectiveness: effectiveness || null,
      moodBefore: moodBefore || null,
      moodAfter: moodAfter || null,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockActivity
    });

  } catch (error) {
    console.error("Error saving CBT activity:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to save CBT activity",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';
    const type = searchParams.get('type');

    let url = `${BACKEND_API_URL}/cbt/activities?limit=${limit}&offset=${offset}`;
    if (type) {
      url += `&type=${type}`;
    }

    // Fetch from backend
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.user.token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || "Failed to fetch CBT activities" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error("Error fetching CBT activities:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch CBT activities",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
