import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Mock authentication for testing
    // In production, this would validate against your backend
    if (email === "test@example.com" && password === "testpassword123") {
      return NextResponse.json({
        success: true,
        user: {
          id: "test-user-id",
          email: email,
          name: "Test User",
          _id: "test-user-id"
        },
        token: "mock-jwt-token-for-testing"
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Authentication failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
