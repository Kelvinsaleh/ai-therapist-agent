import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Call the backend to verify the token
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
    
    if (userData.success && userData.data) {
      return NextResponse.json({
        isAuthenticated: true,
        user: {
          id: userData.data._id || userData.data.id,
          name: userData.data.name,
          email: userData.data.email,
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
