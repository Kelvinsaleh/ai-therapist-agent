import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = "https://hope-backend-2.onrender.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, planId, planCode, amount, currency, userId, metadata, callback_url } = body;

    if (!email || !planId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment parameters' },
        { status: 400 }
      );
    }

    console.log("Payment initialization request with backend Paystack keys:", { 
      email, 
      planId, 
      planCode,
      amount, 
      currency,
      userId,
      callback_url: callback_url || `${req.nextUrl.origin}/payment/success`
    });

    const authHeader = req.headers.get('authorization');
    
    // Forward to backend
    const response = await fetch(`${BACKEND_API_URL}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify({
        email,
        planId,
        planCode,
        amount,
        currency: currency || 'USD',
        userId,
        metadata: {
          ...metadata,
          source: 'frontend',
          timestamp: new Date().toISOString()
        },
        callback_url: callback_url || `${req.nextUrl.origin}/payment/success`
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Backend payment initialization failed:", { status: response.status, error: errorData });
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || 'Payment initialization failed',
          details: errorData 
        }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Payment initialization response:", data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}