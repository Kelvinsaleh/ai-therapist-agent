import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
      });
    }

    const token = authHeader.substring(7);

    const backendResponse = await fetch('https://hope-backend-2.onrender.com/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
      });
    }

    const userData = await backendResponse.json();
    
    if (userData.success && userData.user) {
      return NextResponse.json({
        isAuthenticated: true,
        user: {
          id: userData.user._id || userData.user.id,
          name: userData.user.name,
          email: userData.user.email,
          createdAt: userData.user.createdAt,
          updatedAt: userData.user.updatedAt,
        },
      });
    }

    return NextResponse.json({
      isAuthenticated: false,
      user: null,
    });

  } catch (error) {
    console.error("Error getting auth session:", error);
    return NextResponse.json({
      isAuthenticated: false,
      user: null,
    });
  }
}
