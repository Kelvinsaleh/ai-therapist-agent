import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    // Validate backend JWT token
    if (token) {
      try {
        const response = await fetch(`${BACKEND_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            return NextResponse.json({
              isAuthenticated: true,
              user: {
                id: data.user._id || data.user.id,
                _id: data.user._id || data.user.id,
                name: data.user.name,
                email: data.user.email,
                createdAt: data.user.createdAt,
                updatedAt: data.user.updatedAt
              }
            });
          }
        }
      } catch (error) {
        console.error("Backend token validation error:", error);
        // Continue to NextAuth fallback
      }
    }
    
    // Fallback to NextAuth session
    const session = await getServerSession(authOptions);
    
    if (session?.user) {
      return NextResponse.json({
        isAuthenticated: true,
        user: session.user
      });
    } else {
      return NextResponse.json({
        isAuthenticated: false,
        user: null
      });
    }

  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { 
        isAuthenticated: false,
        user: null,
        error: "Session check failed"
      },
      { status: 500 }
    );
  }
}